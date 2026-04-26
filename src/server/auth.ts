import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";
import { hashPassword, verifyPassword } from "./security/crypto";
import { signToken, verifyToken } from "./security/jwt";
import {
  checkRateLimit,
  recordFailedLogin,
  clearFailedLogins,
  isIpBlocked,
} from "./security/rate-limit";
import { logAudit } from "./security/audit";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

const COOKIE_NAME = "bt_admin_session";

// Seed admin user if not exists
let seeded = false;
async function seedAdmin() {
  if (seeded) return;
  const sql = getDb();
  const existing = await sql`SELECT id FROM admin_users WHERE email = 'blutech18@gmail.com'`;
  if (existing.length === 0) {
    const hash = await hashPassword("Blutech18@");
    await sql`INSERT INTO admin_users (email, password_hash) VALUES ('blutech18@gmail.com', ${hash})`;
  }
  seeded = true;
}

export const login = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSchema();
    await seedAdmin();

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";

    // Check if IP is blocked
    if (isIpBlocked(ip)) {
      await logAudit("login_blocked_ip", ip, data.email);
      return { ok: false as const, error: "Too many failed attempts. Try again later." };
    }

    // Rate limit check
    const limit = checkRateLimit(ip, "login");
    if (!limit.allowed) {
      await logAudit("login_rate_limited", ip, data.email);
      return { ok: false as const, error: "Too many attempts. Try again later." };
    }

    const sql = getDb();

    // Sanitize email input
    const email = data.email.toLowerCase().trim();

    const users = await sql`SELECT id, email, password_hash FROM admin_users WHERE email = ${email}`;
    if (users.length === 0) {
      recordFailedLogin(ip);
      await logAudit("login_failed_no_user", ip, email);
      // Generic error to prevent user enumeration
      return { ok: false as const, error: "Invalid credentials" };
    }

    const user = users[0];
    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) {
      const blocked = recordFailedLogin(ip);
      await logAudit("login_failed_wrong_password", ip, email);
      if (blocked) {
        return { ok: false as const, error: "Too many failed attempts. IP temporarily blocked." };
      }
      return { ok: false as const, error: "Invalid credentials" };
    }

    // Success — clear failed attempts, issue token
    clearFailedLogins(ip);
    const token = await signToken(user.id, user.email);

    setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    await logAudit("login_success", ip, email);
    return { ok: true as const, email: user.email };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  deleteCookie(COOKIE_NAME);
  await logAudit("logout", ip);
  return { ok: true };
});

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(COOKIE_NAME);
  if (!token) return { authenticated: false as const };

  const payload = await verifyToken(token);
  if (!payload) return { authenticated: false as const };

  return {
    authenticated: true as const,
    user: { id: payload.sub, email: payload.email },
  };
});

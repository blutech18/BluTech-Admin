import { getCookie } from "@tanstack/react-start/server";
import { verifyToken } from "./security/jwt";

const COOKIE_NAME = "bt_admin_session";

/**
 * Server-only auth helper used by server function handlers.
 */
export async function checkAuth() {
  const token = getCookie(COOKIE_NAME);
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyToken(token);
  if (!payload) throw new Error("Unauthorized");
  return { id: payload.sub, email: payload.email };
}

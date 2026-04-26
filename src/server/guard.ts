import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { verifyToken } from "./security/jwt";

const COOKIE_NAME = "bt_admin_session";

/**
 * Server function that checks auth and returns the user.
 * Call this at the top of any protected handler:
 *   const user = await checkAuth({});
 */
export const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(COOKIE_NAME);
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyToken(token);
  if (!payload) throw new Error("Unauthorized");
  return { id: payload.sub, email: payload.email };
});

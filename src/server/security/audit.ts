import { getDb } from "../db";

export async function logAudit(action: string, ip: string | null, details?: string) {
  try {
    const sql = getDb();
    await sql`INSERT INTO audit_log (action, ip, details) VALUES (${action}, ${ip}, ${details ?? null})`;
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}

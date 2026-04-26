import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";
import { checkAuth } from "./guard";

// Admin — list all commissions
export const getCommissions = createServerFn({ method: "GET" }).handler(async () => {
  await checkAuth();
  await ensureSchema();
  const sql = getDb();
  return await sql`SELECT * FROM commissions ORDER BY created_at DESC`;
});

// Admin — update commission status/notes
export const updateCommission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "reviewed", "accepted", "rejected", "completed"]),
        admin_notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    const rows = await sql`
      UPDATE commissions SET
        status = ${data.status},
        admin_notes = ${data.admin_notes ?? null},
        updated_at = now()
      WHERE id = ${data.id} RETURNING *
    `;
    if (rows.length === 0) return { ok: false as const, error: "Not found" };
    return { ok: true as const, commission: rows[0] };
  });

// Admin — delete commission
export const deleteCommission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    await sql`DELETE FROM commissions WHERE id = ${data.id}`;
    return { ok: true as const };
  });

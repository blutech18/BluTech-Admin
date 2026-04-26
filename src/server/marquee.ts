import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";
import { checkAuth } from "./guard";

const marqueeSchema = z.object({
  label: z.string().min(1).max(100),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

// Public
export const getPublicMarquee = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, label, sort_order FROM marquee_items
    WHERE is_active = true ORDER BY sort_order ASC
  `;
});

// Admin — list all
export const getMarqueeItems = createServerFn({ method: "GET" }).handler(async () => {
  await checkAuth();
  await ensureSchema();
  const sql = getDb();
  return await sql`SELECT * FROM marquee_items ORDER BY sort_order ASC, created_at DESC`;
});

// Admin — create
export const createMarqueeItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => marqueeSchema.parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    await ensureSchema();
    const sql = getDb();
    const rows = await sql`
      INSERT INTO marquee_items (label, sort_order, is_active)
      VALUES (${data.label}, ${data.sort_order}, ${data.is_active}) RETURNING *
    `;
    return { ok: true as const, item: rows[0] };
  });

// Admin — update
export const updateMarqueeItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(marqueeSchema).parse(input),
  )
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    const rows = await sql`
      UPDATE marquee_items SET label = ${data.label}, sort_order = ${data.sort_order},
        is_active = ${data.is_active}
      WHERE id = ${data.id} RETURNING *
    `;
    if (rows.length === 0) return { ok: false as const, error: "Not found" };
    return { ok: true as const, item: rows[0] };
  });

// Admin — delete
export const deleteMarqueeItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    await sql`DELETE FROM marquee_items WHERE id = ${data.id}`;
    return { ok: true as const };
  });

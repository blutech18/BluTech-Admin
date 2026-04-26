import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";
import { checkAuth } from "./guard";
import { sanitizeData, hasSqlInjection } from "./security/sanitize";

const serviceSchema = z.object({
  icon: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  tags: z.array(z.string().max(50)).max(10),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// Public — used by user site
export const getPublicServices = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT id, icon, title, description, tags, sort_order
    FROM services WHERE is_active = true ORDER BY sort_order ASC
  `;
  return rows;
});

// Admin — list all
export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  await checkAuth();
  await ensureSchema();
  const sql = getDb();
  return await sql`SELECT * FROM services ORDER BY sort_order ASC, created_at DESC`;
});

// Admin — create
export const createService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => serviceSchema.parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    await ensureSchema();
    const safe = sanitizeData(data);
    if (hasSqlInjection(`${safe.title} ${safe.description}`)) {
      return { ok: false as const, error: "Invalid input detected" };
    }
    const sql = getDb();
    const rows = await sql`
      INSERT INTO services (icon, title, description, tags, sort_order, is_active)
      VALUES (${safe.icon}, ${safe.title}, ${safe.description}, ${safe.tags}, ${safe.sort_order}, ${safe.is_active})
      RETURNING *
    `;
    return { ok: true as const, service: rows[0] };
  });

// Admin — update
export const updateService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(serviceSchema).parse(input),
  )
  .handler(async ({ data }) => {
    await checkAuth();
    const safe = sanitizeData(data);
    if (hasSqlInjection(`${safe.title} ${safe.description}`)) {
      return { ok: false as const, error: "Invalid input detected" };
    }
    const sql = getDb();
    const rows = await sql`
      UPDATE services SET
        icon = ${safe.icon}, title = ${safe.title}, description = ${safe.description},
        tags = ${safe.tags}, sort_order = ${safe.sort_order}, is_active = ${safe.is_active},
        updated_at = now()
      WHERE id = ${safe.id} RETURNING *
    `;
    if (rows.length === 0) return { ok: false as const, error: "Not found" };
    return { ok: true as const, service: rows[0] };
  });

// Admin — delete
export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    await sql`DELETE FROM services WHERE id = ${data.id}`;
    return { ok: true as const };
  });

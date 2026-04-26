import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";
import { checkAuth } from "./guard";
import { sanitizeData, hasSqlInjection } from "./security/sanitize";

const projectSchema = z.object({
  title: z.string().min(1).max(150),
  category: z.string().min(1).max(100),
  year: z.string().min(4).max(4),
  description: z.string().min(1).max(500),
  about: z.string().max(1000).default(""),
  stack: z.array(z.string().max(50)).max(10),
  gradient: z.string().max(100).default("from-sky-400 to-blue-600"),
  meta: z.string().max(100).default(""),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Public — featured projects (Showcase / Recent Projects)
export const getPublicFeaturedProjects = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, title, category, year, description, about, stack, gradient, meta
    FROM projects WHERE is_active = true AND is_featured = true
    ORDER BY sort_order ASC, created_at DESC
  `;
});

// Public — all projects (Complete Portfolio)
export const getPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, title, category, year, description, about, stack, gradient
    FROM projects WHERE is_active = true
    ORDER BY sort_order ASC, created_at DESC
  `;
});

// Admin — list all
export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  await checkAuth();
  await ensureSchema();
  const sql = getDb();
  return await sql`SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC`;
});

// Admin — create
export const createProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => projectSchema.parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    await ensureSchema();
    const safe = sanitizeData(data);
    if (hasSqlInjection(`${safe.title} ${safe.description} ${safe.about}`)) {
      return { ok: false as const, error: "Invalid input detected" };
    }
    const sql = getDb();
    const rows = await sql`
      INSERT INTO projects (title, category, year, description, about, stack, gradient, meta, is_featured, is_active, sort_order)
      VALUES (${safe.title}, ${safe.category}, ${safe.year}, ${safe.description}, ${safe.about},
              ${safe.stack}, ${safe.gradient}, ${safe.meta}, ${safe.is_featured}, ${safe.is_active}, ${safe.sort_order})
      RETURNING *
    `;
    return { ok: true as const, project: rows[0] };
  });

// Admin — update
export const updateProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(projectSchema).parse(input),
  )
  .handler(async ({ data }) => {
    await checkAuth();
    const safe = sanitizeData(data);
    if (hasSqlInjection(`${safe.title} ${safe.description} ${safe.about}`)) {
      return { ok: false as const, error: "Invalid input detected" };
    }
    const sql = getDb();
    const rows = await sql`
      UPDATE projects SET
        title = ${safe.title}, category = ${safe.category}, year = ${safe.year},
        description = ${safe.description}, about = ${safe.about}, stack = ${safe.stack},
        gradient = ${safe.gradient}, meta = ${safe.meta}, is_featured = ${safe.is_featured},
        is_active = ${safe.is_active}, sort_order = ${safe.sort_order}, updated_at = now()
      WHERE id = ${safe.id} RETURNING *
    `;
    if (rows.length === 0) return { ok: false as const, error: "Not found" };
    return { ok: true as const, project: rows[0] };
  });

// Admin — delete
export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await checkAuth();
    const sql = getDb();
    await sql`DELETE FROM projects WHERE id = ${data.id}`;
    return { ok: true as const };
  });

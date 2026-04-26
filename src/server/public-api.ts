/**
 * Public API endpoints — called by the user-facing site to fetch dynamic content.
 * No auth required. Rate limited.
 */
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { ensureSchema } from "./db/schema";

export const getPublicServices = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, icon, title, description, tags, sort_order
    FROM services WHERE is_active = true ORDER BY sort_order ASC
  `;
});

export const getPublicMarquee = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, label FROM marquee_items
    WHERE is_active = true ORDER BY sort_order ASC
  `;
});

export const getPublicFeaturedProjects = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, title, category, year, description, about, stack, gradient, meta
    FROM projects WHERE is_active = true AND is_featured = true
    ORDER BY sort_order ASC, created_at DESC
  `;
});

export const getPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const sql = getDb();
  return await sql`
    SELECT id, title, category, year, description, about, stack, gradient
    FROM projects WHERE is_active = true
    ORDER BY sort_order ASC, created_at DESC
  `;
});

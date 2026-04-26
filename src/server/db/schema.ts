/**
 * Database schema setup — creates all tables needed for the admin + user site.
 * Safe to run multiple times (IF NOT EXISTS).
 */
import { getDb } from "./index";

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  const sql = getDb();

  // Admin users table
  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Login attempts for brute-force protection
  await sql`CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip text NOT NULL,
    email text NOT NULL,
    success boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Services (What I Do section)
  await sql`CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    icon text NOT NULL DEFAULT 'Code2',
    title text NOT NULL,
    description text NOT NULL,
    tags text[] NOT NULL DEFAULT '{}',
    sort_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Marquee items (scrolling carousel)
  await sql`CREATE TABLE IF NOT EXISTS marquee_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label text NOT NULL,
    sort_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Projects (used for both Showcase / Recent Projects AND Complete Portfolio)
  await sql`CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    category text NOT NULL,
    year text NOT NULL,
    description text NOT NULL,
    about text NOT NULL DEFAULT '',
    stack text[] NOT NULL DEFAULT '{}',
    gradient text NOT NULL DEFAULT 'from-sky-400 to-blue-600',
    meta text NOT NULL DEFAULT '',
    is_featured boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Commissions table (already exists from user site, but ensure it's here)
  await sql`CREATE TABLE IF NOT EXISTS commissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    project_type text NOT NULL,
    budget text,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Add status/notes columns if they don't exist (for existing commissions table)
  await sql`DO $$ BEGIN
    ALTER TABLE commissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
    ALTER TABLE commissions ADD COLUMN IF NOT EXISTS admin_notes text;
    ALTER TABLE commissions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
  EXCEPTION WHEN OTHERS THEN NULL;
  END $$`;

  // Rate limit tracking
  await sql`CREATE TABLE IF NOT EXISTS rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip text NOT NULL,
    endpoint text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  // Security audit log
  await sql`CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    ip text,
    details text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  schemaReady = true;
}

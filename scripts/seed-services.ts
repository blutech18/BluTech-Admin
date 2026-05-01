/**
 * Seed script — populates the services table with full-stack engineer service cards.
 *
 * Run with: npx tsx scripts/seed-services.ts
 *
 * Requires DATABASE_URL in .env or .dev.vars
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config(); // load .env

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set. Add it to .env or .dev.vars");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const services = [
  {
    icon: "Code2",
    title: "Web Development",
    description:
      "High-performance React, Next.js & TanStack apps with smooth-as-silk interactions and pixel-perfect responsive layouts.",
    tags: ["React", "Next.js", "TanStack", "TypeScript", "Tailwind CSS"],
    sort_order: 1,
  },
  {
    icon: "Smartphone",
    title: "App Development",
    description:
      "Cross-platform mobile experiences in React Native and Expo — one codebase, native performance, ready for the App Store and Play Store.",
    tags: ["React Native", "Expo", "iOS", "Android"],
    sort_order: 2,
  },
  {
    icon: "Palette",
    title: "UI / UX Design",
    description:
      "Identity, interface, and motion design from the first wireframe to the final pixel. Design systems that scale with your brand.",
    tags: ["Figma", "Motion Design", "Design Systems", "Prototyping"],
    sort_order: 3,
  },
  {
    icon: "Server",
    title: "Backend & APIs",
    description:
      "Type-safe APIs, edge functions, and robust data models. From REST to tRPC, built to handle real-world traffic at scale.",
    tags: ["Node.js", "PostgreSQL", "tRPC", "Edge Functions", "Redis"],
    sort_order: 4,
  },
  {
    icon: "Globe",
    title: "Full-Stack Solutions",
    description:
      "End-to-end product engineering — from database schema to deployed frontend. One partner for your entire stack.",
    tags: ["React", "Node.js", "PostgreSQL", "Vercel", "Cloudflare"],
    sort_order: 5,
  },
  {
    icon: "Layers",
    title: "Database & Architecture",
    description:
      "Schema design, migrations, query optimization, and data modeling. Relational and NoSQL — whatever fits your product.",
    tags: ["PostgreSQL", "Drizzle", "Prisma", "MongoDB", "Neon"],
    sort_order: 6,
  },
  {
    icon: "Zap",
    title: "DevOps & Deployment",
    description:
      "CI/CD pipelines, containerization, edge deployments, and infrastructure as code. Ship fast, stay stable.",
    tags: ["Docker", "GitHub Actions", "Vercel", "Cloudflare Workers", "AWS"],
    sort_order: 7,
  },
  {
    icon: "Sparkles",
    title: "AI & Automation",
    description:
      "LLM integrations, agentic workflows, RAG pipelines, and smart automations that put your operations on autopilot.",
    tags: ["OpenAI", "LangChain", "RAG", "Workflows", "MCP"],
    sort_order: 8,
  },
];

async function seed() {
  console.log("🌱 Seeding services...\n");

  // Ensure table exists
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

  // Clear existing services
  await sql`DELETE FROM services`;
  console.log("  ✓ Cleared existing services");

  // Insert each service
  for (const s of services) {
    await sql`
      INSERT INTO services (icon, title, description, tags, sort_order, is_active)
      VALUES (${s.icon}, ${s.title}, ${s.description}, ${s.tags}, ${s.sort_order}, true)
    `;
    console.log(`  ✓ ${s.title}`);
  }

  console.log(`\n✅ Seeded ${services.length} services successfully!`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

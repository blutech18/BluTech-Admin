import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[DB] DATABASE_URL is not set!");
    throw new Error("DATABASE_URL not configured");
  }
  return neon(url);
}

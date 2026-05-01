/**
 * Input sanitization and attack detection for the admin side.
 */

// XSS sanitization — encode dangerous characters
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:\s*text\/html/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(/gi, "")
    .trim();
}

// SQL injection pattern detection (defense in depth)
const SQL_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|alter|create|exec|execute)\b.*\b(from|into|table|database|where)\b)/i,
  /(--|\/\*|\*\/|xp_|sp_)/i,
  /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
  /(char\s*\(|concat\s*\(|0x[0-9a-f]+)/i,
];

export function hasSqlInjection(input: string): boolean {
  return SQL_PATTERNS.some((p) => p.test(input));
}

// Fields that contain image data or raw values and should not be sanitized
const SKIP_FIELDS = new Set(["image_url", "proof_image_url", "transaction_date"]);

// Sanitize all string fields in an object
export function sanitizeData<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (SKIP_FIELDS.has(key)) continue; // skip image data — only used in <img src>
    const val = result[key];
    if (typeof val === "string") {
      (result as Record<string, unknown>)[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = val.map((v) =>
        typeof v === "string" ? sanitizeString(v) : v,
      );
    }
  }
  return result;
}

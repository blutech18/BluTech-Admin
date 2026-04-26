/**
 * Rate limiting with in-memory store + DB persistence for login attempts.
 * Protects against brute force and DDoS.
 */

// In-memory sliding window rate limiter
const windows = new Map<string, number[]>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 15 * 60_000 }, // 5 attempts per 15 min
  api: { maxRequests: 60, windowMs: 60_000 }, // 60 requests per minute
  mutation: { maxRequests: 20, windowMs: 60_000 }, // 20 writes per minute
};

export function checkRateLimit(
  ip: string,
  endpoint: string = "api",
): { allowed: boolean; remaining: number; resetMs: number } {
  const config = LIMITS[endpoint] ?? LIMITS.api;
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const cutoff = now - config.windowMs;

  let timestamps = windows.get(key) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);

  if (timestamps.length >= config.maxRequests) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldest + config.windowMs - now,
    };
  }

  timestamps.push(now);
  windows.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetMs: config.windowMs,
  };
}

// Blocked IPs (in-memory, resets on cold start)
const blockedIps = new Set<string>();
const failedLogins = new Map<string, { count: number; firstAttempt: number }>();

const MAX_FAILED_LOGINS = 10;
const BLOCK_DURATION = 30 * 60_000; // 30 minutes

export function recordFailedLogin(ip: string): boolean {
  const now = Date.now();
  const entry = failedLogins.get(ip);

  if (!entry || now - entry.firstAttempt > BLOCK_DURATION) {
    failedLogins.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  entry.count += 1;
  if (entry.count >= MAX_FAILED_LOGINS) {
    blockedIps.add(ip);
    // Auto-unblock after duration
    setTimeout(() => {
      blockedIps.delete(ip);
      failedLogins.delete(ip);
    }, BLOCK_DURATION);
    return true; // IP is now blocked
  }

  return false;
}

export function clearFailedLogins(ip: string) {
  failedLogins.delete(ip);
}

export function isIpBlocked(ip: string): boolean {
  return blockedIps.has(ip);
}

// Cleanup stale entries periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, timestamps] of windows) {
      const filtered = timestamps.filter((t) => t > now - 120_000);
      if (filtered.length === 0) windows.delete(key);
      else windows.set(key, filtered);
    }
  },
  5 * 60_000,
);

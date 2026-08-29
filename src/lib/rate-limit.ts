const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * In-Memory Token Bucket Rate Limiter
 * @param identifier IP or Tenant Identifier
 * @param limit Maximum requests allowed per window
 * @param windowMs Window duration in milliseconds (default 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count += 1;
  rateLimitMap.set(identifier, record);

  const allowed = record.count <= limit;
  const remaining = Math.max(0, limit - record.count);
  const resetMs = windowMs - (now - record.lastReset);

  return { allowed, remaining, resetMs };
}

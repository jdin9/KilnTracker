export type RateLimitResult = {
  success: boolean;
  retryAfterMs?: number;
};

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

function cleanup(key: string, now: number) {
  const entry = store.get(key);

  if (entry && entry.resetAt <= now) {
    store.delete(key);
  }
}

export function consumeRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanup(key, now);

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true };
  }

  if (entry.count >= config.limit) {
    return { success: false, retryAfterMs: entry.resetAt - now };
  }

  store.set(key, { ...entry, count: entry.count + 1 });
  return { success: true };
}

/**
 * Rate limiter simple en m\u00e9moire (in-process).
 * Suffisant pour 1 user solo + protection brute-force basique.
 * Cap sliding window.
 */

interface Entry {
  timestamps: number[];
}

const buckets = new Map<string, Entry>();

/**
 * @param key identifier (ip, user, endpoint)
 * @param limit max hits
 * @param windowMs sliding window
 * @returns true si OK (sous la limite), false si bloqu\u00e9
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const entry = buckets.get(key) || { timestamps: [] };

  // Sliding window : drop les timestamps expir\u00e9s
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    return false;
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);
  return true;
}

/**
 * Retourne les secondes avant reset pour un key donn\u00e9.
 */
export function getResetSeconds(key: string, windowMs: number): number {
  const entry = buckets.get(key);
  if (!entry || entry.timestamps.length === 0) return 0;
  const oldest = Math.min(...entry.timestamps);
  return Math.max(0, Math.ceil((oldest + windowMs - Date.now()) / 1000));
}

/**
 * Extract un identifiant client depuis request (IP, ou cookie session).
 */
export function getClientKey(req: Request, prefix = ""): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

// Cleanup p\u00e9riodique pour \u00e9viter leak m\u00e9moire
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function initCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      // Cleanup : si le dernier timestamp est vieux de > 1h, drop
      if (entry.timestamps.length === 0 || Math.max(...entry.timestamps) < now - 3600_000) {
        buckets.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

initCleanup();

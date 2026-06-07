interface RateLimitTracker {
  timestamps: number[]
}

const limiters = new Map<string, RateLimitTracker>()

export function checkRateLimit(
  socketId: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()

  if (!limiters.has(socketId)) {
    limiters.set(socketId, { timestamps: [now] })
    return true
  }

  const tracker = limiters.get(socketId)!

  tracker.timestamps = tracker.timestamps.filter(
    (time) => now - time < windowMs,
  )

  if (tracker.timestamps.length >= limit) {
    return false
  }

  tracker.timestamps.push(now)
  return true
}

export function clearRateLimitTracker(socketId: string) {
  limiters.delete(socketId)
}

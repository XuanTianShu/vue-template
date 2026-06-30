// Rate limit configuration - 5 minutes (300 seconds)
const RATE_LIMIT_MINUTES = 5
const RATE_LIMIT_MS = RATE_LIMIT_MINUTES * 60 * 1000
const STORAGE_KEY = 'last_post_timestamp'

/**
 * Check if user can post/comment (not within rate limit window)
 * @returns boolean - true if allowed to post, false if rate limited
 */
export function checkRateLimit(): boolean {
  const lastTimestamp = localStorage.getItem(STORAGE_KEY)
  
  if (!lastTimestamp) {
    return true
  }
  
  const lastTime = parseInt(lastTimestamp, 10)
  const now = Date.now()
  const timePassed = now - lastTime
  
  return timePassed >= RATE_LIMIT_MS
}

/**
 * Update the last post timestamp in localStorage
 */
export function updateLastPostTime(): void {
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
}

/**
 * Get remaining time until user can post again (in seconds)
 * @returns number - seconds remaining, 0 if can post
 */
export function getRemainingTime(): number {
  const lastTimestamp = localStorage.getItem(STORAGE_KEY)
  
  if (!lastTimestamp) {
    return 0
  }
  
  const lastTime = parseInt(lastTimestamp, 10)
  const now = Date.now()
  const timePassed = now - lastTime
  const remaining = RATE_LIMIT_MS - timePassed
  
  return Math.max(0, Math.ceil(remaining / 1000))
}
// Ограничение действует в одном процессе. Для нескольких экземпляров нужен общий store.
const attempts = new Map<string, { count: number; until: number }>()
export function allowLoginAttempt(key: string, now = Date.now()) {
  for (const [entry, value] of attempts) if (value.until <= now) attempts.delete(entry)
  const bucket = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 }
  if (bucket.count >= 10) return false
  bucket.count++
  attempts.set(key, bucket)
  return true
}
export function clearLoginAttempts(key: string) { attempts.delete(key) }

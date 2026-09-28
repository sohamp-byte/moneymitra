// Deterministic pseudo-random generator so seeded demo data is identical
// on every render, every user, and both server and client.
export function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function isoDaysAgo(days: number, base: Date = new Date()): string {
  const d = new Date(base)
  d.setHours(9, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function dayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function weekdayName(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long' })
}

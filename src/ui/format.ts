const PERCENT = ' %'

export function formatScore(score: number): string {
  return String(score).padStart(6, '0')
}

export function formatTime(seconds: number): string {
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** A share as a whole percentage; nothing to find counts as everything found. */
export function formatRatio(part: number, whole: number): string {
  return `${whole === 0 ? 100 : Math.round((part / whole) * 100)}${PERCENT}`
}

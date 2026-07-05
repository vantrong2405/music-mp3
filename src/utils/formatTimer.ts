export function formatTimer(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds - minutes * 60)
  return seconds < 10 ? `${minutes}:0${seconds}` : `${minutes}:${seconds}`
}

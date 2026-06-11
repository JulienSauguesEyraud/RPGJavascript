export function distanceFromPlayer(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

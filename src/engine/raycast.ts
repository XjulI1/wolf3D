import type { BlockTest } from './grid'
import type { Vec2 } from './types'

/** The first opaque cell met by a ray, and the distance travelled to its boundary. */
export type RayHit = { cell: Vec2; distance: number; side: 'x' | 'y' }

/** Walks the grid cell by cell (DDA) from `origin` along `angle`, up to `maxDistance`. */
export function castRay(origin: Vec2, angle: number, maxDistance: number, opaque: BlockTest): RayHit | null {
  const dirX = Math.cos(angle)
  const dirY = Math.sin(angle)
  const stepX = dirX < 0 ? -1 : 1
  const stepY = dirY < 0 ? -1 : 1
  const deltaX = Math.abs(1 / dirX)
  const deltaY = Math.abs(1 / dirY)
  let cellX = Math.floor(origin.x)
  let cellY = Math.floor(origin.y)
  let sideX = dirX === 0 ? Infinity : (dirX < 0 ? origin.x - cellX : cellX + 1 - origin.x) * deltaX
  let sideY = dirY === 0 ? Infinity : (dirY < 0 ? origin.y - cellY : cellY + 1 - origin.y) * deltaY

  for (;;) {
    const crossesX = sideX < sideY
    const distance = crossesX ? sideX : sideY
    if (distance > maxDistance) return null
    if (crossesX) {
      cellX += stepX
      sideX += deltaX
    } else {
      cellY += stepY
      sideY += deltaY
    }
    if (opaque(cellX, cellY)) return { cell: { x: cellX, y: cellY }, distance, side: crossesX ? 'x' : 'y' }
  }
}

export function hasLineOfSight(from: Vec2, to: Vec2, opaque: BlockTest): boolean {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  if (distance === 0) return true
  return castRay(from, Math.atan2(to.y - from.y, to.x - from.x), distance, opaque) === null
}

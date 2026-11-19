import type { BlockTest } from './grid'
import type { Vec2 } from './types'

const CONTACT_GAP = 1e-3

/** Moves a square body of half-side `radius` by `delta`, sliding along walls; steps must stay below one cell. */
export function moveBox(position: Vec2, delta: Vec2, radius: number, blocked: BlockTest): Vec2 {
  const x = slide(position.x, position.y, delta.x, radius, (along, across) => blocked(along, across))
  const y = slide(position.y, x, delta.y, radius, (along, across) => blocked(across, along))
  return { x, y }
}

function slide(along: number, across: number, delta: number, radius: number, blocked: BlockTest): number {
  if (delta === 0) return along
  const target = along + delta
  const edge = Math.floor(delta > 0 ? target + radius : target - radius)
  for (let lane = Math.floor(across - radius); lane <= Math.floor(across + radius); lane++) {
    if (blocked(edge, lane)) return delta > 0 ? edge - radius - CONTACT_GAP : edge + 1 + radius + CONTACT_GAP
  }
  return target
}

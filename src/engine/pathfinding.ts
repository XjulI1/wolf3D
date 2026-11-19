import type { BlockTest } from './grid'
import type { Vec2 } from './types'

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const

/**
 * The first cell to step into on a shortest 4-way path from `from` to `to` (breadth-first
 * search). The goal cell is always enterable. Null when already there or when no path exists.
 */
export function nextStep(from: Vec2, to: Vec2, width: number, height: number, passable: BlockTest): Vec2 | null {
  if (from.x === to.x && from.y === to.y) return null
  const start = from.y * width + from.x
  const goal = to.y * width + to.x
  const previous = new Int32Array(width * height).fill(-1)
  const parentOf = (index: number) => previous[index] ?? -1
  previous[start] = start
  const queue = [start]

  for (const current of queue) {
    if (current === goal) break
    const x = current % width
    const y = (current - x) / width
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const next = ny * width + nx
      if (parentOf(next) !== -1) continue
      if (next !== goal && !passable(nx, ny)) continue
      previous[next] = current
      queue.push(next)
    }
  }

  if (parentOf(goal) === -1) return null
  let step = goal
  while (parentOf(step) !== start) step = parentOf(step)
  return { x: step % width, y: Math.floor(step / width) }
}

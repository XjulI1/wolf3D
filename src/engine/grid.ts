import type { Cell, Level, Vec2 } from './types'

/** Tells whether the cell at integer coordinates (x, y) stops something. */
export type BlockTest = (x: number, y: number) => boolean

export type Grid = Pick<Level, 'width' | 'height' | 'cells'>

const OUTSIDE: Cell = { type: 'wall', wall: 'steel' }

/** The cell at integer coordinates; anything outside the map reads as a wall. */
export function cellAt(grid: Grid, x: number, y: number): Cell {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return OUTSIDE
  return grid.cells[y * grid.width + x] ?? OUTSIDE
}

export function cellOf(position: Vec2): Vec2 {
  return { x: Math.floor(position.x), y: Math.floor(position.y) }
}

export function cellCenter(cell: Vec2): Vec2 {
  return { x: cell.x + 0.5, y: cell.y + 0.5 }
}

export function distanceBetween(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Whether a square of half-side `radius` centred on `position` overlaps the cell. */
export function overlapsCell(position: Vec2, radius: number, cell: Vec2): boolean {
  return (
    position.x + radius > cell.x &&
    position.x - radius < cell.x + 1 &&
    position.y + radius > cell.y &&
    position.y - radius < cell.y + 1
  )
}

/** The same angle, brought into [-π, π). */
export function normalizeAngle(angle: number): number {
  const turn = Math.PI * 2
  return angle - turn * Math.floor((angle + Math.PI) / turn)
}

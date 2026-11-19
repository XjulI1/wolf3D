import { cellAt, type Grid } from './grid'
import type {
  Cell,
  DoorAxis,
  EnemyKind,
  EnemySpawn,
  Level,
  LevelTheme,
  PickupKind,
  PickupSpawn,
  PlayerStart,
  Vec2,
  WallKind,
} from './types'

/**
 * A level as written by hand: one string per row, one character per cell.
 *
 * Walls: `#` steel, `%` concrete, `=` server rack, `X` exit terminal. Doors: `D`, `L` locked.
 * Floor: `.`. Player start: `>` `v` `<` `^`. Enemies: `d` drone, `S` sentinel.
 * Pickups: `+` medkit, `a` ammo, `R` rifle, `k` keycard, `$` data chip.
 */
export type LevelSource = { name: string; theme: LevelTheme; map: readonly string[] }

const FLOOR_SYMBOL = '.'

const WALL_SYMBOLS: Partial<Record<string, WallKind>> = { '#': 'steel', '%': 'concrete', '=': 'server', X: 'exit' }

const LOCKED_BY_DOOR_SYMBOL: Partial<Record<string, boolean>> = { D: false, L: true }

const START_ANGLES: Partial<Record<string, number>> = {
  '>': 0,
  v: Math.PI / 2,
  '<': -Math.PI,
  '^': -Math.PI / 2,
}

const ENEMY_SYMBOLS: Partial<Record<string, EnemyKind>> = { d: 'drone', S: 'sentinel' }

const PICKUP_SYMBOLS: Partial<Record<string, PickupKind>> = {
  '+': 'medkit',
  a: 'ammo',
  R: 'rifle',
  k: 'keycard',
  $: 'data',
}

/** Parses and validates a hand-written level; throws an error naming the first problem found. */
export function parseLevel(source: LevelSource): Level {
  const { name, map } = source
  const height = map.length
  const width = map[0]?.length ?? 0
  if (width === 0) throw new Error(`Level "${name}" has no cells`)

  const cells: Cell[] = []
  const doorCells: { cell: Vec2; locked: boolean }[] = []
  const starts: PlayerStart[] = []
  const enemies: EnemySpawn[] = []
  const pickups: PickupSpawn[] = []

  map.forEach((row, y) => {
    if (row.length !== width) throw new Error(`Row ${y} of level "${name}" has ${row.length} cells instead of ${width}`)
    Array.from(row).forEach((symbol, x) => {
      const wall = WALL_SYMBOLS[symbol]
      if (wall) {
        cells.push({ type: 'wall', wall })
        return
      }
      const locked = LOCKED_BY_DOOR_SYMBOL[symbol]
      if (locked !== undefined) {
        cells.push({ type: 'door', door: doorCells.length })
        doorCells.push({ cell: { x, y }, locked })
        return
      }
      cells.push({ type: 'empty' })
      const position = { x: x + 0.5, y: y + 0.5 }
      const angle = START_ANGLES[symbol]
      const enemy = ENEMY_SYMBOLS[symbol]
      const pickup = PICKUP_SYMBOLS[symbol]
      if (angle !== undefined) starts.push({ position, angle })
      else if (enemy) enemies.push({ kind: enemy, position })
      else if (pickup) pickups.push({ kind: pickup, position })
      else if (symbol !== FLOOR_SYMBOL) throw new Error(`Unknown symbol "${symbol}" at (${x}, ${y}) in level "${name}"`)
    })
  })

  const grid: Grid = { width, height, cells }
  assertEnclosed(grid, name)
  const start = starts[0]
  if (starts.length !== 1 || !start) {
    throw new Error(`Level "${name}" needs exactly one player start, found ${starts.length}`)
  }
  const doors = doorCells.map(({ cell, locked }) => ({ cell, locked, axis: doorAxis(grid, cell, name) }))
  return { name, width, height, cells, start, doors, enemies, pickups, theme: source.theme }
}

function assertEnclosed(grid: Grid, name: string): void {
  const border: Vec2[] = []
  for (let x = 0; x < grid.width; x++) border.push({ x, y: 0 }, { x, y: grid.height - 1 })
  for (let y = 0; y < grid.height; y++) border.push({ x: 0, y }, { x: grid.width - 1, y })
  const gap = border.find(({ x, y }) => cellAt(grid, x, y).type !== 'wall')
  if (gap) throw new Error(`Level "${name}" is open at (${gap.x}, ${gap.y}): its border must be walls`)
}

function doorAxis(grid: Grid, cell: Vec2, name: string): DoorAxis {
  const isWall = (dx: number, dy: number) => cellAt(grid, cell.x + dx, cell.y + dy).type === 'wall'
  if (isWall(-1, 0) && isWall(1, 0)) return 'x'
  if (isWall(0, -1) && isWall(0, 1)) return 'y'
  throw new Error(`Door at (${cell.x}, ${cell.y}) in level "${name}" must stand between two walls`)
}

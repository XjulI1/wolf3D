import { isDoorOpen } from './doors'
import { cellAt } from './grid'
import type { Door, Enemy, World } from './types'

export function doorAt(world: World, x: number, y: number): Door | null {
  const cell = cellAt(world.level, x, y)
  return cell.type === 'door' ? (world.doors[cell.door] ?? null) : null
}

/** Walls and doors that are not fully open stop bodies, bullets and sight alike. */
export function isSolid(world: World, x: number, y: number): boolean {
  const cell = cellAt(world.level, x, y)
  if (cell.type === 'wall') return true
  if (cell.type === 'empty') return false
  const door = world.doors[cell.door]
  return door === undefined || !isDoorOpen(door)
}

/** Enemies plan their routes through any unlocked door, open or not. */
export function isWalkableForEnemies(world: World, x: number, y: number): boolean {
  const cell = cellAt(world.level, x, y)
  if (cell.type === 'wall') return false
  if (cell.type === 'empty') return true
  return world.doors[cell.door]?.locked === false
}

export function isAlive(enemy: Enemy): boolean {
  return enemy.state !== 'dying' && enemy.state !== 'dead'
}

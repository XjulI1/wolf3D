import { describe, expect, it } from 'vitest'
import { cellAt, cellOf } from '../grid'
import type { Level, Vec2 } from '../types'
import { LEVELS } from './index'

const NEIGHBOURS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

const key = (cell: Vec2) => `${cell.x},${cell.y}`

function reachableCells(level: Level, throughLockedDoors: boolean): Set<string> {
  const start = cellOf(level.start.position)
  const seen = new Set([key(start)])
  const queue = [start]
  for (const current of queue) {
    for (const step of NEIGHBOURS) {
      const next = { x: current.x + step.x, y: current.y + step.y }
      const cell = cellAt(level, next.x, next.y)
      if (seen.has(key(next)) || cell.type === 'wall') continue
      if (cell.type === 'door' && level.doors[cell.door]?.locked && !throughLockedDoors) continue
      seen.add(key(next))
      queue.push(next)
    }
  }
  return seen
}

function exitsOf(level: Level): Vec2[] {
  const exits: Vec2[] = []
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const cell = cellAt(level, x, y)
      if (cell.type === 'wall' && cell.wall === 'exit') exits.push({ x, y })
    }
  }
  return exits
}

describe.each(LEVELS.map((level) => [level.name, level] as const))('level "%s"', (_name, level) => {
  const keycards = level.pickups.filter((pickup) => pickup.kind === 'keycard')
  const hasLockedDoors = level.doors.some((door) => door.locked)
  const beforeLocks = reachableCells(level, false)
  const everywhere = reachableCells(level, true)

  it('offers a keycard before its locked doors, if it has any', () => {
    if (!hasLockedDoors) return
    expect(keycards.some((keycard) => beforeLocks.has(key(cellOf(keycard.position))))).toBe(true)
  })

  it('has an exit terminal next to a reachable cell', () => {
    const exits = exitsOf(level)
    expect(exits.length).toBeGreaterThan(0)
    const touchesReachableCell = exits.some((exit) =>
      NEIGHBOURS.some((step) => everywhere.has(key({ x: exit.x + step.x, y: exit.y + step.y }))),
    )
    expect(touchesReachableCell).toBe(true)
  })

  it('puts every enemy and pickup where the player can go', () => {
    for (const thing of [...level.enemies, ...level.pickups]) {
      expect(everywhere.has(key(cellOf(thing.position))), `${thing.kind} at ${key(thing.position)}`).toBe(true)
    }
  })

  it('has data chips to collect and enemies to fight', () => {
    expect(level.pickups.some((pickup) => pickup.kind === 'data')).toBe(true)
    expect(level.enemies.length).toBeGreaterThan(0)
  })
})

describe('campaign', () => {
  it('chains three levels, the first one without locked doors', () => {
    expect(LEVELS).toHaveLength(3)
    expect(LEVELS[0]?.doors.some((door) => door.locked)).toBe(false)
  })
})

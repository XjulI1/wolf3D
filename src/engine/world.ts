import { spawnPickup } from './combat'
import { createDoor, updateDoor } from './doors'
import { createEnemy, updateEnemy } from './enemies'
import { ENEMY_RADIUS } from './enemySpecs'
import { overlapsCell } from './grid'
import { createPlayer, PLAYER_RADIUS, STARTING_LOADOUT, updatePlayer } from './player'
import { isAlive } from './queries'
import type { Door, Emit, Level, Loadout, PlayerInput, Random, World, WorldEvent } from './types'

/** Longest simulated step, in seconds: a slow frame is simulated as a shorter one. */
export const MAX_STEP = 0.05

export const IDLE_INPUT: PlayerInput = {
  forward: 0,
  strafe: 0,
  turn: 0,
  look: 0,
  run: false,
  fire: false,
  use: false,
  weapon: null,
}

export type LevelReport = {
  kills: number
  enemies: number
  data: number
  totalData: number
  time: number
}

export function createWorld(level: Level, loadout: Loadout = STARTING_LOADOUT, random: Random = Math.random): World {
  const world: World = {
    level,
    player: createPlayer(level.start, loadout),
    doors: level.doors.map((spec) => createDoor(spec)),
    enemies: level.enemies.map((spawn, index) => createEnemy(index + 1, spawn)),
    pickups: [],
    time: 0,
    status: 'playing',
    kills: 0,
    dataFound: 0,
    random,
    nextId: level.enemies.length + 1,
  }
  for (const spawn of level.pickups) spawnPickup(world, spawn.kind, spawn.position)
  return world
}

/** Advances the world by `dt` seconds and returns what happened; a finished level no longer moves. */
export function stepWorld(world: World, input: PlayerInput, dt: number): WorldEvent[] {
  const events: WorldEvent[] = []
  if (world.status !== 'playing') return events
  const emit: Emit = (event) => {
    events.push(event)
  }
  const step = Math.min(dt, MAX_STEP)
  world.time += step
  updatePlayer(world, input, step, emit)
  for (const enemy of world.enemies) updateEnemy(world, enemy, step, emit)
  world.doors.forEach((door, index) => {
    if (updateDoor(door, step, isOccupied(world, door))) emit({ type: 'doorMoved', door: index })
  })
  return events
}

export function reportOf(world: World): LevelReport {
  return {
    kills: world.kills,
    enemies: world.enemies.length,
    data: world.dataFound,
    totalData: world.level.pickups.filter((pickup) => pickup.kind === 'data').length,
    time: world.time,
  }
}

function isOccupied(world: World, door: Door): boolean {
  if (overlapsCell(world.player.position, PLAYER_RADIUS, door.cell)) return true
  return world.enemies.some((enemy) => isAlive(enemy) && overlapsCell(enemy.position, ENEMY_RADIUS, door.cell))
}

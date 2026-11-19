import { damagePlayer } from './combat'
import { isDoorOpen, openDoor } from './doors'
import {
  ACCURACY_FALLOFF,
  ATTACK_RANGE,
  ENEMY_RADIUS,
  ENEMY_SPECS,
  HEARING_RANGE,
  MIN_ACCURACY_FACTOR,
  PERSONAL_SPACE,
  REACTION_TIME,
  REPATH_DELAY,
  SIGHT_RANGE,
  WAYPOINT_TOLERANCE,
} from './enemySpecs'
import { cellCenter, cellOf, distanceBetween } from './grid'
import { moveBox } from './movement'
import { nextStep } from './pathfinding'
import { doorAt, isSolid, isWalkableForEnemies } from './queries'
import { hasLineOfSight } from './raycast'
import { randomBetween, randomInt } from './rng'
import type { Emit, Enemy, EnemySpawn, Vec2, World } from './types'

export function createEnemy(id: number, spawn: EnemySpawn): Enemy {
  return {
    id,
    kind: spawn.kind,
    position: { ...spawn.position },
    health: ENEMY_SPECS[spawn.kind].health,
    state: 'idle',
    timer: 0,
    cooldown: 0,
    waypoint: null,
    repath: 0,
    stride: 0,
    firedAt: -Infinity,
  }
}

export function canSeePlayer(world: World, enemy: Enemy): boolean {
  const target = world.player.position
  return (
    distanceBetween(enemy.position, target) <= SIGHT_RANGE &&
    hasLineOfSight(enemy.position, target, (x, y) => isSolid(world, x, y))
  )
}

/** Wakes an idle enemy up; it reacts after a short random delay. */
export function alertEnemy(world: World, enemy: Enemy, emit: Emit): void {
  if (enemy.state !== 'idle') return
  enemy.state = 'chase'
  enemy.cooldown = randomBetween(world.random, REACTION_TIME)
  emit({ type: 'enemyAlerted', enemyId: enemy.id })
}

/** A gunshot wakes up every idle enemy within earshot, walls or not. */
export function alertEnemiesNear(world: World, origin: Vec2, emit: Emit): void {
  for (const enemy of world.enemies) {
    if (distanceBetween(enemy.position, origin) <= HEARING_RANGE) alertEnemy(world, enemy, emit)
  }
}

export function updateEnemy(world: World, enemy: Enemy, dt: number, emit: Emit): void {
  enemy.cooldown = Math.max(0, enemy.cooldown - dt)
  switch (enemy.state) {
    case 'idle':
      if (canSeePlayer(world, enemy)) alertEnemy(world, enemy, emit)
      return
    case 'chase':
      chase(world, enemy, dt, emit)
      return
    case 'aim':
      enemy.timer -= dt
      if (enemy.timer <= 0) fire(world, enemy, emit)
      return
    case 'pain':
      enemy.timer -= dt
      if (enemy.timer <= 0) enemy.state = 'chase'
      return
    case 'dying':
      enemy.timer -= dt
      if (enemy.timer <= 0) enemy.state = 'dead'
      return
    case 'dead':
      return
  }
}

function chase(world: World, enemy: Enemy, dt: number, emit: Emit): void {
  const spec = ENEMY_SPECS[enemy.kind]
  const distance = distanceBetween(enemy.position, world.player.position)
  if (enemy.cooldown === 0 && distance <= ATTACK_RANGE && canSeePlayer(world, enemy)) {
    enemy.state = 'aim'
    enemy.timer = spec.aimTime
    return
  }
  if (distance <= PERSONAL_SPACE) return
  walk(world, enemy, spec.speed * dt, dt, emit)
}

function walk(world: World, enemy: Enemy, step: number, dt: number, emit: Emit): void {
  enemy.repath -= dt
  if (reachedWaypoint(enemy) || (enemy.waypoint === null && enemy.repath <= 0)) chooseWaypoint(world, enemy)
  const waypoint = enemy.waypoint
  if (!waypoint) return

  const door = doorAt(world, Math.floor(waypoint.x), Math.floor(waypoint.y))
  if (door && !isDoorOpen(door)) {
    if (openDoor(door)) emit({ type: 'doorMoved', door: world.doors.indexOf(door) })
    return
  }

  const dx = waypoint.x - enemy.position.x
  const dy = waypoint.y - enemy.position.y
  const remaining = Math.hypot(dx, dy)
  if (remaining === 0) return
  const travel = Math.min(step, remaining)
  const next = moveBox(
    enemy.position,
    { x: (dx / remaining) * travel, y: (dy / remaining) * travel },
    ENEMY_RADIUS,
    (x, y) => isSolid(world, x, y),
  )
  enemy.stride += distanceBetween(enemy.position, next)
  enemy.position = next
}

function reachedWaypoint(enemy: Enemy): boolean {
  return enemy.waypoint !== null && distanceBetween(enemy.position, enemy.waypoint) < WAYPOINT_TOLERANCE
}

function chooseWaypoint(world: World, enemy: Enemy): void {
  enemy.repath = REPATH_DELAY
  const { width, height } = world.level
  const step = nextStep(cellOf(enemy.position), cellOf(world.player.position), width, height, (x, y) =>
    isWalkableForEnemies(world, x, y),
  )
  enemy.waypoint = step ? cellCenter(step) : null
}

function fire(world: World, enemy: Enemy, emit: Emit): void {
  const spec = ENEMY_SPECS[enemy.kind]
  enemy.state = 'chase'
  enemy.firedAt = world.time
  enemy.cooldown = randomBetween(world.random, spec.cooldown)
  emit({ type: 'enemyShot', enemyId: enemy.id })
  if (!canSeePlayer(world, enemy)) return
  const distance = distanceBetween(enemy.position, world.player.position)
  const chance = spec.accuracy * Math.max(MIN_ACCURACY_FACTOR, 1 - distance / ACCURACY_FALLOFF)
  if (world.random() < chance) damagePlayer(world, randomInt(world.random, spec.damage), emit)
}

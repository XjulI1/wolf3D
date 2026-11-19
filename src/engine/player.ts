import { damageEnemy, findTarget } from './combat'
import { openDoor } from './doors'
import { alertEnemiesNear } from './enemies'
import { ENEMY_RADIUS } from './enemySpecs'
import { cellAt, distanceBetween, normalizeAngle } from './grid'
import { moveBox } from './movement'
import { applyPickup } from './pickups'
import { isAlive, isSolid } from './queries'
import { castRay } from './raycast'
import { randomInt } from './rng'
import type { Emit, Loadout, Player, PlayerInput, PlayerStart, Vec2, World } from './types'
import { WEAPONS } from './weapons'

export const PLAYER_RADIUS = 0.25
export const WALK_SPEED = 3
export const RUN_SPEED = 5.5
export const TURN_SPEED = 2.8
export const USE_REACH = 1.3
export const PICKUP_REACH = 0.6
export const DRY_FIRE_DELAY = 0.35

export const STARTING_LOADOUT: Loadout = { health: 100, ammo: 8, weapons: ['pistol'], weapon: 'pistol', score: 0 }

const BODY_GAP = PLAYER_RADIUS + ENEMY_RADIUS

export function createPlayer(start: PlayerStart, loadout: Loadout): Player {
  return {
    position: { ...start.position },
    angle: start.angle,
    health: loadout.health,
    ammo: loadout.ammo,
    weapons: [...loadout.weapons],
    weapon: loadout.weapon,
    cooldown: 0,
    hasKeycard: false,
    score: loadout.score,
    stride: 0,
    firedAt: -Infinity,
  }
}

export function loadoutOf(player: Player): Loadout {
  return {
    health: player.health,
    ammo: player.ammo,
    weapons: [...player.weapons],
    weapon: player.weapon,
    score: player.score,
  }
}

export function updatePlayer(world: World, input: PlayerInput, dt: number, emit: Emit): void {
  const player = world.player
  player.angle = normalizeAngle(player.angle + input.turn * TURN_SPEED * dt + input.look)
  move(world, input, dt)
  collectPickups(world, emit)
  if (input.weapon && player.weapons.includes(input.weapon)) player.weapon = input.weapon
  if (input.use) use(world, emit)
  player.cooldown = Math.max(0, player.cooldown - dt)
  if (input.fire && player.cooldown === 0) pullTrigger(world, emit)
}

function move(world: World, input: PlayerInput, dt: number): void {
  const player = world.player
  const length = Math.hypot(input.forward, input.strafe)
  if (length === 0) return
  const scale = ((input.run ? RUN_SPEED : WALK_SPEED) * dt) / Math.max(1, length)
  const cos = Math.cos(player.angle)
  const sin = Math.sin(player.angle)
  const delta = {
    x: (cos * input.forward - sin * input.strafe) * scale,
    y: (sin * input.forward + cos * input.strafe) * scale,
  }
  const solid = (x: number, y: number) => isSolid(world, x, y)
  const from = player.position
  const candidates = [
    moveBox(from, delta, PLAYER_RADIUS, solid),
    moveBox(from, { x: delta.x, y: 0 }, PLAYER_RADIUS, solid),
    moveBox(from, { x: 0, y: delta.y }, PLAYER_RADIUS, solid),
  ]
  const next = candidates.find((candidate) => !bumpsIntoEnemy(world, from, candidate)) ?? from
  player.stride += distanceBetween(from, next)
  player.position = next
}

function bumpsIntoEnemy(world: World, from: Vec2, to: Vec2): boolean {
  return world.enemies.some((enemy) => {
    if (!isAlive(enemy)) return false
    const after = distanceBetween(enemy.position, to)
    return after < BODY_GAP && after < distanceBetween(enemy.position, from)
  })
}

function collectPickups(world: World, emit: Emit): void {
  for (const pickup of world.pickups) {
    if (pickup.taken || distanceBetween(pickup.position, world.player.position) > PICKUP_REACH) continue
    if (!applyPickup(world.player, pickup.kind)) continue
    pickup.taken = true
    if (pickup.kind === 'data') world.dataFound += 1
    emit({ type: 'pickupCollected', kind: pickup.kind })
  }
}

function use(world: World, emit: Emit): void {
  const player = world.player
  const hit = castRay(player.position, player.angle, USE_REACH, (x, y) => cellAt(world.level, x, y).type !== 'empty')
  if (!hit) return
  const cell = cellAt(world.level, hit.cell.x, hit.cell.y)
  if (cell.type === 'wall' && cell.wall === 'exit') {
    world.status = 'complete'
    emit({ type: 'levelComplete' })
    return
  }
  if (cell.type !== 'door') return
  const door = world.doors[cell.door]
  if (!door) return
  if (door.locked) {
    if (!player.hasKeycard) {
      emit({ type: 'doorLocked' })
      return
    }
    door.locked = false
  }
  if (openDoor(door)) emit({ type: 'doorMoved', door: cell.door })
}

function pullTrigger(world: World, emit: Emit): void {
  const player = world.player
  if (player.ammo === 0) {
    player.cooldown = DRY_FIRE_DELAY
    emit({ type: 'dryFire' })
    return
  }
  const weapon = WEAPONS[player.weapon]
  player.ammo -= 1
  player.cooldown = weapon.cooldown
  player.firedAt = world.time
  emit({ type: 'playerShot', weapon: player.weapon })
  alertEnemiesNear(world, player.position, emit)
  const target = findTarget(world)
  if (target) damageEnemy(world, target, randomInt(world.random, weapon.damage), emit)
}

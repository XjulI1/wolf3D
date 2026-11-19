import { DYING_TIME, ENEMY_SPECS, PAIN_TIME } from './enemySpecs'
import { isAlive, isSolid } from './queries'
import { castRay } from './raycast'
import type { Emit, Enemy, Pickup, PickupKind, Vec2, World } from './types'

/** Half-width of an enemy as seen by a bullet. */
export const HIT_RADIUS = 0.35

const SHOT_RANGE = 64

/** The nearest living enemy on the player's line of fire, in front of the first wall. */
export function findTarget(world: World): Enemy | null {
  const { position, angle } = world.player
  const dirX = Math.cos(angle)
  const dirY = Math.sin(angle)
  const wall = castRay(position, angle, SHOT_RANGE, (x, y) => isSolid(world, x, y))
  let best: Enemy | null = null
  let bestDistance = wall?.distance ?? SHOT_RANGE

  for (const enemy of world.enemies) {
    if (!isAlive(enemy)) continue
    const offsetX = enemy.position.x - position.x
    const offsetY = enemy.position.y - position.y
    const along = offsetX * dirX + offsetY * dirY
    const across = Math.abs(offsetX * dirY - offsetY * dirX)
    if (along <= 0 || along >= bestDistance || across > HIT_RADIUS) continue
    best = enemy
    bestDistance = along
  }
  return best
}

export function damageEnemy(world: World, enemy: Enemy, amount: number, emit: Emit): void {
  if (!isAlive(enemy)) return
  enemy.health -= amount
  if (enemy.health > 0) {
    enemy.state = 'pain'
    enemy.timer = PAIN_TIME
    emit({ type: 'enemyHurt', enemyId: enemy.id })
    return
  }
  const spec = ENEMY_SPECS[enemy.kind]
  enemy.health = 0
  enemy.state = 'dying'
  enemy.timer = DYING_TIME
  enemy.waypoint = null
  world.kills += 1
  world.player.score += spec.score
  emit({ type: 'enemyKilled', enemyId: enemy.id })
  const drop = spawnPickup(world, spec.drop, enemy.position)
  emit({ type: 'pickupDropped', pickupId: drop.id })
}

export function damagePlayer(world: World, amount: number, emit: Emit): void {
  if (world.status !== 'playing') return
  const player = world.player
  player.health = Math.max(0, player.health - amount)
  emit({ type: 'playerHurt', damage: amount })
  if (player.health > 0) return
  world.status = 'dead'
  emit({ type: 'playerDied' })
}

export function spawnPickup(world: World, kind: PickupKind, position: Vec2): Pickup {
  const pickup: Pickup = { id: world.nextId, kind, position: { ...position }, taken: false }
  world.nextId += 1
  world.pickups.push(pickup)
  return pickup
}

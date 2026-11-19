import { distanceBetween, type Vec2, type World, type WorldEvent } from '../engine'

export type Sound =
  | 'pistol'
  | 'rifle'
  | 'dryFire'
  | 'alert'
  | 'enemyShot'
  | 'enemyHurt'
  | 'enemyDeath'
  | 'playerHurt'
  | 'playerDeath'
  | 'pickup'
  | 'door'
  | 'locked'
  | 'complete'

export type SoundCue = { sound: Sound; volume: number }

/** Distance at which a sound fades out completely. */
export const HEARING_DISTANCE = 18

/** The sound an event makes, quieter the further from the player; null when silent or too far. */
export function soundFor(event: WorldEvent, world: World): SoundCue | null {
  switch (event.type) {
    case 'playerShot':
      return { sound: event.weapon, volume: 1 }
    case 'dryFire':
      return { sound: 'dryFire', volume: 1 }
    case 'enemyAlerted':
      return atEnemy(world, event.enemyId, 'alert')
    case 'enemyShot':
      return atEnemy(world, event.enemyId, 'enemyShot')
    case 'enemyHurt':
      return atEnemy(world, event.enemyId, 'enemyHurt')
    case 'enemyKilled':
      return atEnemy(world, event.enemyId, 'enemyDeath')
    case 'playerHurt':
      return { sound: 'playerHurt', volume: 1 }
    case 'playerDied':
      return { sound: 'playerDeath', volume: 1 }
    case 'pickupCollected':
      return { sound: 'pickup', volume: 1 }
    case 'doorMoved': {
      const door = world.doors[event.door]
      return door ? at(world, { x: door.cell.x + 0.5, y: door.cell.y + 0.5 }, 'door') : null
    }
    case 'doorLocked':
      return { sound: 'locked', volume: 1 }
    case 'levelComplete':
      return { sound: 'complete', volume: 1 }
    case 'pickupDropped':
      return null
  }
}

function atEnemy(world: World, enemyId: number, sound: Sound): SoundCue | null {
  const enemy = world.enemies.find((candidate) => candidate.id === enemyId)
  return enemy ? at(world, enemy.position, sound) : null
}

function at(world: World, position: Vec2, sound: Sound): SoundCue | null {
  const volume = 1 - distanceBetween(world.player.position, position) / HEARING_DISTANCE
  return volume > 0 ? { sound, volume } : null
}

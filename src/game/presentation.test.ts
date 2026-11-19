import { describe, expect, it } from 'vitest'
import { worldFrom } from '../engine/testUtils'
import { hudOf, sameHud } from './hud'
import { messageFor } from './messages'
import { HEARING_DISTANCE, soundFor } from './sounds'
import { FIRING_FRAME_TIME, SWAY_X, SWAY_Y, weaponPose } from './weaponPose'

describe('hudOf', () => {
  it('reads the status bar values from the world', () => {
    const world = worldFrom(['#######', '#>.d.d#', '#######'], { loadout: { score: 300, ammo: 12 } })
    world.kills = 1
    expect(hudOf(world, 3)).toMatchObject({
      levelNumber: 3,
      levelName: 'test',
      health: 100,
      ammo: 12,
      score: 300,
      weapon: 'pistol',
      hasKeycard: false,
      kills: 1,
      enemies: 2,
    })
  })

  it('notices any change, down to a new weapon', () => {
    const world = worldFrom(['####', '#>.#', '####'])
    const before = hudOf(world, 1)
    expect(sameHud(before, hudOf(world, 1))).toBe(true)
    world.player.weapons.push('rifle')
    expect(sameHud(before, hudOf(world, 1))).toBe(false)
  })
})

describe('weaponPose', () => {
  it('shows the muzzle flash right after a shot only', () => {
    const { player } = worldFrom(['####', '#>.#', '####'])
    player.firedAt = 5
    expect(weaponPose(player, 5 + FIRING_FRAME_TIME / 2).firing).toBe(true)
    expect(weaponPose(player, 5 + FIRING_FRAME_TIME * 2).firing).toBe(false)
  })

  it('sways within a few pixels as the player walks', () => {
    const { player } = worldFrom(['####', '#>.#', '####'])
    const offsets = new Set<string>()
    for (let stride = 0; stride < 3; stride += 0.05) {
      player.stride = stride
      const pose = weaponPose(player, 0)
      expect(Math.abs(pose.offsetX)).toBeLessThanOrEqual(SWAY_X)
      expect(pose.offsetY).toBeGreaterThanOrEqual(0)
      expect(pose.offsetY).toBeLessThanOrEqual(SWAY_Y)
      offsets.add(`${pose.offsetX},${pose.offsetY}`)
    }
    expect(offsets.size).toBeGreaterThan(3)
  })
})

describe('soundFor', () => {
  const wall = '#'.repeat(28)
  const world = worldFrom([wall, `#>.d${'.'.repeat(22)}S#`, wall])

  it('plays the player sounds at full volume', () => {
    expect(soundFor({ type: 'playerShot', weapon: 'rifle' }, world)).toEqual({ sound: 'rifle', volume: 1 })
    expect(soundFor({ type: 'playerHurt', damage: 5 }, world)).toEqual({ sound: 'playerHurt', volume: 1 })
  })

  it('fades enemy sounds with distance, down to silence', () => {
    const near = soundFor({ type: 'enemyShot', enemyId: 1 }, world)
    expect(near?.sound).toBe('enemyShot')
    expect(near?.volume).toBeCloseTo(1 - 2 / HEARING_DISTANCE)
    expect(soundFor({ type: 'enemyShot', enemyId: 2 }, world)).toBeNull()
  })

  it('keeps dropped pickups silent', () => {
    expect(soundFor({ type: 'pickupDropped', pickupId: 9 }, world)).toBeNull()
  })
})

describe('messageFor', () => {
  it('names what was picked up, and why a door stays shut', () => {
    expect(messageFor({ type: 'pickupCollected', kind: 'keycard' })).toBe('Carte d’accès récupérée')
    expect(messageFor({ type: 'doorLocked' })).toBe('Accès refusé : carte d’accès requise')
    expect(messageFor({ type: 'playerShot', weapon: 'pistol' })).toBeNull()
  })
})

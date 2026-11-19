import { describe, expect, it } from 'vitest'
import { AMMO_CLIP, applyPickup, DATA_SCORE, MAX_AMMO, MAX_HEALTH, MEDKIT_HEALTH, RIFLE_AMMO } from './pickups'
import { createPlayer, STARTING_LOADOUT } from './player'
import type { Loadout } from './types'

const playerWith = (loadout: Partial<Loadout> = {}) =>
  createPlayer({ position: { x: 1.5, y: 1.5 }, angle: 0 }, { ...STARTING_LOADOUT, ...loadout })

describe('applyPickup', () => {
  it('heals with a medkit, up to the maximum', () => {
    const player = playerWith({ health: 50 })
    expect(applyPickup(player, 'medkit')).toBe(true)
    expect(player.health).toBe(50 + MEDKIT_HEALTH)
    const almostHealthy = playerWith({ health: MAX_HEALTH - 5 })
    applyPickup(almostHealthy, 'medkit')
    expect(almostHealthy.health).toBe(MAX_HEALTH)
  })

  it('leaves a medkit on the floor at full health', () => {
    expect(applyPickup(playerWith(), 'medkit')).toBe(false)
  })

  it('adds a clip of ammo, up to the maximum, and refuses it when full', () => {
    const player = playerWith({ ammo: 3 })
    applyPickup(player, 'ammo')
    expect(player.ammo).toBe(3 + AMMO_CLIP)
    expect(applyPickup(playerWith({ ammo: MAX_AMMO }), 'ammo')).toBe(false)
  })

  it('gives the rifle, switches to it and adds some ammo', () => {
    const player = playerWith({ ammo: 2 })
    applyPickup(player, 'rifle')
    expect(player.weapons).toEqual(['pistol', 'rifle'])
    expect(player.weapon).toBe('rifle')
    expect(player.ammo).toBe(2 + RIFLE_AMMO)
  })

  it('never lists the rifle twice', () => {
    const player = playerWith({ weapons: ['pistol', 'rifle'] })
    applyPickup(player, 'rifle')
    expect(player.weapons).toEqual(['pistol', 'rifle'])
  })

  it('stores the keycard and scores data chips', () => {
    const player = playerWith({ score: 100 })
    applyPickup(player, 'keycard')
    applyPickup(player, 'data')
    expect(player.hasKeycard).toBe(true)
    expect(player.score).toBe(100 + DATA_SCORE)
  })
})

import { describe, expect, it } from 'vitest'
import { LEVELS, STARTING_LOADOUT } from '../engine'
import { isLastLevel, levelOf, nextLevel, startCampaign, worldFor } from './campaign'

describe('campaign', () => {
  it('starts on the first level with the starting loadout', () => {
    const campaign = startCampaign()
    expect(levelOf(campaign)).toBe(LEVELS[0])
    expect(worldFor(campaign).player.ammo).toBe(STARTING_LOADOUT.ammo)
  })

  it('carries health, ammo, weapons and score to the next level, but not the keycard', () => {
    const campaign = startCampaign()
    const world = worldFor(campaign)
    Object.assign(world.player, { health: 64, ammo: 30, score: 2100, weapon: 'rifle', hasKeycard: true })
    world.player.weapons.push('rifle')
    const next = nextLevel(campaign, world)
    expect(next?.levelIndex).toBe(1)
    const entered = next ? worldFor(next).player : null
    expect(entered).toMatchObject({ health: 64, ammo: 30, score: 2100, weapon: 'rifle', hasKeycard: false })
    expect(entered?.weapons).toEqual(['pistol', 'rifle'])
  })

  it('restarts a level with what the player had when entering it', () => {
    const campaign = startCampaign()
    const lost = worldFor(campaign)
    lost.player.health = 0
    lost.player.score = 999
    expect(worldFor(campaign).player).toMatchObject({ health: 100, score: 0 })
  })

  it('ends after the last level', () => {
    const last = { ...startCampaign(), levelIndex: LEVELS.length - 1 }
    expect(isLastLevel(last)).toBe(true)
    expect(nextLevel(last, worldFor(last))).toBeNull()
  })
})

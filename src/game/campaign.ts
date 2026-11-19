import { createWorld, LEVELS, loadoutOf, STARTING_LOADOUT, type Level, type Loadout, type World } from '../engine'

/** Progress through the levels: the current one and what the player brought into it. */
export type Campaign = { levelIndex: number; loadout: Loadout }

export function startCampaign(): Campaign {
  return { levelIndex: 0, loadout: STARTING_LOADOUT }
}

export function levelOf(campaign: Campaign, levels: readonly Level[] = LEVELS): Level {
  const level = levels[campaign.levelIndex]
  if (!level) throw new Error(`No level at index ${campaign.levelIndex}`)
  return level
}

/** A fresh world for the current level, entered with the campaign loadout. */
export function worldFor(campaign: Campaign, levels: readonly Level[] = LEVELS): World {
  return createWorld(levelOf(campaign, levels), campaign.loadout)
}

export function isLastLevel(campaign: Campaign, levels: readonly Level[] = LEVELS): boolean {
  return campaign.levelIndex >= levels.length - 1
}

/** The next level, entered with what the player had at the end of `world`; null after the last one. */
export function nextLevel(campaign: Campaign, world: World, levels: readonly Level[] = LEVELS): Campaign | null {
  if (isLastLevel(campaign, levels)) return null
  return { levelIndex: campaign.levelIndex + 1, loadout: loadoutOf(world.player) }
}

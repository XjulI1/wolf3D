import type { WeaponId, World } from '../engine'

/** What the status bar shows. */
export type HudState = {
  levelNumber: number
  levelName: string
  health: number
  ammo: number
  score: number
  weapon: WeaponId
  weapons: readonly WeaponId[]
  hasKeycard: boolean
  kills: number
  enemies: number
}

export function hudOf(world: World, levelNumber: number): HudState {
  const { player } = world
  return {
    levelNumber,
    levelName: world.level.name,
    health: player.health,
    ammo: player.ammo,
    score: player.score,
    weapon: player.weapon,
    weapons: [...player.weapons],
    hasKeycard: player.hasKeycard,
    kills: world.kills,
    enemies: world.enemies.length,
  }
}

export function sameHud(a: HudState, b: HudState): boolean {
  return (
    a.levelNumber === b.levelNumber &&
    a.levelName === b.levelName &&
    a.health === b.health &&
    a.ammo === b.ammo &&
    a.score === b.score &&
    a.weapon === b.weapon &&
    a.weapons.join() === b.weapons.join() &&
    a.hasKeycard === b.hasKeycard &&
    a.kills === b.kills &&
    a.enemies === b.enemies
  )
}

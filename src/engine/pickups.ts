import type { Player, PickupKind } from './types'

export const MAX_HEALTH = 100
export const MAX_AMMO = 99
export const MEDKIT_HEALTH = 25
export const AMMO_CLIP = 8
export const RIFLE_AMMO = 6
export const DATA_SCORE = 500

/** Applies a pickup to the player; false when it would be useless, so it stays on the floor. */
export function applyPickup(player: Player, kind: PickupKind): boolean {
  switch (kind) {
    case 'medkit':
      if (player.health >= MAX_HEALTH) return false
      player.health = Math.min(MAX_HEALTH, player.health + MEDKIT_HEALTH)
      return true
    case 'ammo':
      if (player.ammo >= MAX_AMMO) return false
      player.ammo = Math.min(MAX_AMMO, player.ammo + AMMO_CLIP)
      return true
    case 'rifle':
      if (!player.weapons.includes('rifle')) player.weapons.push('rifle')
      player.weapon = 'rifle'
      player.ammo = Math.min(MAX_AMMO, player.ammo + RIFLE_AMMO)
      return true
    case 'keycard':
      player.hasKeycard = true
      return true
    case 'data':
      player.score += DATA_SCORE
      return true
  }
}

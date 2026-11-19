import type { WeaponId } from './types'

export type WeaponSpec = {
  /** Seconds between two shots while the trigger is held. */
  cooldown: number
  damage: readonly [number, number]
}

export const WEAPONS: Record<WeaponId, WeaponSpec> = {
  pistol: { cooldown: 0.4, damage: [8, 16] },
  rifle: { cooldown: 0.12, damage: [7, 13] },
}

export const WEAPON_ORDER: readonly WeaponId[] = ['pistol', 'rifle']

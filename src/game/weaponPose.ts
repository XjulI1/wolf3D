import type { Player, WeaponId } from '../engine'

/** The weapon drawn in front of the player: offsets in pixels of the weapon image. */
export type WeaponPose = { weapon: WeaponId; firing: boolean; offsetX: number; offsetY: number }

export const FIRING_FRAME_TIME = 0.1
export const SWAY_X = 3
export const SWAY_Y = 2
const SWAY_RATE = Math.PI * 0.9

export function weaponPose(player: Player, time: number): WeaponPose {
  return {
    weapon: player.weapon,
    firing: time - player.firedAt < FIRING_FRAME_TIME,
    offsetX: Math.round(Math.sin(player.stride * SWAY_RATE) * SWAY_X),
    offsetY: Math.round(Math.abs(Math.cos(player.stride * SWAY_RATE)) * SWAY_Y),
  }
}

export function samePose(a: WeaponPose, b: WeaponPose): boolean {
  return a.weapon === b.weapon && a.firing === b.firing && a.offsetX === b.offsetX && a.offsetY === b.offsetY
}

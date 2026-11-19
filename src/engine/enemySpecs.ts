import type { EnemyKind, PickupKind } from './types'

export type EnemySpec = {
  health: number
  /** Cells per second. */
  speed: number
  /** Seconds spent aiming before each shot. */
  aimTime: number
  cooldown: readonly [number, number]
  damage: readonly [number, number]
  /** Chance to hit at point-blank range. */
  accuracy: number
  score: number
  drop: PickupKind
}

export const ENEMY_SPECS: Record<EnemyKind, EnemySpec> = {
  drone: {
    health: 25,
    speed: 1.8,
    aimTime: 0.5,
    cooldown: [1.2, 2.2],
    damage: [4, 10],
    accuracy: 0.75,
    score: 100,
    drop: 'ammo',
  },
  sentinel: {
    health: 60,
    speed: 1.3,
    aimTime: 0.35,
    cooldown: [0.7, 1.3],
    damage: [6, 14],
    accuracy: 0.85,
    score: 400,
    drop: 'ammo',
  },
}

export const ENEMY_RADIUS = 0.3
export const SIGHT_RANGE = 14
export const ATTACK_RANGE = 10
export const HEARING_RANGE = 9
export const PERSONAL_SPACE = 1.1
export const REACTION_TIME: readonly [number, number] = [0.3, 0.9]
export const REPATH_DELAY = 0.5
export const WAYPOINT_TOLERANCE = 0.05
export const ACCURACY_FALLOFF = 16
export const MIN_ACCURACY_FACTOR = 0.25
export const PAIN_TIME = 0.25
export const DYING_TIME = 0.6

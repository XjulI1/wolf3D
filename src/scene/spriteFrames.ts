import type { Enemy } from '../engine'

export type EnemyFrame = 'stand' | 'walk1' | 'walk2' | 'aim' | 'fire' | 'pain' | 'dying' | 'dead'

export const ENEMY_FRAMES: readonly EnemyFrame[] = ['stand', 'walk1', 'walk2', 'aim', 'fire', 'pain', 'dying', 'dead']

export const MUZZLE_FLASH_TIME = 0.12

/** Distance walked between two steps of the walk cycle. */
export const STRIDE_PER_FRAME = 0.4

export function enemyFrame(enemy: Enemy, time: number): EnemyFrame {
  switch (enemy.state) {
    case 'idle':
      return 'stand'
    case 'aim':
      return 'aim'
    case 'pain':
      return 'pain'
    case 'dying':
      return 'dying'
    case 'dead':
      return 'dead'
    case 'chase':
      if (time - enemy.firedAt < MUZZLE_FLASH_TIME) return 'fire'
      return Math.floor(enemy.stride / STRIDE_PER_FRAME) % 2 === 0 ? 'walk1' : 'walk2'
  }
}

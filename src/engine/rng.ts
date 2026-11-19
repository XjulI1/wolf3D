import type { Random } from './types'

/** Seeded pseudo-random generator (mulberry32): the same seed always yields the same sequence. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A real number in [min, max). */
export function randomBetween(random: Random, [min, max]: readonly [number, number]): number {
  return min + (max - min) * random()
}

/** An integer in [min, max], both included. */
export function randomInt(random: Random, [min, max]: readonly [number, number]): number {
  return min + Math.floor(random() * (max - min + 1))
}

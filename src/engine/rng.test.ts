import { describe, expect, it } from 'vitest'
import { createRandom, randomBetween, randomInt } from './rng'
import { constantRandom } from './testUtils'

describe('createRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createRandom(42)
    const second = createRandom(42)
    expect(Array.from({ length: 5 }, first)).toEqual(Array.from({ length: 5 }, second))
  })

  it('yields different sequences for different seeds', () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)())
  })

  it('stays within [0, 1)', () => {
    const random = createRandom(7)
    for (let draw = 0; draw < 1000; draw++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('randomInt', () => {
  it('includes both bounds', () => {
    expect(randomInt(constantRandom(0), [3, 5])).toBe(3)
    expect(randomInt(constantRandom(0.999), [3, 5])).toBe(5)
  })
})

describe('randomBetween', () => {
  it('scales the draw onto the range', () => {
    expect(randomBetween(constantRandom(0.5), [1, 3])).toBe(2)
  })
})

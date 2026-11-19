import { describe, expect, it } from 'vitest'
import { castRay, hasLineOfSight } from './raycast'

const room = ['#######', '#.....#', '#..#..#', '#.....#', '#######']
const opaque = (x: number, y: number) => room[y]?.charAt(x) !== '.'

describe('castRay', () => {
  it('stops at the boundary of the first opaque cell', () => {
    const hit = castRay({ x: 1.5, y: 1.5 }, 0, 20, opaque)
    expect(hit?.cell).toEqual({ x: 6, y: 1 })
    expect(hit?.distance).toBeCloseTo(4.5)
    expect(hit?.side).toBe('x')
  })

  it('reports a hit on a horizontal boundary as a y side', () => {
    const hit = castRay({ x: 1.5, y: 1.5 }, Math.PI / 2, 20, opaque)
    expect(hit?.cell).toEqual({ x: 1, y: 4 })
    expect(hit?.distance).toBeCloseTo(2.5)
    expect(hit?.side).toBe('y')
  })

  it('returns null when the opaque cell lies beyond the maximum distance', () => {
    expect(castRay({ x: 1.5, y: 1.5 }, 0, 4, opaque)).toBeNull()
  })

  it('follows slanted rays across cells', () => {
    const hit = castRay({ x: 1.5, y: 1.5 }, Math.atan2(1, 1.7), 20, opaque)
    expect(hit?.cell).toEqual({ x: 3, y: 2 })
    expect(hit?.side).toBe('x')
  })
})

describe('hasLineOfSight', () => {
  it('is clear across an open room', () => {
    expect(hasLineOfSight({ x: 1.5, y: 1.5 }, { x: 5.5, y: 1.5 }, opaque)).toBe(true)
  })

  it('is blocked by a wall in between', () => {
    expect(hasLineOfSight({ x: 1.5, y: 2.5 }, { x: 5.5, y: 2.5 }, opaque)).toBe(false)
  })

  it('is clear from a point to itself', () => {
    expect(hasLineOfSight({ x: 1.5, y: 1.5 }, { x: 1.5, y: 1.5 }, opaque)).toBe(true)
  })
})

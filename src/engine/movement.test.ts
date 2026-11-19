import { describe, expect, it } from 'vitest'
import { moveBox } from './movement'

const room = ['#####', '#...#', '#...#', '#####']
const blocked = (x: number, y: number) => room[y]?.charAt(x) !== '.'
const RADIUS = 0.25

describe('moveBox', () => {
  it('moves freely across open floor', () => {
    const position = moveBox({ x: 2, y: 2 }, { x: 0.2, y: -0.1 }, RADIUS, blocked)
    expect(position.x).toBeCloseTo(2.2)
    expect(position.y).toBeCloseTo(1.9)
  })

  it('stops against a wall, one radius away from it', () => {
    const position = moveBox({ x: 3.5, y: 2 }, { x: 0.3, y: 0 }, RADIUS, blocked)
    expect(position.x).toBeLessThan(4 - RADIUS)
    expect(position.x).toBeGreaterThan(4 - RADIUS - 0.01)
  })

  it('slides along a wall when moving diagonally into it', () => {
    const position = moveBox({ x: 2, y: 2.7 }, { x: 0.2, y: 0.2 }, RADIUS, blocked)
    expect(position.x).toBeCloseTo(2.2)
    expect(position.y).toBeLessThan(3 - RADIUS)
  })

  it('never lets the body overlap a corner', () => {
    let position = { x: 3.5, y: 2.5 }
    for (let step = 0; step < 20; step++) position = moveBox(position, { x: 0.1, y: 0.1 }, RADIUS, blocked)
    expect(position.x).toBeLessThan(4 - RADIUS)
    expect(position.y).toBeLessThan(3 - RADIUS)
  })
})

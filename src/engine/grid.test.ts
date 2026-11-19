import { describe, expect, it } from 'vitest'
import { cellAt, cellCenter, cellOf, normalizeAngle, overlapsCell } from './grid'
import type { Cell } from './types'

const grid = {
  width: 2,
  height: 1,
  cells: [{ type: 'empty' }, { type: 'wall', wall: 'server' }] satisfies Cell[],
}

describe('cellAt', () => {
  it('reads the cell at integer coordinates', () => {
    expect(cellAt(grid, 0, 0)).toEqual({ type: 'empty' })
    expect(cellAt(grid, 1, 0)).toEqual({ type: 'wall', wall: 'server' })
  })

  it('treats anything outside the map as a wall', () => {
    expect(cellAt(grid, -1, 0).type).toBe('wall')
    expect(cellAt(grid, 2, 0).type).toBe('wall')
    expect(cellAt(grid, 0, 1).type).toBe('wall')
  })
})

describe('cellOf and cellCenter', () => {
  it('round a position down to its cell and back to the centre of that cell', () => {
    expect(cellOf({ x: 3.9, y: 0.1 })).toEqual({ x: 3, y: 0 })
    expect(cellCenter({ x: 3, y: 0 })).toEqual({ x: 3.5, y: 0.5 })
  })
})

describe('overlapsCell', () => {
  it('detects a body reaching into the cell', () => {
    expect(overlapsCell({ x: 0.8, y: 0.5 }, 0.25, { x: 1, y: 0 })).toBe(true)
    expect(overlapsCell({ x: 0.7, y: 0.5 }, 0.25, { x: 1, y: 0 })).toBe(false)
  })
})

describe('normalizeAngle', () => {
  it('brings any angle into [-π, π)', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(Math.PI)).toBeCloseTo(-Math.PI)
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(-Math.PI)
    expect(normalizeAngle(-Math.PI / 2 - 2 * Math.PI)).toBeCloseTo(-Math.PI / 2)
  })
})

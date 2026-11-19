import { describe, expect, it } from 'vitest'
import { nextStep } from './pathfinding'

function grid(rows: string[]) {
  const width = rows[0]?.length ?? 0
  const passable = (x: number, y: number) => rows[y]?.charAt(x) === '.'
  return { width, height: rows.length, passable }
}

describe('nextStep', () => {
  it('heads straight along a corridor', () => {
    const { width, height, passable } = grid(['#####', '#...#', '#####'])
    expect(nextStep({ x: 1, y: 1 }, { x: 3, y: 1 }, width, height, passable)).toEqual({ x: 2, y: 1 })
  })

  it('goes around a wall', () => {
    const { width, height, passable } = grid(['#####', '#.#.#', '#...#', '#####'])
    expect(nextStep({ x: 1, y: 1 }, { x: 3, y: 1 }, width, height, passable)).toEqual({ x: 1, y: 2 })
  })

  it('enters the goal cell even when it is not passable', () => {
    const { width, height, passable } = grid(['####', '#.D#', '####'])
    expect(nextStep({ x: 1, y: 1 }, { x: 2, y: 1 }, width, height, passable)).toEqual({ x: 2, y: 1 })
  })

  it('is null when already at the goal', () => {
    const { width, height, passable } = grid(['###', '#.#', '###'])
    expect(nextStep({ x: 1, y: 1 }, { x: 1, y: 1 }, width, height, passable)).toBeNull()
  })

  it('is null when the goal cannot be reached', () => {
    const { width, height, passable } = grid(['#####', '#.#.#', '#####'])
    expect(nextStep({ x: 1, y: 1 }, { x: 3, y: 1 }, width, height, passable)).toBeNull()
  })
})

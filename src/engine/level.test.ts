import { describe, expect, it } from 'vitest'
import { parseLevel } from './level'

const theme = { floor: '#111111', ceiling: '#222222', fog: '#000000' }
const parse = (map: string[]) => parseLevel({ name: 'sample', theme, map })

describe('parseLevel', () => {
  const level = parse([
    '#####',
    '#>.d#',
    '#D#L#',
    '#+=k#',
    '#S$X#',
    '#####',
  ])

  it('reads the size and the walls', () => {
    expect(level.width).toBe(5)
    expect(level.height).toBe(6)
    expect(level.cells[0]).toEqual({ type: 'wall', wall: 'steel' })
    expect(level.cells[3 * 5 + 2]).toEqual({ type: 'wall', wall: 'server' })
    expect(level.cells[4 * 5 + 3]).toEqual({ type: 'wall', wall: 'exit' })
  })

  it('places the player at the centre of its cell, facing the arrow', () => {
    expect(level.start).toEqual({ position: { x: 1.5, y: 1.5 }, angle: 0 })
    expect(parse(['###', '#v#', '###']).start.angle).toBeCloseTo(Math.PI / 2)
    expect(parse(['###', '#<#', '###']).start.angle).toBeCloseTo(-Math.PI)
    expect(parse(['###', '#^#', '###']).start.angle).toBeCloseTo(-Math.PI / 2)
  })

  it('numbers the doors in reading order and finds the axis of each one from its walls', () => {
    expect(level.cells[2 * 5 + 1]).toEqual({ type: 'door', door: 0 })
    expect(level.cells[2 * 5 + 3]).toEqual({ type: 'door', door: 1 })
    expect(level.doors).toEqual([
      { cell: { x: 1, y: 2 }, locked: false, axis: 'x' },
      { cell: { x: 3, y: 2 }, locked: true, axis: 'x' },
    ])
    expect(parse(['#####', '#>D.#', '#####']).doors[0]?.axis).toBe('y')
  })

  it('lists enemies and pickups at the centre of their cells, on empty floor', () => {
    expect(level.enemies).toEqual([
      { kind: 'drone', position: { x: 3.5, y: 1.5 } },
      { kind: 'sentinel', position: { x: 1.5, y: 4.5 } },
    ])
    expect(level.pickups).toEqual([
      { kind: 'medkit', position: { x: 1.5, y: 3.5 } },
      { kind: 'keycard', position: { x: 3.5, y: 3.5 } },
      { kind: 'data', position: { x: 2.5, y: 4.5 } },
    ])
    expect(level.cells[1 * 5 + 3]).toEqual({ type: 'empty' })
  })

  it('rejects rows of different widths', () => {
    expect(() => parse(['###', '#>##', '###'])).toThrow('Row 1 of level "sample" has 4 cells instead of 3')
  })

  it('rejects unknown symbols', () => {
    expect(() => parse(['####', '#>?#', '####'])).toThrow('Unknown symbol "?" at (2, 1)')
  })

  it('rejects a border that is not entirely made of walls', () => {
    expect(() => parse(['###', '.>#', '###'])).toThrow('is open at (0, 1)')
  })

  it('requires exactly one player start', () => {
    expect(() => parse(['###', '#.#', '###'])).toThrow('exactly one player start, found 0')
    expect(() => parse(['####', '#>>#', '####'])).toThrow('exactly one player start, found 2')
  })

  it('requires every door to stand between two walls', () => {
    expect(() => parse(['#####', '#>..#', '#.D.#', '#...#', '#####'])).toThrow('Door at (2, 2)')
  })
})

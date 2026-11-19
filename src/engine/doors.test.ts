import { describe, expect, it } from 'vitest'
import { createDoor, DOOR_HOLD_TIME, isDoorOpen, openDoor, updateDoor } from './doors'
import type { Door } from './types'

const closedDoor = () => createDoor({ cell: { x: 2, y: 1 }, axis: 'y', locked: false })

function advance(door: Door, seconds: number, occupied = false): boolean[] {
  const started: boolean[] = []
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += 0.05) started.push(updateDoor(door, 0.05, occupied))
  return started
}

describe('doors', () => {
  it('start closed and block the way', () => {
    const door = closedDoor()
    expect(door.phase).toBe('closed')
    expect(isDoorOpen(door)).toBe(false)
  })

  it('open in half a second and only let through once fully open', () => {
    const door = closedDoor()
    expect(openDoor(door)).toBe(true)
    advance(door, 0.25)
    expect(door.openness).toBeCloseTo(0.5)
    expect(isDoorOpen(door)).toBe(false)
    advance(door, 0.25)
    expect(isDoorOpen(door)).toBe(true)
  })

  it('close on their own after a while, and say so once', () => {
    const door = closedDoor()
    openDoor(door)
    advance(door, 0.5)
    const started = advance(door, DOOR_HOLD_TIME + 0.6)
    expect(started.filter(Boolean)).toHaveLength(1)
    expect(door.phase).toBe('closed')
    expect(door.openness).toBe(0)
  })

  it('stay open while someone stands in the doorway', () => {
    const door = closedDoor()
    openDoor(door)
    advance(door, 0.5)
    advance(door, DOOR_HOLD_TIME * 3, true)
    expect(isDoorOpen(door)).toBe(true)
  })

  it('stay open longer when used again while open', () => {
    const door = closedDoor()
    openDoor(door)
    advance(door, 0.5)
    advance(door, DOOR_HOLD_TIME - 0.5)
    expect(openDoor(door)).toBe(false)
    advance(door, 1)
    expect(isDoorOpen(door)).toBe(true)
  })

  it('reopen when used while closing', () => {
    const door = closedDoor()
    openDoor(door)
    advance(door, 0.5)
    advance(door, DOOR_HOLD_TIME + 0.2)
    expect(door.phase).toBe('closing')
    expect(openDoor(door)).toBe(true)
    expect(door.phase).toBe('opening')
  })
})

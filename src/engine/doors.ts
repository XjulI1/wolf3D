import type { Door, DoorSpec } from './types'

/** Openness gained or lost per second. */
export const DOOR_SPEED = 2

/** Seconds a door stays fully open before closing. */
export const DOOR_HOLD_TIME = 3

const SNAP = 1e-6

export function createDoor(spec: DoorSpec): Door {
  return { cell: { ...spec.cell }, axis: spec.axis, locked: spec.locked, openness: 0, phase: 'closed', timer: 0 }
}

/** Only a fully open door lets bodies and bullets through. */
export function isDoorOpen(door: Door): boolean {
  return door.phase === 'open'
}

/** Starts opening the door, or keeps it open longer; true when the door starts moving. */
export function openDoor(door: Door): boolean {
  if (door.phase === 'open') {
    door.timer = DOOR_HOLD_TIME
    return false
  }
  if (door.phase === 'opening') return false
  door.phase = 'opening'
  return true
}

/** Advances the door; an occupied doorway never closes. True when the door starts closing. */
export function updateDoor(door: Door, dt: number, occupied: boolean): boolean {
  switch (door.phase) {
    case 'opening':
      door.openness = Math.min(1, door.openness + DOOR_SPEED * dt)
      if (door.openness < 1 - SNAP) return false
      door.openness = 1
      door.phase = 'open'
      door.timer = DOOR_HOLD_TIME
      return false
    case 'open':
      door.timer -= dt
      if (door.timer > 0 || occupied) return false
      door.phase = 'closing'
      return true
    case 'closing':
      door.openness = Math.max(0, door.openness - DOOR_SPEED * dt)
      if (door.openness > SNAP) return false
      door.openness = 0
      door.phase = 'closed'
      return false
    case 'closed':
      return false
  }
}

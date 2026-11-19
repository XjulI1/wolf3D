import type { Door } from '../engine'

export const DOOR_THICKNESS = 0.08

export type DoorPose = { position: readonly [number, number, number]; rotationY: number }

/** Where the door slab stands: centred in its cell when closed, slid into the wall when open. */
export function doorPose(door: Door): DoorPose {
  const centerX = door.cell.x + 0.5
  const centerZ = door.cell.y + 0.5
  if (door.axis === 'x') return { position: [centerX + door.openness, 0.5, centerZ], rotationY: 0 }
  return { position: [centerX, 0.5, centerZ + door.openness], rotationY: Math.PI / 2 }
}

import { cellAt, type Level, type Vec2, type WallKind } from '../engine'

/** A wall face is drawn with the texture of its wall, or as a door jamb when it faces a doorway. */
export type WallMaterial = WallKind | 'jamb'

export type FaceSide = 'north' | 'south' | 'west' | 'east'

export type WallFace = { cell: Vec2; side: FaceSide; material: WallMaterial }

export const WALL_MATERIALS: readonly WallMaterial[] = ['steel', 'concrete', 'server', 'exit', 'jamb']

/** Brightness of each side of a wall. */
export const FACE_SHADE: Record<FaceSide, number> = { north: 0.62, south: 0.62, west: 1, east: 1 }

const SIDES: readonly { side: FaceSide; dx: number; dy: number }[] = [
  { side: 'north', dx: 0, dy: -1 },
  { side: 'south', dx: 0, dy: 1 },
  { side: 'west', dx: -1, dy: 0 },
  { side: 'east', dx: 1, dy: 0 },
]

/** Every wall face that can be seen: the ones facing a floor or a door cell. */
export function wallFaces(level: Level): WallFace[] {
  const faces: WallFace[] = []
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const cell = cellAt(level, x, y)
      if (cell.type !== 'wall') continue
      for (const { side, dx, dy } of SIDES) {
        const neighbour = cellAt(level, x + dx, y + dy)
        if (neighbour.type === 'wall') continue
        faces.push({ cell: { x, y }, side, material: neighbour.type === 'door' ? 'jamb' : cell.wall })
      }
    }
  }
  return faces
}

/** The bottom edge of a face, from the left to the right of someone standing in front of it. */
export function faceEdge(face: WallFace): { left: Vec2; right: Vec2 } {
  const { x, y } = face.cell
  switch (face.side) {
    case 'north':
      return { left: { x: x + 1, y }, right: { x, y } }
    case 'south':
      return { left: { x, y: y + 1 }, right: { x: x + 1, y: y + 1 } }
    case 'west':
      return { left: { x, y }, right: { x, y: y + 1 } }
    case 'east':
      return { left: { x: x + 1, y: y + 1 }, right: { x: x + 1, y } }
  }
}

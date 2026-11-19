import { BufferGeometry, Float32BufferAttribute } from 'three'
import { FACE_SHADE, faceEdge, type WallFace, type WallMaterial } from './wallFaces'

export const WALL_HEIGHT = 1

const QUAD = [
  { end: 'left', top: false, u: 0, v: 0 },
  { end: 'right', top: false, u: 1, v: 0 },
  { end: 'right', top: true, u: 1, v: 1 },
  { end: 'left', top: false, u: 0, v: 0 },
  { end: 'right', top: true, u: 1, v: 1 },
  { end: 'left', top: true, u: 0, v: 1 },
] as const

type Buffers = { positions: number[]; uvs: number[]; colors: number[] }

/**
 * One geometry per material, made of a textured quad per face. The map `x` axis is the scene `x`
 * axis and the map `y` axis is the scene `z` axis; faces wind counter-clockwise towards the viewer.
 */
export function buildWallGeometries(faces: readonly WallFace[]): Map<WallMaterial, BufferGeometry> {
  const buffers = new Map<WallMaterial, Buffers>()
  for (const face of faces) {
    const buffer = buffers.get(face.material) ?? { positions: [], uvs: [], colors: [] }
    buffers.set(face.material, buffer)
    const edge = faceEdge(face)
    const light = FACE_SHADE[face.side]
    for (const corner of QUAD) {
      const point = edge[corner.end]
      buffer.positions.push(point.x, corner.top ? WALL_HEIGHT : 0, point.y)
      buffer.uvs.push(corner.u, corner.v)
      buffer.colors.push(light, light, light)
    }
  }
  return new Map([...buffers].map(([material, buffer]) => [material, toGeometry(buffer)]))
}

function toGeometry({ positions, uvs, colors }: Buffers): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeBoundingSphere()
  return geometry
}

import { describe, expect, it } from 'vitest'
import { cellAt, parseLevel } from '../engine'
import { buildWallGeometries, WALL_HEIGHT } from './wallGeometry'
import { faceEdge, wallFaces } from './wallFaces'

const level = parseLevel({
  name: 'faces',
  theme: { floor: '#000000', ceiling: '#000000', fog: '#000000' },
  map: ['#######', '#>....#', '#..=..#', '#.....#', '###D###', '#....X#', '#######'],
})

describe('wallFaces', () => {
  const faces = wallFaces(level)

  it('keeps only the faces turned towards floor or doors', () => {
    for (const face of faces) {
      const { left, right } = faceEdge(face)
      const normal = { x: -(right.y - left.y), y: right.x - left.x }
      const neighbour = cellAt(level, face.cell.x + normal.x, face.cell.y + normal.y)
      expect(neighbour.type).not.toBe('wall')
    }
  })

  it('shows all four sides of a free-standing pillar', () => {
    const pillar = faces.filter((face) => face.cell.x === 3 && face.cell.y === 2)
    expect(pillar.map((face) => face.side).sort()).toEqual(['east', 'north', 'south', 'west'])
    expect(pillar.every((face) => face.material === 'server')).toBe(true)
  })

  it('dresses the walls beside a door as jambs', () => {
    const jambs = faces.filter((face) => face.material === 'jamb')
    expect(jambs.map((face) => [face.cell.x, face.cell.y, face.side])).toEqual([
      [2, 4, 'east'],
      [4, 4, 'west'],
    ])
  })

  it('textures exit terminals as such', () => {
    expect(faces.filter((face) => face.material === 'exit').map((face) => face.side)).toEqual(['west'])
  })
})

describe('faceEdge', () => {
  it('runs from the left to the right of a viewer facing the wall', () => {
    expect(faceEdge({ cell: { x: 2, y: 3 }, side: 'south', material: 'steel' })).toEqual({
      left: { x: 2, y: 4 },
      right: { x: 3, y: 4 },
    })
    expect(faceEdge({ cell: { x: 2, y: 3 }, side: 'north', material: 'steel' })).toEqual({
      left: { x: 3, y: 3 },
      right: { x: 2, y: 3 },
    })
  })
})

describe('buildWallGeometries', () => {
  it('makes one geometry per material, with two triangles per face standing on the floor', () => {
    const faces = wallFaces(level)
    const geometries = buildWallGeometries(faces)
    const steel = geometries.get('steel')
    const steelFaces = faces.filter((face) => face.material === 'steel').length
    expect(steel?.getAttribute('position').count).toBe(steelFaces * 6)
    expect(steel?.getAttribute('uv').count).toBe(steelFaces * 6)
    const positions = steel?.getAttribute('position')
    const heights = new Set(Array.from({ length: positions?.count ?? 0 }, (_, index) => positions?.getY(index)))
    expect([...heights].sort()).toEqual([0, WALL_HEIGHT])
    expect([...geometries.keys()].sort()).toEqual(['exit', 'jamb', 'server', 'steel'])
  })
})

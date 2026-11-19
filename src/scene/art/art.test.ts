import { describe, expect, it } from 'vitest'
import type { EnemyKind, PickupKind, WeaponId } from '../../engine'
import type { PixelImage } from '../pixelArt'
import { ENEMY_FRAMES } from '../spriteFrames'
import { WALL_MATERIALS } from '../wallFaces'
import { paintEnemy, paintPickup, SPRITE_SIZE } from './sprites'
import { paintDoor, paintWall, TEXTURE_SIZE } from './walls'
import { paintWeapon, WEAPON_IMAGE_HEIGHT, WEAPON_IMAGE_WIDTH } from './weapons'

const alphas = (image: PixelImage) => Array.from(image.data).filter((_, index) => index % 4 === 3)

describe('wall and door textures', () => {
  const textures = [...WALL_MATERIALS.map(paintWall), paintDoor(false), paintDoor(true)]

  it('are square and fully opaque', () => {
    for (const image of textures) {
      expect([image.width, image.height]).toEqual([TEXTURE_SIZE, TEXTURE_SIZE])
      expect(alphas(image).every((alpha) => alpha === 255)).toBe(true)
    }
  })

  it('are painted the same way every time', () => {
    expect(paintWall('concrete').data).toEqual(paintWall('concrete').data)
  })

  it('tell a locked door from an unlocked one', () => {
    expect(paintDoor(true).data).not.toEqual(paintDoor(false).data)
  })
})

describe('sprites', () => {
  const kinds: EnemyKind[] = ['drone', 'sentinel']
  const pickups: PickupKind[] = ['medkit', 'ammo', 'rifle', 'keycard', 'data']
  const sprites = [
    ...kinds.flatMap((kind) => ENEMY_FRAMES.map((frame) => paintEnemy(kind, frame))),
    ...pickups.map(paintPickup),
  ]

  it('draw a shape on a transparent background', () => {
    for (const image of sprites) {
      expect([image.width, image.height]).toEqual([SPRITE_SIZE, SPRITE_SIZE])
      const opaque = alphas(image).filter((alpha) => alpha === 255).length
      expect(opaque).toBeGreaterThan(40)
      expect(opaque).toBeLessThan(SPRITE_SIZE * SPRITE_SIZE / 2)
    }
  })

  it('differ from one animation frame to the next', () => {
    for (const kind of kinds) {
      const frames = ENEMY_FRAMES.map((frame) => paintEnemy(kind, frame).data.join())
      expect(new Set(frames).size).toBe(ENEMY_FRAMES.length)
    }
  })
})

describe('weapon views', () => {
  it('show each weapon, with a muzzle flash when firing', () => {
    const weapons: WeaponId[] = ['pistol', 'rifle']
    for (const weapon of weapons) {
      const idle = paintWeapon(weapon, false)
      expect([idle.width, idle.height]).toEqual([WEAPON_IMAGE_WIDTH, WEAPON_IMAGE_HEIGHT])
      expect(paintWeapon(weapon, true).data).not.toEqual(idle.data)
    }
  })
})

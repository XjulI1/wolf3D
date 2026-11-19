import {
  DataTexture,
  LinearMipmapLinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  type Texture,
} from 'three'
import type { EnemyKind, PickupKind } from '../engine'
import { paintEnemy, paintPickup } from './art/sprites'
import { paintDoor, paintWall } from './art/walls'
import type { PixelImage } from './pixelArt'
import type { EnemyFrame } from './spriteFrames'
import type { WallMaterial } from './wallFaces'

export type FrameTextures = Record<EnemyFrame, DataTexture>

export type SceneTextures = {
  walls: Record<WallMaterial, DataTexture>
  doors: { standard: DataTexture; locked: DataTexture }
  enemies: Record<EnemyKind, FrameTextures>
  pickups: Record<PickupKind, DataTexture>
}

/** Uploads a pixel image as a nearest-filtered sRGB texture, optionally mipmapped. */
export function toTexture(image: PixelImage, { mipmaps = false } = {}): DataTexture {
  const stride = image.width * 4
  const rows = new Uint8Array(image.data.length)
  for (let y = 0; y < image.height; y++) {
    rows.set(image.data.subarray(y * stride, (y + 1) * stride), (image.height - 1 - y) * stride)
  }
  const texture = new DataTexture(rows, image.width, image.height, RGBAFormat, UnsignedByteType)
  texture.colorSpace = SRGBColorSpace
  texture.magFilter = NearestFilter
  texture.minFilter = mipmaps ? LinearMipmapLinearFilter : NearestFilter
  texture.generateMipmaps = mipmaps
  texture.needsUpdate = true
  return texture
}

export function createSceneTextures(): SceneTextures {
  const wall = (material: WallMaterial) => toTexture(paintWall(material), { mipmaps: true })
  return {
    walls: {
      steel: wall('steel'),
      concrete: wall('concrete'),
      server: wall('server'),
      exit: wall('exit'),
      jamb: wall('jamb'),
    },
    doors: {
      standard: toTexture(paintDoor(false), { mipmaps: true }),
      locked: toTexture(paintDoor(true), { mipmaps: true }),
    },
    enemies: { drone: enemyFrames('drone'), sentinel: enemyFrames('sentinel') },
    pickups: {
      medkit: toTexture(paintPickup('medkit')),
      ammo: toTexture(paintPickup('ammo')),
      rifle: toTexture(paintPickup('rifle')),
      keycard: toTexture(paintPickup('keycard')),
      data: toTexture(paintPickup('data')),
    },
  }
}

export function disposeSceneTextures(textures: SceneTextures): void {
  const all: Texture[] = [
    ...Object.values(textures.walls),
    ...Object.values(textures.doors),
    ...Object.values(textures.enemies).flatMap((frames) => Object.values(frames)),
    ...Object.values(textures.pickups),
  ]
  for (const texture of all) texture.dispose()
}

function enemyFrames(kind: EnemyKind): FrameTextures {
  const frame = (name: EnemyFrame) => toTexture(paintEnemy(kind, name))
  return {
    stand: frame('stand'),
    walk1: frame('walk1'),
    walk2: frame('walk2'),
    aim: frame('aim'),
    fire: frame('fire'),
    pain: frame('pain'),
    dying: frame('dying'),
    dead: frame('dead'),
  }
}

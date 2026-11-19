import { createRandom, type EnemyKind, type PickupKind } from '../../engine'
import {
  bevel,
  createImage,
  fillCircle,
  fillEllipse,
  fillRect,
  outline,
  rgb,
  setPixel,
  shade,
  tint,
  type PixelImage,
  type Rgba,
} from '../pixelArt'
import type { EnemyFrame } from '../spriteFrames'

export const SPRITE_SIZE = 64

const OUTLINE = rgb('#07090c')
const SHADOW = rgb('#0b0e12')
const WHITE = rgb('#ffffff')
const FLASH_OUTER = rgb('#ffd25a')
const FLASH_INNER = rgb('#fff6d5')
const SPARK = rgb('#ffe066')
const BLACK = rgb('#0d1117')

const DRONE_LIFT: Partial<Record<EnemyFrame, number>> = { walk1: -2, walk2: 1, dying: 12 }

export function paintEnemy(kind: EnemyKind, frame: EnemyFrame): PixelImage {
  const image = createImage(SPRITE_SIZE, SPRITE_SIZE)
  if (kind === 'drone') paintDrone(image, frame)
  else paintSentinel(image, frame)
  if (frame === 'pain') tint(image, WHITE, 0.55)
  outline(image, OUTLINE)
  return image
}

export function paintPickup(kind: PickupKind): PixelImage {
  const image = createImage(SPRITE_SIZE, SPRITE_SIZE)
  PICKUP_PAINTERS[kind](image)
  outline(image, OUTLINE)
  return image
}

function paintDrone(image: PixelImage, frame: EnemyFrame): void {
  const body = rgb('#4b5563')
  const metal = rgb('#6b7280')
  const metalDark = rgb('#2a303a')
  const blade = rgb('#a3adbb')
  if (frame === 'dead') {
    fillEllipse(image, 32, 58, 16, 4, shade(body, 0.7))
    fillRect(image, 17, 54, 11, 3, metal)
    fillRect(image, 38, 55, 10, 2, metalDark)
    fillRect(image, 20, 60, 14, 1, blade)
    fillCircle(image, 33, 56, 2, rgb('#3a0d0d'))
    return
  }
  const cy = 28 + (DRONE_LIFT[frame] ?? 0)
  fillEllipse(image, 32, 60, 11, 2.5, SHADOW)
  fillRect(image, 31, cy - 17, 2, 5, metalDark)
  const bladeWidth = frame === 'walk2' ? 12 : 28
  fillRect(image, 32 - bladeWidth / 2, cy - 18, bladeWidth, 2, blade)
  fillRect(image, 13, cy - 3, 9, 3, metalDark)
  fillRect(image, 42, cy - 3, 9, 3, metalDark)
  fillRect(image, 10, cy - 6, 4, 8, metal)
  fillRect(image, 50, cy - 6, 4, 8, metal)
  fillCircle(image, 32, cy, 12, body)
  fillEllipse(image, 32, cy + 5, 11, 6, shade(body, 0.75))
  fillCircle(image, 27, cy - 5, 4, shade(body, 1.35))
  fillRect(image, 21, cy - 1, 22, 2, shade(body, 0.6))
  fillCircle(image, 32, cy + 2, 5.5, BLACK)
  if (frame === 'aim') fillCircle(image, 32, cy + 2, 4.5, rgb('#ff8080'))
  fillCircle(image, 32, cy + 2, 3.5, droneLens(frame))
  setPixel(image, 31, cy + 1, WHITE)
  fillRect(image, 29, cy + 11, 6, 5, metalDark)
  fillRect(image, 31, cy + 15, 2, 4, BLACK)
  if (frame === 'fire') muzzleFlash(image, 32, cy + 21, 5)
  if (frame === 'dying') sparks(image, 32, cy, 7)
}

function droneLens(frame: EnemyFrame): Rgba {
  if (frame === 'aim') return rgb('#ff3030')
  if (frame === 'fire') return rgb('#ffe08a')
  if (frame === 'dying') return rgb('#3a0d0d')
  return rgb('#b91c1c')
}

function paintSentinel(image: PixelImage, frame: EnemyFrame): void {
  const armor = rgb('#7a8291')
  const armorDark = rgb('#4b5160')
  const joint = rgb('#2a2f38')
  const accent = rgb('#f59e0b')
  if (frame === 'dead') {
    fillEllipse(image, 32, 58, 19, 4, armorDark)
    fillRect(image, 16, 50, 22, 8, armor)
    fillRect(image, 16, 53, 22, 2, accent)
    fillRect(image, 40, 52, 11, 7, armor)
    fillRect(image, 42, 54, 7, 2, rgb('#0e3b42'))
    fillRect(image, 10, 57, 9, 3, joint)
    return
  }
  const sink = frame === 'dying' ? 8 : 0
  const [leftFoot, rightFoot] = frame === 'walk1' ? [56, 60] : frame === 'walk2' ? [60, 56] : [60, 60]
  fillEllipse(image, 32, 61, 13, 2.5, SHADOW)
  fillRect(image, 24, 44, 5, leftFoot - 44, joint)
  fillRect(image, 35, 44, 5, rightFoot - 44, joint)
  fillRect(image, 22, leftFoot - 2, 9, 3, armorDark)
  fillRect(image, 33, rightFoot - 2, 9, 3, armorDark)
  fillRect(image, 22, 41 + sink, 20, 4, joint)
  fillRect(image, 20, 22 + sink, 24, 20, armor)
  bevel(image, 20, 22 + sink, 24, 20, shade(armor, 1.3), armorDark)
  fillRect(image, 20, 34 + sink, 24, 2, accent)
  fillRect(image, 30, 26 + sink, 4, 4, sentinelVisor(frame))
  fillRect(image, 14, 21 + sink, 8, 8, armorDark)
  fillRect(image, 42, 21 + sink, 8, 8, armorDark)
  fillRect(image, 14, 21 + sink, 8, 2, accent)
  fillRect(image, 42, 21 + sink, 8, 2, accent)
  fillRect(image, 26, 10 + sink, 12, 11, armor)
  bevel(image, 26, 10 + sink, 12, 11, shade(armor, 1.3), armorDark)
  fillRect(image, 27, 14 + sink, 10, 3, sentinelVisor(frame))
  fillRect(image, 35, 6 + sink, 1, 4, joint)
  fillRect(image, 15, 29 + sink, 5, 14, armorDark)
  if (frame === 'aim' || frame === 'fire') {
    fillRect(image, 44, 28 + sink, 5, 8, armorDark)
    fillRect(image, 35, 30 + sink, 12, 8, joint)
    fillCircle(image, 40, 34 + sink, 2.5, BLACK)
    if (frame === 'fire') muzzleFlash(image, 40, 34 + sink, 6)
  } else {
    fillRect(image, 44, 29 + sink, 5, 12, armorDark)
    fillRect(image, 43, 41 + sink, 7, 6, joint)
  }
  if (frame === 'dying') sparks(image, 32, 30 + sink, 11)
}

function sentinelVisor(frame: EnemyFrame): Rgba {
  if (frame === 'aim' || frame === 'fire') return rgb('#ff3030')
  if (frame === 'dying') return rgb('#0e3b42')
  return rgb('#22d3ee')
}

function muzzleFlash(image: PixelImage, x: number, y: number, radius: number): void {
  fillCircle(image, x, y, radius, FLASH_OUTER)
  fillCircle(image, x, y, radius / 2, FLASH_INNER)
}

function sparks(image: PixelImage, x: number, y: number, seed: number): void {
  const random = createRandom(seed)
  for (let spark = 0; spark < 14; spark++) {
    setPixel(image, x + Math.floor((random() - 0.5) * 30), y + Math.floor((random() - 0.5) * 26), SPARK)
  }
}

const PICKUP_PAINTERS: Record<PickupKind, (image: PixelImage) => void> = {
  medkit: (image) => {
    const box = rgb('#e7e9ee')
    const red = rgb('#d62828')
    fillRect(image, 28, 43, 8, 3, rgb('#9aa0aa'))
    fillRect(image, 22, 46, 20, 15, box)
    bevel(image, 22, 46, 20, 15, WHITE, rgb('#9aa0aa'))
    fillRect(image, 30, 49, 4, 10, red)
    fillRect(image, 27, 52, 10, 4, red)
  },
  ammo: (image) => {
    const box = rgb('#4d5b2a')
    const brass = rgb('#d4a83a')
    for (let bullet = 0; bullet < 5; bullet++) {
      fillRect(image, 25 + bullet * 3, 48, 2, 5, brass)
      setPixel(image, 25 + bullet * 3, 47, rgb('#b07d26'))
    }
    fillRect(image, 23, 52, 18, 10, box)
    bevel(image, 23, 52, 18, 10, shade(box, 1.4), shade(box, 0.6))
    fillRect(image, 26, 55, 12, 3, rgb('#c9b458'))
  },
  rifle: (image) => {
    const metal = rgb('#2b2f36')
    const dark = rgb('#1c1f24')
    fillRect(image, 9, 53, 11, 6, rgb('#3b2f25'))
    fillRect(image, 20, 52, 24, 6, metal)
    fillRect(image, 44, 54, 12, 2, dark)
    fillRect(image, 30, 58, 4, 5, dark)
    fillRect(image, 27, 50, 7, 2, dark)
    fillRect(image, 22, 54, 5, 1, rgb('#39ff88'))
  },
  keycard: (image) => {
    const card = rgb('#2563eb')
    fillRect(image, 24, 48, 16, 12, card)
    bevel(image, 24, 48, 16, 12, shade(card, 1.4), shade(card, 0.6))
    fillRect(image, 27, 51, 4, 3, rgb('#facc15'))
    fillRect(image, 24, 56, 16, 2, rgb('#0b1d4d'))
    fillRect(image, 35, 50, 2, 2, rgb('#0b1d4d'))
  },
  data: (image) => {
    const pin = rgb('#c9b458')
    for (let index = 0; index < 4; index++) {
      fillRect(image, 26 + index * 4, 45, 2, 3, pin)
      fillRect(image, 26 + index * 4, 60, 2, 3, pin)
    }
    fillRect(image, 24, 48, 16, 12, rgb('#0b3b47'))
    bevel(image, 24, 48, 16, 12, rgb('#19e3ff'), rgb('#0a6f80'))
    fillRect(image, 29, 51, 6, 6, rgb('#19e3ff'))
    fillRect(image, 30, 52, 2, 2, WHITE)
  },
}

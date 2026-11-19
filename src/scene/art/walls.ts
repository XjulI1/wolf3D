import { createRandom } from '../../engine'
import {
  bevel,
  createImage,
  fillCircle,
  fillRect,
  rgb,
  setPixel,
  shade,
  shadeRect,
  speckle,
  type PixelImage,
  type Rgba,
} from '../pixelArt'
import type { WallMaterial } from '../wallFaces'

export const TEXTURE_SIZE = 64

const HAZARD_YELLOW = rgb('#d9a915')
const HAZARD_RED = rgb('#c0392b')
const HAZARD_DARK = rgb('#1d1d1d')
const SCREEN_GREEN = rgb('#39ff6a')

export function paintWall(material: WallMaterial): PixelImage {
  switch (material) {
    case 'steel':
      return paintSteel()
    case 'concrete':
      return paintConcrete()
    case 'server':
      return paintServer()
    case 'exit':
      return paintExit()
    case 'jamb':
      return paintJamb()
  }
}

export function paintDoor(locked: boolean): PixelImage {
  const base = rgb('#6f7c8b')
  const dark = shade(base, 0.55)
  const image = createImage(TEXTURE_SIZE, TEXTURE_SIZE)
  fillRect(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE, base)
  for (const y of [6, 16, 44, 54]) {
    fillRect(image, 2, y, 60, 2, shade(base, 0.72))
    fillRect(image, 2, y - 1, 60, 1, shade(base, 1.25))
  }
  hazardBand(image, 26, 12, locked ? HAZARD_RED : HAZARD_YELLOW)
  fillRect(image, 31, 0, 2, TEXTURE_SIZE, dark)
  fillRect(image, 25, 40, 3, 9, dark)
  fillRect(image, 36, 40, 3, 9, dark)
  if (locked) {
    fillRect(image, 44, 40, 9, 13, rgb('#1d2530'))
    fillRect(image, 46, 42, 5, 2, rgb('#ff3b3b'))
    fillRect(image, 46, 47, 5, 1, rgb('#0b0f14'))
  }
  bevel(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE, shade(base, 1.35), dark)
  speckle(image, createRandom(41), 0.05)
  return image
}

function panelled(base: Rgba, seed: number): PixelImage {
  const image = createImage(TEXTURE_SIZE, TEXTURE_SIZE)
  fillRect(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE, base)
  for (const py of [0, 32]) {
    for (const px of [0, 32]) {
      bevel(image, px, py, 32, 32, shade(base, 1.3), shade(base, 0.58))
      for (const [rx, ry] of [
        [3, 3],
        [27, 3],
        [3, 27],
        [27, 27],
      ] as const) {
        fillRect(image, px + rx, py + ry, 2, 2, shade(base, 1.45))
        setPixel(image, px + rx + 1, py + ry + 1, shade(base, 0.5))
      }
    }
  }
  speckle(image, createRandom(seed), 0.07)
  return image
}

function paintSteel(): PixelImage {
  const base = rgb('#5d6875')
  const image = panelled(base, 11)
  const random = createRandom(12)
  for (let scratch = 0; scratch < 6; scratch++) {
    const x = 6 + Math.floor(random() * 52)
    const y = 6 + Math.floor(random() * 40)
    fillRect(image, x, y, 1, 3 + Math.floor(random() * 8), shade(base, 1.2))
  }
  return image
}

function paintConcrete(): PixelImage {
  const base = rgb('#7b7469')
  const mortar = rgb('#4c473f')
  const image = createImage(TEXTURE_SIZE, TEXTURE_SIZE)
  const random = createRandom(21)
  for (let row = 0; row < 4; row++) {
    const y = row * 16
    for (let x = row % 2 === 0 ? 0 : -16; x < TEXTURE_SIZE; x += 32) {
      const block = shade(base, 0.86 + random() * 0.24)
      fillRect(image, x, y, 32, 16, block)
      fillRect(image, x + 1, y + 1, 31, 1, shade(block, 1.15))
      fillRect(image, x, y, 1, 16, mortar)
    }
    fillRect(image, 0, y, TEXTURE_SIZE, 1, mortar)
  }
  for (let crack = 0; crack < 3; crack++) {
    let x = 4 + Math.floor(random() * 56)
    let y = 4 + Math.floor(random() * 56)
    for (let step = 0; step < 7; step++) {
      setPixel(image, x, y, shade(mortar, 0.8))
      x += random() < 0.5 ? 1 : 0
      y += 1
    }
  }
  speckle(image, random, 0.12)
  return image
}

function paintServer(): PixelImage {
  const frame = rgb('#1b2027')
  const face = rgb('#2b333e')
  const vent = rgb('#151a20')
  const leds = [rgb('#39ff6a'), rgb('#ffb02e'), rgb('#24402c'), rgb('#19e3ff')]
  const image = createImage(TEXTURE_SIZE, TEXTURE_SIZE)
  const random = createRandom(31)
  fillRect(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE, frame)
  fillRect(image, 0, 0, 2, TEXTURE_SIZE, shade(frame, 1.4))
  fillRect(image, 62, 0, 2, TEXTURE_SIZE, shade(frame, 0.6))
  for (let unit = 0; unit < 4; unit++) {
    const y = 2 + unit * 15
    fillRect(image, 4, y, 56, 13, face)
    bevel(image, 4, y, 56, 13, shade(face, 1.35), vent)
    for (let x = 34; x < 57; x += 2) fillRect(image, x, y + 3, 1, 7, vent)
    for (let led = 0; led < 5; led++) {
      const color = leds[Math.floor(random() * leds.length)] ?? face
      fillRect(image, 7 + led * 5, y + 4, 2, 2, color)
    }
    fillRect(image, 7, y + 9, 22, 1, vent)
  }
  speckle(image, random, 0.04)
  return image
}

function paintExit(): PixelImage {
  const image = panelled(rgb('#4d5a50'), 51)
  const screen = rgb('#06210f')
  fillRect(image, 9, 9, 46, 32, screen)
  bevel(image, 9, 9, 46, 32, rgb('#030a05'), rgb('#3c5a45'))
  fillRect(image, 17, 23, 20, 5, SCREEN_GREEN)
  for (let column = 0; column < 9; column++) fillRect(image, 37 + column, 17 + column, 1, 17 - 2 * column, SCREEN_GREEN)
  for (let y = 11; y < 40; y += 2) shadeRect(image, 10, y, 44, 1, 0.75)
  fillCircle(image, 32, 52, 6, rgb('#0c3d1c'))
  fillCircle(image, 32, 52, 4.5, rgb('#1fae4b'))
  fillRect(image, 30, 49, 2, 2, rgb('#9dffbe'))
  return image
}

function paintJamb(): PixelImage {
  const image = panelled(rgb('#56616e'), 61)
  const random = createRandom(62)
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 24; x < 40; x++) setPixel(image, x, y, ((x + y) >> 3) % 2 === 0 ? HAZARD_YELLOW : HAZARD_DARK)
  }
  fillRect(image, 23, 0, 1, TEXTURE_SIZE, HAZARD_DARK)
  fillRect(image, 40, 0, 1, TEXTURE_SIZE, HAZARD_DARK)
  speckle(image, random, 0.06)
  return image
}

function hazardBand(image: PixelImage, top: number, height: number, stripe: Rgba): void {
  for (let y = top; y < top + height; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) setPixel(image, x, y, ((x + y) >> 2) % 2 === 0 ? stripe : HAZARD_DARK)
  }
  fillRect(image, 0, top - 1, TEXTURE_SIZE, 1, HAZARD_DARK)
  fillRect(image, 0, top + height, TEXTURE_SIZE, 1, HAZARD_DARK)
}

import { describe, expect, it } from 'vitest'
import { createRandom } from '../engine'
import {
  bevel,
  createImage,
  fillCircle,
  fillRect,
  getPixel,
  mix,
  outline,
  rgb,
  setPixel,
  shade,
  speckle,
  tint,
} from './pixelArt'

const RED = rgb('#ff0000')
const BLUE = rgb('#0000ff')

describe('colours', () => {
  it('parse hexadecimal notation, opaque by default', () => {
    expect(rgb('#19e3ff')).toEqual([0x19, 0xe3, 0xff, 255])
    expect(rgb('#000000', 0)).toEqual([0, 0, 0, 0])
  })

  it('shade and mix within the byte range, keeping the alpha', () => {
    expect(shade(rgb('#808080'), 3)).toEqual([255, 255, 255, 255])
    expect(shade(rgb('#808080'), 0.5)).toEqual([64, 64, 64, 255])
    expect(mix(RED, BLUE, 0.5)).toEqual([128, 0, 128, 255])
  })
})

describe('drawing', () => {
  it('starts fully transparent', () => {
    const image = createImage(4, 4)
    expect(getPixel(image, 2, 2)).toEqual([0, 0, 0, 0])
  })

  it('ignores pixels outside the image', () => {
    const image = createImage(2, 2)
    setPixel(image, -1, 0, RED)
    setPixel(image, 2, 1, RED)
    expect(Array.from(image.data).every((value) => value === 0)).toBe(true)
  })

  it('fills rectangles, clipped to the image', () => {
    const image = createImage(4, 4)
    fillRect(image, 2, 2, 5, 5, RED)
    expect(getPixel(image, 3, 3)).toEqual(RED)
    expect(getPixel(image, 1, 1)[3]).toBe(0)
  })

  it('fills circles around their centre', () => {
    const image = createImage(9, 9)
    fillCircle(image, 4.5, 4.5, 3, BLUE)
    expect(getPixel(image, 4, 4)).toEqual(BLUE)
    expect(getPixel(image, 0, 0)[3]).toBe(0)
  })

  it('bevels with light top-left edges and dark bottom-right ones', () => {
    const image = createImage(4, 4)
    bevel(image, 0, 0, 4, 4, RED, BLUE)
    expect(getPixel(image, 1, 0)).toEqual(RED)
    expect(getPixel(image, 0, 2)).toEqual(RED)
    expect(getPixel(image, 2, 3)).toEqual(BLUE)
    expect(getPixel(image, 3, 1)).toEqual(BLUE)
  })

  it('outlines opaque shapes on their transparent neighbours only', () => {
    const image = createImage(5, 5)
    setPixel(image, 2, 2, RED)
    outline(image, BLUE)
    expect(getPixel(image, 2, 2)).toEqual(RED)
    expect(getPixel(image, 2, 1)).toEqual(BLUE)
    expect(getPixel(image, 1, 2)).toEqual(BLUE)
    expect(getPixel(image, 1, 1)[3]).toBe(0)
  })

  it('speckles and tints opaque pixels only', () => {
    const image = createImage(2, 1)
    setPixel(image, 0, 0, rgb('#808080'))
    speckle(image, createRandom(3), 0.2)
    tint(image, RED, 1)
    expect(getPixel(image, 0, 0)).toEqual(RED)
    expect(getPixel(image, 1, 0)).toEqual([0, 0, 0, 0])
  })
})

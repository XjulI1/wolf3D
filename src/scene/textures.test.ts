import { NearestFilter, SRGBColorSpace } from 'three'
import { describe, expect, it } from 'vitest'
import { createImage, rgb, setPixel } from './pixelArt'
import { toTexture } from './textures'

describe('toTexture', () => {
  it('turns the image upside down, since textures start from the bottom row', () => {
    const image = createImage(1, 2)
    setPixel(image, 0, 0, rgb('#ff0000'))
    setPixel(image, 0, 1, rgb('#0000ff'))
    const texture = toTexture(image)
    expect(Array.from(texture.image.data ?? [])).toEqual([0, 0, 255, 255, 255, 0, 0, 255])
  })

  it('keeps pixels crisp and colours in sRGB', () => {
    const texture = toTexture(createImage(2, 2))
    expect(texture.magFilter).toBe(NearestFilter)
    expect(texture.minFilter).toBe(NearestFilter)
    expect(texture.colorSpace).toBe(SRGBColorSpace)
  })
})

import type { WeaponId } from '../../engine'
import { paintWeapon } from '../../scene/art/weapons'
import type { PixelImage } from '../../scene/pixelArt'

export type WeaponImages = Record<WeaponId, { idle: string; firing: string }>

let cache: WeaponImages | null = null

/** Data URLs of the weapon views, painted once; empty where the browser cannot draw on a canvas. */
export function weaponImages(): WeaponImages {
  cache ??= {
    pistol: { idle: toDataUrl(paintWeapon('pistol', false)), firing: toDataUrl(paintWeapon('pistol', true)) },
    rifle: { idle: toDataUrl(paintWeapon('rifle', false)), firing: toDataUrl(paintWeapon('rifle', true)) },
  }
  return cache
}

function toDataUrl(image: PixelImage): string {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context || typeof ImageData === 'undefined') return ''
  context.putImageData(new ImageData(image.data, image.width, image.height), 0, 0)
  return canvas.toDataURL()
}

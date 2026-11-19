import type { WeaponId } from '../../engine'
import { createImage, fillCircle, fillEllipse, fillRect, outline, rgb, type PixelImage } from '../pixelArt'

export const WEAPON_IMAGE_WIDTH = 64
export const WEAPON_IMAGE_HEIGHT = 48

const GLOVE = rgb('#2b2723')
const GLOVE_LIGHT = rgb('#4a443d')
const METAL = rgb('#3c4350')
const METAL_LIGHT = rgb('#626c7c')
const METAL_DARK = rgb('#1d2128')
const ACCENT = rgb('#39ff88')
const FLASH_OUTER = rgb('#ffd25a')
const FLASH_INNER = rgb('#fff1c2')
const OUTLINE = rgb('#07090c')

/** The weapon held in front of the player, seen from behind, muzzle up. */
export function paintWeapon(weapon: WeaponId, firing: boolean): PixelImage {
  const image = createImage(WEAPON_IMAGE_WIDTH, WEAPON_IMAGE_HEIGHT)
  if (weapon === 'pistol') paintPistol(image, firing)
  else paintRifle(image, firing)
  outline(image, OUTLINE)
  return image
}

function paintPistol(image: PixelImage, firing: boolean): void {
  const recoil = firing ? 3 : 0
  if (firing) flash(image, 32, 9, 7)
  fillRect(image, 27, 14 + recoil, 10, 21, METAL)
  fillRect(image, 28, 15 + recoil, 2, 19, METAL_LIGHT)
  fillRect(image, 36, 14 + recoil, 1, 21, METAL_DARK)
  fillRect(image, 30, 13 + recoil, 4, 2, METAL_DARK)
  fillRect(image, 31, 11 + recoil, 2, 2, METAL_LIGHT)
  fillRect(image, 29, 24 + recoil, 6, 1, ACCENT)
  fillRect(image, 28, 35 + recoil, 8, 5, METAL_DARK)
  fillEllipse(image, 32, 45 + recoil, 13, 8, GLOVE)
  fillRect(image, 21, 39 + recoil, 22, 3, GLOVE_LIGHT)
  fillEllipse(image, 38, 37 + recoil, 4, 3, GLOVE_LIGHT)
}

function paintRifle(image: PixelImage, firing: boolean): void {
  const recoil = firing ? 2 : 0
  if (firing) flash(image, 32, 5, 6)
  fillRect(image, 30, 7 + recoil, 4, 13, METAL_DARK)
  fillRect(image, 26, 18 + recoil, 12, 12, rgb('#2f353f'))
  for (let y = 20; y < 29; y += 3) fillRect(image, 28, y + recoil, 8, 1, METAL_DARK)
  fillRect(image, 27, 27 + recoil, 10, 2, METAL_DARK)
  fillRect(image, 24, 30 + recoil, 16, 12, METAL)
  fillRect(image, 25, 31 + recoil, 2, 10, METAL_LIGHT)
  fillRect(image, 37, 33 + recoil, 1, 6, ACCENT)
  fillEllipse(image, 21, 27 + recoil, 6, 5, GLOVE)
  fillRect(image, 18, 24 + recoil, 7, 2, GLOVE_LIGHT)
  fillEllipse(image, 37, 45 + recoil, 11, 6, GLOVE)
  fillRect(image, 29, 41 + recoil, 14, 2, GLOVE_LIGHT)
}

function flash(image: PixelImage, x: number, y: number, radius: number): void {
  fillCircle(image, x, y, radius, FLASH_OUTER)
  fillCircle(image, x, y, radius / 2, FLASH_INNER)
}

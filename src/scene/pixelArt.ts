import type { Random } from '../engine'

export type Rgba = readonly [number, number, number, number]

/** An RGBA image, row 0 at the top, ready to become a texture or an `ImageData`. */
export type PixelImage = { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> }

export function createImage(width: number, height: number): PixelImage {
  return { width, height, data: new Uint8ClampedArray(width * height * 4) }
}

export function rgb(hex: string, alpha = 255): Rgba {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff, alpha]
}

export function shade(color: Rgba, factor: number): Rgba {
  return [channel(color[0] * factor), channel(color[1] * factor), channel(color[2] * factor), color[3]]
}

export function mix(from: Rgba, to: Rgba, amount: number): Rgba {
  const blend = (a: number, b: number) => channel(a + (b - a) * amount)
  return [blend(from[0], to[0]), blend(from[1], to[1]), blend(from[2], to[2]), from[3]]
}

export function getPixel(image: PixelImage, x: number, y: number): Rgba {
  const offset = (y * image.width + x) * 4
  const { data } = image
  return [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0, data[offset + 3] ?? 0]
}

export function setPixel(image: PixelImage, x: number, y: number, color: Rgba): void {
  const px = Math.floor(x)
  const py = Math.floor(y)
  if (px < 0 || py < 0 || px >= image.width || py >= image.height) return
  image.data.set(color, (py * image.width + px) * 4)
}

export function fillRect(image: PixelImage, x: number, y: number, width: number, height: number, color: Rgba): void {
  for (let py = y; py < y + height; py++) {
    for (let px = x; px < x + width; px++) setPixel(image, px, py, color)
  }
}

export function shadeRect(image: PixelImage, x: number, y: number, width: number, height: number, factor: number): void {
  for (let py = y; py < y + height; py++) {
    for (let px = x; px < x + width; px++) {
      if (px >= 0 && py >= 0 && px < image.width && py < image.height) {
        setPixel(image, px, py, shade(getPixel(image, px, py), factor))
      }
    }
  }
}

export function fillEllipse(image: PixelImage, cx: number, cy: number, rx: number, ry: number, color: Rgba): void {
  for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py++) {
    for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px++) {
      const dx = (px + 0.5 - cx) / rx
      const dy = (py + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) setPixel(image, px, py, color)
    }
  }
}

export function fillCircle(image: PixelImage, cx: number, cy: number, radius: number, color: Rgba): void {
  fillEllipse(image, cx, cy, radius, radius, color)
}

/** A one-pixel frame: light along the top and left edges, dark along the bottom and right ones. */
export function bevel(image: PixelImage, x: number, y: number, width: number, height: number, light: Rgba, dark: Rgba): void {
  fillRect(image, x, y, width, 1, light)
  fillRect(image, x, y, 1, height, light)
  fillRect(image, x, y + height - 1, width, 1, dark)
  fillRect(image, x + width - 1, y, 1, height, dark)
}

/** Randomly lightens or darkens every opaque pixel by up to `strength`. */
export function speckle(image: PixelImage, random: Random, strength: number): void {
  forEachOpaquePixel(image, (x, y, color) => setPixel(image, x, y, shade(color, 1 + (random() * 2 - 1) * strength)))
}

/** Moves every opaque pixel towards `color`. */
export function tint(image: PixelImage, color: Rgba, amount: number): void {
  forEachOpaquePixel(image, (x, y, current) => setPixel(image, x, y, mix(current, color, amount)))
}

/** Draws `color` on every transparent pixel touching an opaque one. */
export function outline(image: PixelImage, color: Rgba): void {
  const opaque = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < image.width && y < image.height && (image.data[(y * image.width + x) * 4 + 3] ?? 0) > 0
  const border: [number, number][] = []
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (!opaque(x, y) && (opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1))) {
        border.push([x, y])
      }
    }
  }
  for (const [x, y] of border) setPixel(image, x, y, color)
}

function forEachOpaquePixel(image: PixelImage, visit: (x: number, y: number, color: Rgba) => void): void {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const color = getPixel(image, x, y)
      if (color[3] > 0) visit(x, y, color)
    }
  }
}

function channel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

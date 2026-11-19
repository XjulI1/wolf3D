export const CAMERA_FOV = 62
export const CAMERA_NEAR = 0.05
export const CAMERA_FAR = 48

/** Rendering resolution relative to CSS pixels. */
export const RENDER_SCALE = 0.5

export const FOG_NEAR = 2
export const FOG_FAR = 20

export const EYE_HEIGHT = 0.5
export const BOB_HEIGHT = 0.03
const BOB_RATE = Math.PI * 0.9

/** Camera rotation around the vertical axis that looks along the map angle (0 east, π/2 south). */
export function cameraYaw(angle: number): number {
  return -angle - Math.PI / 2
}

/** Eye height, bobbing with the distance walked. */
export function eyeHeight(stride: number): number {
  return EYE_HEIGHT + (Math.abs(Math.sin(stride * BOB_RATE)) - 0.5) * BOB_HEIGHT
}

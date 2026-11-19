import { describe, expect, it } from 'vitest'
import type { Door, Enemy } from '../engine'
import { BOB_HEIGHT, cameraYaw, EYE_HEIGHT, eyeHeight } from './cameraPose'
import { doorPose } from './doorPose'
import { enemyFrame, MUZZLE_FLASH_TIME, STRIDE_PER_FRAME } from './spriteFrames'

describe('cameraYaw', () => {
  it.each([0, Math.PI / 2, -Math.PI / 2, 2.5, -1])('looks along the map angle %f', (angle) => {
    const yaw = cameraYaw(angle)
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) }
    expect(forward.x).toBeCloseTo(Math.cos(angle))
    expect(forward.z).toBeCloseTo(Math.sin(angle))
  })
})

describe('eyeHeight', () => {
  it('bobs gently around the eye height as the player walks', () => {
    for (let stride = 0; stride < 5; stride += 0.1) {
      expect(Math.abs(eyeHeight(stride) - EYE_HEIGHT)).toBeLessThanOrEqual(BOB_HEIGHT / 2 + 1e-9)
    }
    expect(eyeHeight(0.3)).not.toBe(eyeHeight(0.6))
  })
})

describe('doorPose', () => {
  const door = (axis: Door['axis'], openness: number): Door => ({
    cell: { x: 4, y: 7 },
    axis,
    locked: false,
    openness,
    phase: 'opening',
    timer: 0,
  })

  it('centres a closed door in its cell', () => {
    expect(doorPose(door('x', 0))).toEqual({ position: [4.5, 0.5, 7.5], rotationY: 0 })
    expect(doorPose(door('y', 0))).toEqual({ position: [4.5, 0.5, 7.5], rotationY: Math.PI / 2 })
  })

  it('slides an opening door along its axis, into the wall', () => {
    expect(doorPose(door('x', 0.5)).position).toEqual([5, 0.5, 7.5])
    expect(doorPose(door('y', 1)).position).toEqual([4.5, 0.5, 8.5])
  })
})

describe('enemyFrame', () => {
  const enemy = (overrides: Partial<Enemy>): Enemy => ({
    id: 1,
    kind: 'drone',
    position: { x: 1.5, y: 1.5 },
    health: 25,
    state: 'chase',
    timer: 0,
    cooldown: 0,
    waypoint: null,
    repath: 0,
    stride: 0,
    firedAt: -Infinity,
    ...overrides,
  })

  it('shows the state of the enemy', () => {
    expect(enemyFrame(enemy({ state: 'idle' }), 0)).toBe('stand')
    expect(enemyFrame(enemy({ state: 'aim' }), 0)).toBe('aim')
    expect(enemyFrame(enemy({ state: 'pain' }), 0)).toBe('pain')
    expect(enemyFrame(enemy({ state: 'dying' }), 0)).toBe('dying')
    expect(enemyFrame(enemy({ state: 'dead' }), 0)).toBe('dead')
  })

  it('flashes right after a shot', () => {
    expect(enemyFrame(enemy({ firedAt: 10 }), 10 + MUZZLE_FLASH_TIME / 2)).toBe('fire')
    expect(enemyFrame(enemy({ firedAt: 10 }), 10 + MUZZLE_FLASH_TIME * 2)).not.toBe('fire')
  })

  it('alternates two steps while walking', () => {
    expect(enemyFrame(enemy({ stride: 0 }), 0)).toBe('walk1')
    expect(enemyFrame(enemy({ stride: STRIDE_PER_FRAME * 1.5 }), 0)).toBe('walk2')
    expect(enemyFrame(enemy({ stride: STRIDE_PER_FRAME * 2.5 }), 0)).toBe('walk1')
  })
})

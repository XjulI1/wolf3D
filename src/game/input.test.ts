import { describe, expect, it, vi } from 'vitest'
import { createInputController, MOUSE_SENSITIVITY } from './input'

const key = (code: string, repeat = false) => ({ code, repeat, preventDefault: vi.fn() })

describe('createInputController', () => {
  it('moves with the WASD / ZQSD key positions and the arrows', () => {
    const input = createInputController()
    input.keyDown(key('KeyW'))
    expect(input.sample().forward).toBe(1)
    input.keyDown(key('ArrowDown'))
    expect(input.sample().forward).toBe(0)
    input.keyUp(key('KeyW'))
    expect(input.sample().forward).toBe(-1)
  })

  it('strafes, turns and runs while the keys are held', () => {
    const input = createInputController()
    input.keyDown(key('KeyD'))
    input.keyDown(key('ArrowLeft'))
    input.keyDown(key('ShiftLeft'))
    expect(input.sample()).toMatchObject({ strafe: 1, turn: -1, run: true })
    input.keyUp(key('KeyD'))
    input.keyUp(key('ArrowLeft'))
    input.keyUp(key('ShiftLeft'))
    expect(input.sample()).toMatchObject({ strafe: 0, turn: 0, run: false })
  })

  it('turns by the mouse movement gathered since the last frame', () => {
    const input = createInputController()
    input.mouseMove(10)
    input.mouseMove(30)
    expect(input.sample().look).toBeCloseTo(40 * MOUSE_SENSITIVITY)
    expect(input.sample().look).toBe(0)
  })

  it('uses once per key press, not while the key repeats', () => {
    const input = createInputController()
    input.keyDown(key('KeyE'))
    expect(input.sample().use).toBe(true)
    expect(input.sample().use).toBe(false)
    input.keyDown(key('KeyE', true))
    expect(input.sample().use).toBe(false)
    input.keyDown(key('Space'))
    expect(input.sample().use).toBe(true)
  })

  it('fires while the main mouse button or Control is held', () => {
    const input = createInputController()
    input.mouseDown(0)
    expect(input.sample().fire).toBe(true)
    expect(input.sample().fire).toBe(true)
    input.mouseUp(0)
    expect(input.sample().fire).toBe(false)
    input.mouseDown(2)
    expect(input.sample().fire).toBe(false)
    input.keyDown(key('ControlLeft'))
    expect(input.sample().fire).toBe(true)
  })

  it('asks for a weapon once per key press', () => {
    const input = createInputController()
    input.keyDown(key('Digit2'))
    expect(input.sample().weapon).toBe('rifle')
    expect(input.sample().weapon).toBeNull()
  })

  it('leaves unbound keys to the browser', () => {
    const input = createInputController()
    const unbound = key('KeyM')
    input.keyDown(unbound)
    expect(unbound.preventDefault).not.toHaveBeenCalled()
    const bound = key('KeyW')
    input.keyDown(bound)
    expect(bound.preventDefault).toHaveBeenCalled()
  })

  it('forgets everything on reset', () => {
    const input = createInputController()
    input.keyDown(key('KeyW'))
    input.mouseDown(0)
    input.mouseMove(50)
    input.reset()
    expect(input.sample()).toMatchObject({ forward: 0, fire: false, look: 0 })
  })
})

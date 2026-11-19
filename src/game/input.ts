import { IDLE_INPUT, type PlayerInput, type WeaponId } from '../engine'

export type InputSource = { sample: () => PlayerInput }

type HeldAction = 'forward' | 'backward' | 'strafeLeft' | 'strafeRight' | 'turnLeft' | 'turnRight' | 'run' | 'fire'

type KeyAction = HeldAction | 'use' | WeaponId

export type KeyEventLike = Pick<KeyboardEvent, 'code' | 'repeat' | 'preventDefault'>

/** Radians turned per pixel of mouse movement. */
export const MOUSE_SENSITIVITY = 0.0025

const KEY_BINDINGS: Partial<Record<string, KeyAction>> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'strafeLeft',
  KeyD: 'strafeRight',
  ArrowLeft: 'turnLeft',
  ArrowRight: 'turnRight',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  ControlLeft: 'fire',
  ControlRight: 'fire',
  KeyE: 'use',
  Space: 'use',
  Digit1: 'pistol',
  Numpad1: 'pistol',
  Digit2: 'rifle',
  Numpad2: 'rifle',
}

const MAIN_BUTTON = 0

export type InputController = InputSource & {
  keyDown: (event: KeyEventLike) => void
  keyUp: (event: KeyEventLike) => void
  mouseMove: (movementX: number) => void
  mouseDown: (button: number) => void
  mouseUp: (button: number) => void
  reset: () => void
}

/** Collects keyboard and mouse events between two frames, then hands them over as one input. */
export function createInputController(sensitivity = MOUSE_SENSITIVITY): InputController {
  const held = new Set<HeldAction>()
  let look = 0
  let use = false
  let weapon: WeaponId | null = null
  let mouseFire = false

  const axis = (positive: HeldAction, negative: HeldAction) => (held.has(positive) ? 1 : 0) - (held.has(negative) ? 1 : 0)

  return {
    keyDown(event) {
      const action = KEY_BINDINGS[event.code]
      if (!action) return
      event.preventDefault()
      if (action === 'use') use ||= !event.repeat
      else if (action === 'pistol' || action === 'rifle') weapon = action
      else held.add(action)
    },
    keyUp(event) {
      const action = KEY_BINDINGS[event.code]
      if (action && action !== 'use' && action !== 'pistol' && action !== 'rifle') held.delete(action)
    },
    mouseMove(movementX) {
      look += movementX * sensitivity
    },
    mouseDown(button) {
      if (button === MAIN_BUTTON) mouseFire = true
    },
    mouseUp(button) {
      if (button === MAIN_BUTTON) mouseFire = false
    },
    reset() {
      held.clear()
      look = 0
      use = false
      weapon = null
      mouseFire = false
    },
    sample() {
      const input: PlayerInput = {
        ...IDLE_INPUT,
        forward: axis('forward', 'backward'),
        strafe: axis('strafeRight', 'strafeLeft'),
        turn: axis('turnRight', 'turnLeft'),
        look,
        run: held.has('run'),
        fire: mouseFire || held.has('fire'),
        use,
        weapon,
      }
      look = 0
      use = false
      weapon = null
      return input
    },
  }
}

import { markRaw, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { stepWorld, type Pickup, type World, type WorldEvent, type WorldStatus } from '../engine'
import type { AudioPlayer } from './audio'
import { hudOf, sameHud, type HudState } from './hud'
import type { InputSource } from './input'
import { messageFor } from './messages'
import { soundFor } from './sounds'
import { samePose, weaponPose, type WeaponPose } from './weaponPose'

export type GameMessage = { id: number; text: string }

/** A level being played: the engine world (not reactive) and the reactive state drawn from it. */
export type GameSession = {
  world: World
  levelNumber: number
  hud: Readonly<ShallowRef<HudState>>
  weapon: Readonly<ShallowRef<WeaponPose>>
  pickups: Readonly<ShallowRef<readonly Pickup[]>>
  status: Readonly<Ref<WorldStatus>>
  hurtCount: Readonly<Ref<number>>
  pickupCount: Readonly<Ref<number>>
  message: Readonly<ShallowRef<GameMessage | null>>
  paused: Ref<boolean>
  tick: (delta: number) => void
}

export function createGameSession(
  world: World,
  options: { levelNumber: number; input: InputSource; audio: AudioPlayer },
): GameSession {
  const raw = markRaw(world)
  const hud = shallowRef(hudOf(raw, options.levelNumber))
  const weapon = shallowRef(weaponPose(raw.player, raw.time))
  const pickups = shallowRef<readonly Pickup[]>([...raw.pickups])
  const status = ref<WorldStatus>(raw.status)
  const hurtCount = ref(0)
  const pickupCount = ref(0)
  const message = shallowRef<GameMessage | null>(null)
  const paused = ref(true)
  let messages = 0

  function handle(event: WorldEvent): void {
    const cue = soundFor(event, raw)
    if (cue) options.audio.play(cue.sound, cue.volume)
    const text = messageFor(event)
    if (text) {
      messages += 1
      message.value = { id: messages, text }
    }
    if (event.type === 'playerHurt') hurtCount.value += 1
    if (event.type === 'pickupCollected') pickupCount.value += 1
    if (event.type === 'pickupDropped') pickups.value = [...raw.pickups]
  }

  function refresh(): void {
    const nextHud = hudOf(raw, options.levelNumber)
    if (!sameHud(hud.value, nextHud)) hud.value = nextHud
    const nextPose = weaponPose(raw.player, raw.time)
    if (!samePose(weapon.value, nextPose)) weapon.value = nextPose
    status.value = raw.status
  }

  return {
    world: raw,
    levelNumber: options.levelNumber,
    hud,
    weapon,
    pickups,
    status,
    hurtCount,
    pickupCount,
    message,
    paused,
    tick(delta) {
      const input = options.input.sample()
      if (paused.value) return
      for (const event of stepWorld(raw, input, delta)) handle(event)
      refresh()
    },
  }
}

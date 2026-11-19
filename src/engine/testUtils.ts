import { parseLevel } from './level'
import { createRandom } from './rng'
import type { Loadout, PlayerInput, Random, World, WorldEvent } from './types'
import { createWorld, IDLE_INPUT, stepWorld } from './world'
import { STARTING_LOADOUT } from './player'

export const FRAME = 1 / 60

const TEST_THEME = { floor: '#000000', ceiling: '#000000', fog: '#000000' }

/** A world built from a small hand-written map, with a seeded random generator. */
export function worldFrom(
  map: readonly string[],
  options: { loadout?: Partial<Loadout>; random?: Random } = {},
): World {
  const level = parseLevel({ name: 'test', theme: TEST_THEME, map })
  return createWorld(level, { ...STARTING_LOADOUT, ...options.loadout }, options.random ?? createRandom(1))
}

export function input(overrides: Partial<PlayerInput> = {}): PlayerInput {
  return { ...IDLE_INPUT, ...overrides }
}

/** Steps the world at 60 frames per second for `seconds`, and returns every event. */
export function run(world: World, seconds: number, given: PlayerInput = IDLE_INPUT): WorldEvent[] {
  const events: WorldEvent[] = []
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += FRAME) events.push(...stepWorld(world, given, FRAME))
  return events
}

/** A generator that always returns the same value: 0 makes every roll succeed, 0.999 fail. */
export function constantRandom(value: number): Random {
  return () => value
}

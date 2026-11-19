import { describe, expect, it, vi } from 'vitest'
import type { PlayerInput } from '../engine'
import { constantRandom, input, worldFrom } from '../engine/testUtils'
import { createGameSession } from './session'

function sessionOn(map: string[], options: Parameters<typeof worldFrom>[1] = {}) {
  let next: PlayerInput = input()
  const audio = { play: vi.fn() }
  const session = createGameSession(worldFrom(map, options), {
    levelNumber: 2,
    input: { sample: () => next },
    audio,
  })
  session.paused.value = false
  return { session, audio, give: (given: Partial<PlayerInput>) => (next = input(given)) }
}

describe('createGameSession', () => {
  it('starts paused, and does not step the world while paused', () => {
    const { session, give } = sessionOn(['######', '#>...#', '######'])
    session.paused.value = true
    give({ forward: 1 })
    session.tick(0.1)
    expect(session.world.time).toBe(0)
  })

  it('steps the world, plays its sounds and refreshes the status bar', () => {
    const { session, audio, give } = sessionOn(['######', '#>...#', '######'])
    give({ fire: true })
    session.tick(1 / 60)
    expect(session.hud.value.ammo).toBe(7)
    expect(session.hud.value.levelNumber).toBe(2)
    expect(session.weapon.value.firing).toBe(true)
    expect(audio.play).toHaveBeenCalledWith('pistol', 1)
  })

  it('keeps the same status bar while nothing changes', () => {
    const { session } = sessionOn(['######', '#>...#', '######'])
    const before = session.hud.value
    session.tick(1 / 60)
    expect(session.hud.value).toBe(before)
  })

  it('counts pickups for the screen flash and shows what was picked up', () => {
    const { session, give } = sessionOn(['######', '#>+..#', '######'], { loadout: { health: 50 } })
    give({ forward: 1 })
    for (let frame = 0; frame < 30; frame++) session.tick(1 / 60)
    expect(session.pickupCount.value).toBe(1)
    expect(session.message.value?.text).toBe('Kit de soin +25')
  })

  it('counts hits taken for the screen flash', () => {
    const { session } = sessionOn(['#######', '#>...d#', '#######'], { random: constantRandom(0) })
    for (let frame = 0; frame < 72; frame++) session.tick(1 / 60)
    expect(session.hurtCount.value).toBe(1)
  })

  it('publishes the pickups dropped by fallen enemies', () => {
    const { session, give } = sessionOn(['#######', '#>...d#', '#######'], { random: constantRandom(0) })
    const enemy = session.world.enemies[0]
    if (enemy) enemy.health = 1
    give({ fire: true })
    session.tick(1 / 60)
    expect(session.pickups.value.map((pickup) => pickup.kind)).toEqual(['ammo'])
  })

  it('reports the end of the level', () => {
    const { session, give } = sessionOn(['####', '#>X#', '####'])
    give({ use: true })
    session.tick(1 / 60)
    expect(session.status.value).toBe('complete')
  })
})

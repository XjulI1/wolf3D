import { describe, expect, it } from 'vitest'
import { damagePlayer, findTarget } from './combat'
import { worldFrom } from './testUtils'
import type { WorldEvent } from './types'

describe('findTarget', () => {
  it('picks the nearest enemy on the line of fire', () => {
    const world = worldFrom(['##########', '#>..d..d.#', '##########'])
    expect(findTarget(world)?.id).toBe(1)
  })

  it('skips fallen enemies', () => {
    const world = worldFrom(['##########', '#>..d..d.#', '##########'])
    const first = world.enemies[0]
    if (first) first.state = 'dead'
    expect(findTarget(world)?.id).toBe(2)
  })

  it('misses enemies away from the line of fire', () => {
    const world = worldFrom(['##########', '#>..d....#', '##########'])
    world.player.angle = 0.3
    expect(findTarget(world)).toBeNull()
  })

  it('cannot reach an enemy behind a closed door, but can once it is open', () => {
    const world = worldFrom(['########', '#>.D.d.#', '########'])
    expect(findTarget(world)).toBeNull()
    const door = world.doors[0]
    if (door) door.phase = 'open'
    expect(findTarget(world)?.id).toBe(1)
  })
})

describe('damagePlayer', () => {
  it('ends the level when health drops to zero', () => {
    const world = worldFrom(['####', '#>.#', '####'], { loadout: { health: 5 } })
    const events: WorldEvent[] = []
    damagePlayer(world, 10, (event) => events.push(event))
    expect(world.player.health).toBe(0)
    expect(world.status).toBe('dead')
    expect(events).toEqual([{ type: 'playerHurt', damage: 10 }, { type: 'playerDied' }])
  })
})

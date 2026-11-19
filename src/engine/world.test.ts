import { describe, expect, it } from 'vitest'
import { DOOR_HOLD_TIME } from './doors'
import { WALK_SPEED } from './player'
import { input, run, worldFrom } from './testUtils'
import { MAX_STEP, reportOf, stepWorld } from './world'

describe('createWorld', () => {
  it('sets the player, the enemies and the pickups of the level, with distinct ids', () => {
    const world = worldFrom(['#######', '#>d$S+#', '#######'], { loadout: { score: 1200 } })
    expect(world.player.position).toEqual({ x: 1.5, y: 1.5 })
    expect(world.player.score).toBe(1200)
    expect(world.enemies.map((enemy) => [enemy.id, enemy.kind])).toEqual([
      [1, 'drone'],
      [2, 'sentinel'],
    ])
    expect(world.pickups.map((pickup) => [pickup.id, pickup.kind])).toEqual([
      [3, 'data'],
      [4, 'medkit'],
    ])
    expect(world.status).toBe('playing')
  })
})

describe('stepWorld', () => {
  it('stands still once the level is over', () => {
    const world = worldFrom(['######', '#>...#', '######'])
    world.status = 'complete'
    expect(stepWorld(world, input({ forward: 1 }), 0.1)).toEqual([])
    expect(world.time).toBe(0)
    expect(world.player.position.x).toBe(1.5)
  })

  it('simulates a long frame as a short step', () => {
    const world = worldFrom(['######', '#>...#', '######'])
    stepWorld(world, input({ forward: 1 }), 1)
    expect(world.time).toBe(MAX_STEP)
    expect(world.player.position.x).toBeCloseTo(1.5 + WALK_SPEED * MAX_STEP)
  })

  it('closes doors behind the player, never on the player', () => {
    const world = worldFrom(['######', '#>D..#', '######'])
    stepWorld(world, input({ use: true }), 1 / 60)
    run(world, 0.5)
    world.player.position = { x: 2.5, y: 1.5 }
    run(world, DOOR_HOLD_TIME + 1)
    expect(world.doors[0]?.phase).toBe('open')
    world.player.position = { x: 3.5, y: 1.5 }
    const events = run(world, DOOR_HOLD_TIME + 1)
    expect(world.doors[0]?.phase).toBe('closed')
    expect(events).toContainEqual({ type: 'doorMoved', door: 0 })
  })
})

describe('reportOf', () => {
  it('sums up kills, data chips and time', () => {
    const world = worldFrom(['########', '#>.$.$d#', '########'])
    world.kills = 1
    world.dataFound = 1
    world.time = 42
    expect(reportOf(world)).toEqual({ kills: 1, enemies: 1, data: 1, totalData: 2, time: 42 })
  })
})

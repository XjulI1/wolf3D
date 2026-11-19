import { describe, expect, it } from 'vitest'
import { damageEnemy } from './combat'
import { alertEnemy } from './enemies'
import { DYING_TIME, ENEMY_SPECS, PAIN_TIME, PERSONAL_SPACE } from './enemySpecs'
import { distanceBetween } from './grid'
import { constantRandom, input, run, worldFrom } from './testUtils'
import type { Enemy, World, WorldEvent } from './types'
import { stepWorld } from './world'

function firstEnemy(world: World): Enemy {
  const enemy = world.enemies[0]
  if (!enemy) throw new Error('missing enemy')
  return enemy
}

const ignore = () => {}

describe('enemy awareness', () => {
  it('notices a player in plain sight', () => {
    const world = worldFrom(['#######', '#>...d#', '#######'])
    const events = stepWorld(world, input(), 1 / 60)
    expect(firstEnemy(world).state).toBe('chase')
    expect(events).toContainEqual({ type: 'enemyAlerted', enemyId: 1 })
  })

  it('does not see through walls', () => {
    const world = worldFrom(['#########', '#>.#..d.#', '#########'])
    run(world, 1)
    expect(firstEnemy(world).state).toBe('idle')
  })

  it('hears gunshots through walls', () => {
    const world = worldFrom(['#########', '#>.#..d.#', '#########'])
    stepWorld(world, input({ fire: true }), 1 / 60)
    expect(firstEnemy(world).state).toBe('chase')
  })

  it('does not hear gunshots from far away', () => {
    const world = worldFrom(['##############', '#>.#........d#', '##############'])
    stepWorld(world, input({ fire: true }), 1 / 60)
    expect(firstEnemy(world).state).toBe('idle')
  })
})

describe('enemy pursuit', () => {
  it('walks around walls towards the player', () => {
    const world = worldFrom(['#######', '#>....#', '#####.#', '#d....#', '#######'])
    alertEnemy(world, firstEnemy(world), ignore)
    run(world, 2)
    expect(firstEnemy(world).position.x).toBeGreaterThan(4.5)
    expect(firstEnemy(world).position.y).toBeCloseTo(3.5)
  })

  it('opens the doors on its way', () => {
    const world = worldFrom(['#######', '#>.D.d#', '#######'])
    alertEnemy(world, firstEnemy(world), ignore)
    const events = run(world, 1)
    expect(world.doors[0]?.phase).not.toBe('closed')
    expect(events).toContainEqual({ type: 'doorMoved', door: 0 })
  })

  it('stops short of the player', () => {
    const world = worldFrom(['#########', '#>.....d#', '#########'], { random: constantRandom(0.999) })
    run(world, 5)
    expect(distanceBetween(firstEnemy(world).position, world.player.position)).toBeGreaterThan(PERSONAL_SPACE - 0.1)
  })
})

describe('enemy attacks', () => {
  it('aims, then shoots and hits often at close range', () => {
    const world = worldFrom(['#######', '#>...d#', '#######'], { random: constantRandom(0) })
    const states = new Set<string>()
    const events: WorldEvent[] = []
    for (let frame = 0; frame < 72; frame++) {
      events.push(...stepWorld(world, input(), 1 / 60))
      states.add(firstEnemy(world).state)
    }
    expect(states).toContain('aim')
    expect(events.filter((event) => event.type === 'enemyShot')).toHaveLength(1)
    expect(events).toContainEqual({ type: 'playerHurt', damage: ENEMY_SPECS.drone.damage[0] })
    expect(world.player.health).toBe(100 - ENEMY_SPECS.drone.damage[0])
  })

  it('can miss', () => {
    const world = worldFrom(['#######', '#>...d#', '#######'], { random: constantRandom(0.999) })
    const events = run(world, 2)
    expect(events.filter((event) => event.type === 'enemyShot')).toHaveLength(1)
    expect(world.player.health).toBe(100)
  })

  it('does not shoot through a closed door', () => {
    const world = worldFrom(['#######', '#>.D.d#', '#######'], { random: constantRandom(0) })
    const events = run(world, 3)
    expect(events.some((event) => event.type === 'enemyShot')).toBe(false)
  })
})

describe('enemy damage', () => {
  it('flinches when hurt, then resumes the chase', () => {
    const world = worldFrom(['#########', '#>.#..d.#', '#########'])
    const enemy = firstEnemy(world)
    damageEnemy(world, enemy, 10, ignore)
    expect(enemy.state).toBe('pain')
    expect(enemy.health).toBe(15)
    run(world, PAIN_TIME + 0.05)
    expect(enemy.state).toBe('chase')
  })

  it('drops ammo, scores and counts the kill when destroyed', () => {
    const world = worldFrom(['#########', '#>.#..d.#', '#########'])
    const enemy = firstEnemy(world)
    const events: WorldEvent[] = []
    damageEnemy(world, enemy, 100, (event) => events.push(event))
    const drop = world.pickups.at(-1)
    expect(enemy.state).toBe('dying')
    expect(world.kills).toBe(1)
    expect(world.player.score).toBe(ENEMY_SPECS.drone.score)
    expect(drop).toMatchObject({ kind: 'ammo', position: enemy.position, taken: false })
    expect(events).toEqual([
      { type: 'enemyKilled', enemyId: enemy.id },
      { type: 'pickupDropped', pickupId: drop?.id },
    ])
  })

  it('falls after a short while and never acts again', () => {
    const world = worldFrom(['#######', '#>...d#', '#######'], { random: constantRandom(0) })
    const enemy = firstEnemy(world)
    damageEnemy(world, enemy, 100, ignore)
    run(world, DYING_TIME + 0.05)
    expect(enemy.state).toBe('dead')
    const position = { ...enemy.position }
    const events = run(world, 3)
    expect(enemy.position).toEqual(position)
    expect(events.some((event) => event.type === 'enemyShot')).toBe(false)
  })
})

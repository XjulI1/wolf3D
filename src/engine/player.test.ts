import { describe, expect, it } from 'vitest'
import { ENEMY_RADIUS } from './enemySpecs'
import { distanceBetween } from './grid'
import { AMMO_CLIP, DATA_SCORE } from './pickups'
import { DRY_FIRE_DELAY, PLAYER_RADIUS, RUN_SPEED, TURN_SPEED, WALK_SPEED } from './player'
import { constantRandom, input, run, worldFrom } from './testUtils'
import { stepWorld } from './world'

const corridor = ['#########', '#>......#', '#########']
const room = ['#####', '#>..#', '#...#', '#...#', '#####']

describe('player movement', () => {
  it('walks forward along the facing direction', () => {
    const world = worldFrom(corridor)
    run(world, 0.5, input({ forward: 1 }))
    expect(world.player.position.x).toBeCloseTo(1.5 + WALK_SPEED * 0.5)
    expect(world.player.position.y).toBeCloseTo(1.5)
  })

  it('runs faster', () => {
    const world = worldFrom(corridor)
    run(world, 0.5, input({ forward: 1, run: true }))
    expect(world.player.position.x).toBeCloseTo(1.5 + RUN_SPEED * 0.5)
  })

  it('strafes to the right of the facing direction', () => {
    const world = worldFrom(room)
    run(world, 0.3, input({ strafe: 1 }))
    expect(world.player.position.x).toBeCloseTo(1.5)
    expect(world.player.position.y).toBeCloseTo(1.5 + WALK_SPEED * 0.3)
  })

  it('moves diagonally no faster than straight ahead', () => {
    const world = worldFrom(room)
    run(world, 0.2, input({ forward: 1, strafe: 1 }))
    const travelled = distanceBetween({ x: 1.5, y: 1.5 }, world.player.position)
    expect(travelled).toBeCloseTo(WALK_SPEED * 0.2)
  })

  it('turns with the keyboard and the mouse', () => {
    const world = worldFrom(corridor)
    run(world, 0.5, input({ turn: 1 }))
    expect(world.player.angle).toBeCloseTo(TURN_SPEED * 0.5)
    stepWorld(world, input({ look: -0.3 }), 1 / 60)
    expect(world.player.angle).toBeCloseTo(TURN_SPEED * 0.5 - 0.3)
  })

  it('cannot walk through walls', () => {
    const world = worldFrom(corridor)
    run(world, 5, input({ forward: 1 }))
    expect(world.player.position.x).toBeLessThan(8 - PLAYER_RADIUS)
  })

  it('cannot walk through a living enemy, but over a fallen one', () => {
    const world = worldFrom(['##########', '#>....d..#', '##########'], { random: constantRandom(0.999) })
    run(world, 3, input({ forward: 1 }))
    const enemy = world.enemies[0]
    if (!enemy) throw new Error('missing enemy')
    expect(distanceBetween(enemy.position, world.player.position)).toBeGreaterThanOrEqual(PLAYER_RADIUS + ENEMY_RADIUS - 1e-6)
    enemy.state = 'dead'
    run(world, 2, input({ forward: 1 }))
    expect(world.player.position.x).toBeGreaterThan(enemy.position.x)
  })
})

describe('player pickups', () => {
  it('collects what lies on the way', () => {
    const world = worldFrom(['#######', '#>.a..#', '#######'])
    const events = run(world, 1, input({ forward: 1 }))
    expect(world.player.ammo).toBe(8 + AMMO_CLIP)
    expect(world.pickups[0]?.taken).toBe(true)
    expect(events).toContainEqual({ type: 'pickupCollected', kind: 'ammo' })
  })

  it('walks over a medkit without taking it at full health', () => {
    const world = worldFrom(['#######', '#>.+..#', '#######'])
    run(world, 1, input({ forward: 1 }))
    expect(world.pickups[0]?.taken).toBe(false)
  })

  it('counts and scores data chips', () => {
    const world = worldFrom(['#######', '#>.$..#', '#######'])
    run(world, 1, input({ forward: 1 }))
    expect(world.dataFound).toBe(1)
    expect(world.player.score).toBe(DATA_SCORE)
  })
})

describe('player actions', () => {
  it('opens the door in front, then walks through it', () => {
    const world = worldFrom(['######', '#>D..#', '######'])
    expect(stepWorld(world, input({ use: true }), 1 / 60)).toContainEqual({ type: 'doorMoved', door: 0 })
    run(world, 0.5)
    run(world, 1, input({ forward: 1 }))
    expect(world.player.position.x).toBeGreaterThan(3)
  })

  it('cannot open a locked door without the keycard', () => {
    const world = worldFrom(['#####', '#>L.#', '#####'])
    expect(stepWorld(world, input({ use: true }), 1 / 60)).toEqual([{ type: 'doorLocked' }])
    expect(world.doors[0]?.phase).toBe('closed')
  })

  it('unlocks a locked door for good with the keycard', () => {
    const world = worldFrom(['#####', '#>L.#', '#####'])
    world.player.hasKeycard = true
    stepWorld(world, input({ use: true }), 1 / 60)
    expect(world.doors[0]?.locked).toBe(false)
    expect(world.doors[0]?.phase).toBe('opening')
  })

  it('completes the level at the exit terminal', () => {
    const world = worldFrom(['####', '#>X#', '####'])
    expect(stepWorld(world, input({ use: true }), 1 / 60)).toEqual([{ type: 'levelComplete' }])
    expect(world.status).toBe('complete')
  })

  it('reaches only what is right in front', () => {
    const world = worldFrom(['#######', '#>...X#', '#######'])
    expect(stepWorld(world, input({ use: true }), 1 / 60)).toEqual([])
    expect(world.status).toBe('playing')
  })
})

describe('player weapons', () => {
  it('spends a bullet per shot and waits for the weapon to be ready', () => {
    const world = worldFrom(corridor)
    const shots = run(world, 1, input({ fire: true })).filter((event) => event.type === 'playerShot')
    expect(shots).toHaveLength(3)
    expect(world.player.ammo).toBe(5)
  })

  it('fires much faster with the rifle', () => {
    const world = worldFrom(corridor, { loadout: { weapons: ['pistol', 'rifle'], weapon: 'rifle', ammo: 50 } })
    const shots = run(world, 1, input({ fire: true })).filter((event) => event.type === 'playerShot')
    expect(shots.length).toBeGreaterThan(6)
  })

  it('clicks when out of ammo', () => {
    const world = worldFrom(corridor, { loadout: { ammo: 0 } })
    const events = run(world, 0.5, input({ fire: true }))
    expect(events.filter((event) => event.type === 'dryFire')).toHaveLength(Math.ceil(0.5 / DRY_FIRE_DELAY))
    expect(events.some((event) => event.type === 'playerShot')).toBe(false)
  })

  it('switches only to a weapon it owns', () => {
    const unarmed = worldFrom(corridor)
    stepWorld(unarmed, input({ weapon: 'rifle' }), 1 / 60)
    expect(unarmed.player.weapon).toBe('pistol')
    const armed = worldFrom(corridor, { loadout: { weapons: ['pistol', 'rifle'] } })
    stepWorld(armed, input({ weapon: 'rifle' }), 1 / 60)
    expect(armed.player.weapon).toBe('rifle')
  })

  it('hurts the enemy on the line of fire', () => {
    const world = worldFrom(['#########', '#>.....d#', '#########'], { random: constantRandom(0) })
    const events = stepWorld(world, input({ fire: true }), 1 / 60)
    expect(world.enemies[0]?.health).toBe(25 - 8)
    expect(world.enemies[0]?.state).toBe('pain')
    expect(events).toContainEqual({ type: 'enemyHurt', enemyId: 1 })
  })

  it('cannot shoot through walls', () => {
    const world = worldFrom(['#########', '#>.#..d.#', '#########'], { random: constantRandom(0) })
    stepWorld(world, input({ fire: true }), 1 / 60)
    expect(world.enemies[0]?.health).toBe(25)
  })
})

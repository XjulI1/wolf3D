/** A point or a direction on the map plane: `x` grows eastwards, `y` grows southwards, one unit per cell. */
export type Vec2 = { x: number; y: number }

export type WallKind = 'steel' | 'concrete' | 'server' | 'exit'

export type Cell = { type: 'empty' } | { type: 'wall'; wall: WallKind } | { type: 'door'; door: number }

/** Axis the door slab spans: `x` for a door set in a wall running east-west. */
export type DoorAxis = 'x' | 'y'

export type EnemyKind = 'drone' | 'sentinel'

export type PickupKind = 'medkit' | 'ammo' | 'rifle' | 'keycard' | 'data'

export type WeaponId = 'pistol' | 'rifle'

export type LevelTheme = { floor: string; ceiling: string; fog: string }

/** Where the player appears; `angle` is in radians, 0 facing east, π/2 facing south. */
export type PlayerStart = { position: Vec2; angle: number }

export type DoorSpec = { cell: Vec2; axis: DoorAxis; locked: boolean }

export type EnemySpawn = { kind: EnemyKind; position: Vec2 }

export type PickupSpawn = { kind: PickupKind; position: Vec2 }

/** A parsed, immutable level layout. */
export type Level = {
  name: string
  width: number
  height: number
  cells: readonly Cell[]
  start: PlayerStart
  doors: readonly DoorSpec[]
  enemies: readonly EnemySpawn[]
  pickups: readonly PickupSpawn[]
  theme: LevelTheme
}

export type DoorPhase = 'closed' | 'opening' | 'open' | 'closing'

export type Door = DoorSpec & { openness: number; phase: DoorPhase; timer: number }

export type EnemyState = 'idle' | 'chase' | 'aim' | 'pain' | 'dying' | 'dead'

export type Enemy = {
  id: number
  kind: EnemyKind
  position: Vec2
  health: number
  state: EnemyState
  timer: number
  cooldown: number
  waypoint: Vec2 | null
  repath: number
  stride: number
  firedAt: number
}

export type Pickup = { id: number; kind: PickupKind; position: Vec2; taken: boolean }

export type Player = {
  position: Vec2
  angle: number
  health: number
  ammo: number
  weapons: WeaponId[]
  weapon: WeaponId
  cooldown: number
  hasKeycard: boolean
  score: number
  stride: number
  firedAt: number
}

/** What the player carries from one level to the next. */
export type Loadout = {
  health: number
  ammo: number
  weapons: readonly WeaponId[]
  weapon: WeaponId
  score: number
}

export type WorldStatus = 'playing' | 'dead' | 'complete'

/** Returns a number in [0, 1). */
export type Random = () => number

/** The mutable state of a level being played, advanced by `stepWorld`. */
export type World = {
  level: Level
  player: Player
  doors: Door[]
  enemies: Enemy[]
  pickups: Pickup[]
  time: number
  status: WorldStatus
  kills: number
  dataFound: number
  random: Random
  nextId: number
}

/**
 * Player intent for one step: `forward` and `strafe` in [-1, 1] (strafe positive to the right),
 * `turn` in [-1, 1] for keyboard turning, `look` an extra turn in radians (mouse).
 */
export type PlayerInput = {
  forward: number
  strafe: number
  turn: number
  look: number
  run: boolean
  fire: boolean
  use: boolean
  weapon: WeaponId | null
}

export type WorldEvent =
  | { type: 'playerShot'; weapon: WeaponId }
  | { type: 'dryFire' }
  | { type: 'enemyAlerted'; enemyId: number }
  | { type: 'enemyHurt'; enemyId: number }
  | { type: 'enemyKilled'; enemyId: number }
  | { type: 'enemyShot'; enemyId: number }
  | { type: 'playerHurt'; damage: number }
  | { type: 'playerDied' }
  | { type: 'pickupCollected'; kind: PickupKind }
  | { type: 'pickupDropped'; pickupId: number }
  | { type: 'doorMoved'; door: number }
  | { type: 'doorLocked' }
  | { type: 'levelComplete' }

export type Emit = (event: WorldEvent) => void

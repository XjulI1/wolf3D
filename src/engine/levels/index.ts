import { parseLevel, type LevelSource } from '../level'
import type { Level } from '../types'
import { core } from './core'
import { loadingDock } from './loadingDock'
import { serverHall } from './serverHall'

export const LEVEL_SOURCES: readonly LevelSource[] = [loadingDock, serverHall, core]

/** The campaign, in playing order. */
export const LEVELS: readonly Level[] = LEVEL_SOURCES.map(parseLevel)

import type { WeaponId } from '../engine'

export const WEAPON_LABELS: Record<WeaponId, string> = {
  pistol: 'Pistolet',
  rifle: 'Fusil',
}

export const CONTROLS: readonly { keys: string; action: string }[] = [
  { keys: 'Z Q S D / W A S D', action: 'Se déplacer' },
  { keys: 'Souris / ← →', action: 'Tourner' },
  { keys: 'Clic gauche / Ctrl', action: 'Tirer' },
  { keys: 'E / Espace', action: 'Ouvrir, activer' },
  { keys: 'Maj', action: 'Courir' },
  { keys: '1 / 2', action: 'Changer d’arme' },
  { keys: 'Échap', action: 'Pause' },
]

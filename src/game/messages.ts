import { AMMO_CLIP, DATA_SCORE, MEDKIT_HEALTH, type PickupKind, type WorldEvent } from '../engine'

const PICKUP_MESSAGES: Record<PickupKind, string> = {
  medkit: `Kit de soin +${MEDKIT_HEALTH}`,
  ammo: `Munitions +${AMMO_CLIP}`,
  rifle: 'Fusil d’assaut récupéré',
  keycard: 'Carte d’accès récupérée',
  data: `Puce de données +${DATA_SCORE}`,
}

/** The line flashed on screen after an event, if any. */
export function messageFor(event: WorldEvent): string | null {
  if (event.type === 'pickupCollected') return PICKUP_MESSAGES[event.kind]
  if (event.type === 'doorLocked') return 'Accès refusé : carte d’accès requise'
  return null
}

<script setup lang="ts">
import { computed } from 'vue'
import { WEAPON_ORDER } from '../../engine'
import type { HudState } from '../../game/hud'
import { formatScore } from '../format'
import { WEAPON_LABELS } from '../labels'

const props = defineProps<{ hud: HudState }>()

const CRITICAL_HEALTH = 25
const LOW_HEALTH = 50

const healthTone = computed(() => {
  if (props.hud.health <= CRITICAL_HEALTH) return 'text-danger'
  if (props.hud.health <= LOW_HEALTH) return 'text-warning'
  return 'text-neon'
})
</script>

<template>
  <footer
    class="grid grid-cols-6 gap-px border-t-2 border-line bg-line font-mono"
    data-test="status-bar"
  >
    <div class="cell">
      <span class="label">
        Niveau
      </span>
      <span class="value">
        {{ props.hud.levelNumber }}
      </span>
    </div>
    <div class="cell">
      <span class="label">
        Score
      </span>
      <span
        class="value"
        data-test="score"
      >
        {{ formatScore(props.hud.score) }}
      </span>
    </div>
    <div class="cell">
      <span class="label">
        Santé
      </span>
      <span
        class="value"
        :class="healthTone"
        data-test="health"
      >
        {{ props.hud.health }}&#8239;%
      </span>
    </div>
    <div class="cell">
      <span class="label">
        Munitions
      </span>
      <span
        class="value"
        :class="{ 'text-danger': props.hud.ammo === 0 }"
        data-test="ammo"
      >
        {{ props.hud.ammo }}
      </span>
    </div>
    <div class="cell">
      <span class="label">
        Arme
      </span>
      <span
        class="value text-base sm:text-lg"
        data-test="weapon"
      >
        {{ WEAPON_LABELS[props.hud.weapon] }}
      </span>
      <span class="flex gap-1 text-[0.65rem]">
        <span
          v-for="(weapon, index) in WEAPON_ORDER"
          :key="weapon"
          class="slot"
          :class="{
            'is-owned': props.hud.weapons.includes(weapon),
            'is-current': props.hud.weapon === weapon,
          }"
        >
          {{ index + 1 }}
        </span>
      </span>
    </div>
    <div class="cell">
      <span class="label">
        Carte
      </span>
      <span
        class="keycard"
        :class="{ 'is-owned': props.hud.hasKeycard }"
        role="img"
        :aria-label="props.hud.hasKeycard ? 'Carte d’accès en main' : 'Pas de carte d’accès'"
        data-test="keycard"
      />
    </div>
  </footer>
</template>

<style scoped>
.cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.5rem 0.25rem;
  background: var(--color-panel);
}

.label {
  color: var(--color-muted);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.value {
  font-size: clamp(1.1rem, 2.6vw, 1.75rem);
  font-weight: 800;
  line-height: 1;
}

.slot {
  min-width: 1.1rem;
  border: 1px solid var(--color-line);
  border-radius: 0.2rem;
  color: var(--color-line);
  text-align: center;
}

.slot.is-owned {
  border-color: var(--color-muted);
  color: var(--color-muted);
}

.slot.is-current {
  border-color: var(--color-neon);
  color: var(--color-neon);
}

.keycard {
  width: 2rem;
  height: 1.3rem;
  border: 2px dashed var(--color-line);
  border-radius: 0.2rem;
}

.keycard.is-owned {
  border: 0;
  background: linear-gradient(90deg, #2563eb 0 70%, #1d4ed8 70%);
  box-shadow: 0 0 10px #2563eb88;
}
</style>

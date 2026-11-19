<script setup lang="ts">
import type { LevelReport } from '../../engine'
import { formatRatio, formatScore, formatTime } from '../format'

defineProps<{ report: LevelReport; levelName: string; score: number; victory: boolean }>()

const emit = defineEmits<{
  next: []
  quit: []
}>()
</script>

<template>
  <div class="overlay">
    <section
      class="panel-card flex w-full max-w-md flex-col items-center gap-6 p-8 text-center shadow-neon"
      data-test="summary"
    >
      <p class="font-mono text-xs tracking-[0.4em] text-muted uppercase">
        {{ victory ? 'Mission accomplie' : 'Niveau terminé' }}
      </p>
      <h2 class="neon-title text-3xl font-black uppercase">
        {{ levelName }}
      </h2>
      <dl class="grid w-full grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-left font-mono">
        <dt class="text-muted">
          Sécurité neutralisée
        </dt>
        <dd data-test="kills">
          {{ formatRatio(report.kills, report.enemies) }}
        </dd>
        <dt class="text-muted">
          Données volées
        </dt>
        <dd data-test="data">
          {{ formatRatio(report.data, report.totalData) }}
        </dd>
        <dt class="text-muted">
          Temps
        </dt>
        <dd data-test="time">
          {{ formatTime(report.time) }}
        </dd>
        <dt class="text-muted">
          Score
        </dt>
        <dd
          class="text-neon"
          data-test="score"
        >
          {{ formatScore(score) }}
        </dd>
      </dl>
      <p
        v-if="victory"
        class="text-muted"
      >
        Le noyau est compromis : toutes les données sont à vous.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          class="btn btn-primary"
          data-test="next"
          @click="emit('next')"
        >
          {{ victory ? 'Rejouer' : 'Niveau suivant' }}
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          data-test="quit"
          @click="emit('quit')"
        >
          Menu
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ControlsList from '../ControlsList.vue'

defineProps<{ levelNumber: number; levelName: string; paused: boolean; hasLockedDoors: boolean }>()

const emit = defineEmits<{
  play: []
  quit: []
}>()
</script>

<template>
  <div class="overlay">
    <section
      class="panel-card flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center shadow-neon"
      data-test="briefing"
    >
      <p class="font-mono text-xs tracking-[0.4em] text-muted uppercase">
        {{ paused ? 'Pause' : `Niveau ${levelNumber}` }}
      </p>
      <h2 class="neon-title text-3xl font-black uppercase">
        {{ levelName }}
      </h2>
      <p
        v-if="!paused"
        class="text-muted"
      >
        Volez les puces de données, neutralisez la sécurité et activez le terminal de sortie.
        <template v-if="hasLockedDoors">
          Une carte d’accès ouvre les portes verrouillées.
        </template>
      </p>
      <ControlsList />
      <div class="flex gap-3">
        <button
          type="button"
          class="btn btn-primary"
          data-test="play"
          @click="emit('play')"
        >
          {{ paused ? 'Reprendre' : 'Commencer' }}
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
      <p class="text-xs text-muted">
        La souris est capturée pendant la partie : Échap la libère.
      </p>
    </section>
  </div>
</template>

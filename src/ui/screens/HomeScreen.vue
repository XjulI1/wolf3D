<script setup lang="ts">
import ControlsList from '../ControlsList.vue'

defineProps<{
  /** A new version of the app is ready to be activated. */
  updateReady?: boolean
}>()

const emit = defineEmits<{
  play: []
  reload: []
}>()
</script>

<template>
  <div class="relative flex h-full flex-col items-center justify-center gap-10 overflow-hidden p-6">
    <div
      class="corridor pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
    <div
      v-if="updateReady"
      class="panel-card absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 py-2 pr-2 pl-5 shadow-neon"
      role="status"
      data-test="update-banner"
    >
      <span class="text-sm font-semibold">
        Nouvelle version disponible
      </span>
      <button
        type="button"
        class="btn btn-primary"
        data-test="reload"
        @click="emit('reload')"
      >
        Recharger
      </button>
    </div>
    <div class="relative flex flex-col items-center gap-3 text-center">
      <p class="font-mono text-sm tracking-[0.3em] text-muted">
        &gt; ssh intrus@datacenter --port 404
      </p>
      <h1 class="neon-title text-6xl font-black sm:text-7xl">
        ROOTKIT 3D
      </h1>
      <p class="max-w-md text-muted">
        Infiltrez le centre de données, neutralisez les drones de sécurité et volez leurs données jusqu’au noyau.
      </p>
    </div>
    <button
      type="button"
      class="btn btn-primary relative px-10 text-lg"
      data-test="play"
      @click="emit('play')"
    >
      Lancer l’intrusion
    </button>
    <section
      class="panel-card relative p-5"
      aria-label="Commandes"
    >
      <ControlsList />
    </section>
  </div>
</template>

<style scoped>
.corridor {
  background:
    linear-gradient(transparent 49.5%, #39ff8822 50%, transparent 50.5%),
    repeating-linear-gradient(90deg, #39ff880d 0 1px, transparent 1px 64px),
    radial-gradient(circle at center, #39ff8812, transparent 60%);
  mask-image: radial-gradient(circle at center, black 25%, transparent 80%);
}
</style>

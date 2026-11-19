<script setup lang="ts">
const emit = defineEmits<{
  retry: []
  quit: []
}>()
</script>

<template>
  <div class="overlay bg-danger/20">
    <section
      class="panel-card flex w-full max-w-md flex-col items-center gap-5 p-8 text-center"
      data-test="death"
    >
      <h2 class="font-mono text-3xl font-black tracking-widest text-danger uppercase">
        Connexion perdue
      </h2>
      <p class="text-muted">
        La sécurité vous a neutralisé. Le niveau reprend avec l’équipement que vous aviez en y entrant.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          class="btn btn-primary"
          data-test="retry"
          @click="emit('retry')"
        >
          Réessayer
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

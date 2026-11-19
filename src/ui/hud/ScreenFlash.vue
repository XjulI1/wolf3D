<script setup lang="ts">
defineProps<{ hurtCount: number; pickupCount: number; critical: boolean }>()
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0"
    aria-hidden="true"
  >
    <div
      v-if="critical"
      class="vignette"
    />
    <div
      v-if="hurtCount > 0"
      :key="`hurt-${hurtCount}`"
      class="flash hurt"
    />
    <div
      v-if="pickupCount > 0"
      :key="`pickup-${pickupCount}`"
      class="flash pickup"
    />
  </div>
</template>

<style scoped>
.flash {
  position: absolute;
  inset: 0;
  opacity: 0;
  animation: flash 320ms ease-out;
}

.hurt {
  background: #ff1e1e;
}

.pickup {
  background: #ffd23f;
  animation-duration: 220ms;
}

.vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 18vmin #ff1e1e99;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes flash {
  from {
    opacity: 0.4;
  }

  to {
    opacity: 0;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
</style>

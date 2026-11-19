<script setup lang="ts">
import type { GameMessage } from '../../game/session'

defineProps<{ message: GameMessage | null }>()
</script>

<template>
  <p
    v-if="message"
    :key="message.id"
    class="toast"
    role="status"
  >
    {{ message.text }}
  </p>
</template>

<style scoped>
.toast {
  position: absolute;
  top: 1.25rem;
  left: 50%;
  padding: 0.4rem 0.9rem;
  border: 1px solid #39ff8866;
  border-radius: 0.4rem;
  background: #05080acc;
  color: var(--color-neon);
  font: 700 0.9rem/1.2 var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  animation: toast 2.4s ease-out forwards;
}

@keyframes toast {
  0% {
    opacity: 0;
    transform: translate(-50%, -6px);
  }

  10%,
  75% {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, 0);
  }
}
</style>

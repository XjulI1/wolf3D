<script setup lang="ts">
import { CONTROLS } from './labels'
</script>

<template>
  <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-left text-sm">
    <template
      v-for="control in CONTROLS"
      :key="control.action"
    >
      <dt class="font-mono text-neon">
        {{ control.keys }}
      </dt>
      <dd class="text-muted">
        {{ control.action }}
      </dd>
    </template>
  </dl>
</template>

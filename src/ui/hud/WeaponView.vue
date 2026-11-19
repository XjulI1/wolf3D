<script setup lang="ts">
import { computed } from 'vue'
import type { WeaponPose } from '../../game/weaponPose'
import { WEAPON_IMAGE_HEIGHT, WEAPON_IMAGE_WIDTH } from '../../scene/art/weapons'
import { weaponImages } from './weaponImages'

const props = defineProps<{ pose: WeaponPose }>()

const images = weaponImages()

const source = computed(() => {
  const views = images[props.pose.weapon]
  return props.pose.firing ? views.firing : views.idle
})

const placement = computed(() => {
  const x = (props.pose.offsetX / WEAPON_IMAGE_WIDTH) * 100
  const y = (props.pose.offsetY / WEAPON_IMAGE_HEIGHT) * 100
  return { transform: `translate(calc(-50% + ${x}%), ${y}%)` }
})
</script>

<template>
  <img
    v-if="source"
    class="weapon-view"
    :src="source"
    :style="placement"
    alt=""
    draggable="false"
  >
</template>

<style scoped>
.weapon-view {
  position: absolute;
  bottom: 0;
  left: 50%;
  height: min(46%, 24rem);
  aspect-ratio: 64 / 48;
  image-rendering: pixelated;
  pointer-events: none;
  user-select: none;
}
</style>

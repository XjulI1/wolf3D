<script setup lang="ts">
import { useLoop, useTres } from '@tresjs/core'
import { Fog } from 'three'
import { onBeforeUnmount } from 'vue'
import type { GameSession } from '../game/session'
import { cameraYaw, eyeHeight, FOG_FAR, FOG_NEAR } from './cameraPose'

const props = defineProps<{ session: GameSession }>()

const { camera, scene } = useTres()
const { onBeforeRender } = useLoop()

scene.value.fog = new Fog(props.session.world.level.theme.fog, FOG_NEAR, FOG_FAR)

onBeforeRender(({ delta }) => {
  props.session.tick(delta)
  const active = camera.value
  if (!active) return
  const { player } = props.session.world
  active.position.set(player.position.x, eyeHeight(player.stride), player.position.y)
  active.rotation.set(0, cameraYaw(player.angle), 0)
})

onBeforeUnmount(() => {
  scene.value.fog = null
})
</script>

<template>
  <TresGroup />
</template>

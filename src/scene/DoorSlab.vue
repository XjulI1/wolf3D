<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { BoxGeometry, Mesh, MeshBasicMaterial, type Texture } from 'three'
import { onBeforeUnmount } from 'vue'
import type { Door } from '../engine'
import { DOOR_THICKNESS, doorPose } from './doorPose'

const props = defineProps<{ door: Door; textures: { standard: Texture; locked: Texture } }>()

const material = new MeshBasicMaterial({ toneMapped: false })
const slab = new Mesh(new BoxGeometry(1, 1, DOOR_THICKNESS), material)

function sync(): void {
  const pose = doorPose(props.door)
  slab.position.set(...pose.position)
  slab.rotation.y = pose.rotationY
  const map = props.door.locked ? props.textures.locked : props.textures.standard
  if (material.map !== map) {
    material.map = map
    material.needsUpdate = true
  }
}

sync()
useLoop().onBeforeRender(sync)

onBeforeUnmount(() => {
  slab.geometry.dispose()
  material.dispose()
})
</script>

<template>
  <primitive :object="slab" />
</template>

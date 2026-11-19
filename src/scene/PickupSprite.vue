<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { Sprite, SpriteMaterial, type Texture } from 'three'
import { onBeforeUnmount } from 'vue'
import type { Pickup } from '../engine'

const props = defineProps<{ pickup: Pickup; texture: Texture }>()

const SPRITE_CENTER = 0.5

const material = new SpriteMaterial({ map: props.texture, alphaTest: 0.5, transparent: false, toneMapped: false })
const sprite = new Sprite(material)
sprite.position.set(props.pickup.position.x, SPRITE_CENTER, props.pickup.position.y)

useLoop().onBeforeRender(() => {
  sprite.visible = !props.pickup.taken
})

onBeforeUnmount(() => material.dispose())
</script>

<template>
  <primitive :object="sprite" />
</template>

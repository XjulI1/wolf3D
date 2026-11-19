<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { Sprite, SpriteMaterial } from 'three'
import { onBeforeUnmount } from 'vue'
import type { Enemy, World } from '../engine'
import { enemyFrame } from './spriteFrames'
import type { FrameTextures } from './textures'

const props = defineProps<{ enemy: Enemy; world: World; frames: FrameTextures }>()

const SPRITE_CENTER = 0.5

const material = new SpriteMaterial({ map: props.frames.stand, alphaTest: 0.5, transparent: false, toneMapped: false })
const sprite = new Sprite(material)

function sync(): void {
  sprite.position.set(props.enemy.position.x, SPRITE_CENTER, props.enemy.position.y)
  const map = props.frames[enemyFrame(props.enemy, props.world.time)]
  if (material.map !== map) material.map = map
}

sync()
useLoop().onBeforeRender(sync)

onBeforeUnmount(() => material.dispose())
</script>

<template>
  <primitive :object="sprite" />
</template>

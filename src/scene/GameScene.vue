<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { onBeforeUnmount } from 'vue'
import type { GameSession } from '../game/session'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, RENDER_SCALE } from './cameraPose'
import DoorSlab from './DoorSlab.vue'
import EnemySprite from './EnemySprite.vue'
import LevelGeometry from './LevelGeometry.vue'
import PickupSprite from './PickupSprite.vue'
import SceneDirector from './SceneDirector.vue'
import { createSceneTextures, disposeSceneTextures } from './textures'

const props = defineProps<{ session: GameSession }>()

const textures = createSceneTextures()
const { world } = props.session

onBeforeUnmount(() => disposeSceneTextures(textures))
</script>

<template>
  <div class="game-scene">
    <TresCanvas
      :dpr="RENDER_SCALE"
      :antialias="false"
      :clear-color="world.level.theme.fog"
    >
      <TresPerspectiveCamera
        :fov="CAMERA_FOV"
        :near="CAMERA_NEAR"
        :far="CAMERA_FAR"
      />
      <SceneDirector :session="props.session" />
      <LevelGeometry
        :level="world.level"
        :textures="textures"
      />
      <DoorSlab
        v-for="(door, index) in world.doors"
        :key="`door-${index}`"
        :door="door"
        :textures="textures.doors"
      />
      <EnemySprite
        v-for="enemy in world.enemies"
        :key="`enemy-${enemy.id}`"
        :enemy="enemy"
        :world="world"
        :frames="textures.enemies[enemy.kind]"
      />
      <PickupSprite
        v-for="pickup in props.session.pickups.value"
        :key="`pickup-${pickup.id}`"
        :pickup="pickup"
        :texture="textures.pickups[pickup.kind]"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
.game-scene {
  position: absolute;
  inset: 0;
}

.game-scene :deep(canvas) {
  image-rendering: pixelated;
}
</style>

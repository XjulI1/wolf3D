<script setup lang="ts">
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { onBeforeUnmount } from 'vue'
import type { Level } from '../engine'
import type { SceneTextures } from './textures'
import { buildWallGeometries, WALL_HEIGHT } from './wallGeometry'
import { wallFaces } from './wallFaces'

const props = defineProps<{ level: Level; textures: SceneTextures }>()

const group = new Group()

for (const [material, geometry] of buildWallGeometries(wallFaces(props.level))) {
  group.add(
    new Mesh(geometry, new MeshBasicMaterial({ map: props.textures.walls[material], vertexColors: true, toneMapped: false })),
  )
}

const { width, height, theme } = props.level
const floor = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ color: theme.floor, toneMapped: false }))
floor.rotation.x = -Math.PI / 2
floor.position.set(width / 2, 0, height / 2)
const ceiling = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ color: theme.ceiling, toneMapped: false }))
ceiling.rotation.x = Math.PI / 2
ceiling.position.set(width / 2, WALL_HEIGHT, height / 2)
group.add(floor, ceiling)

onBeforeUnmount(() => {
  group.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.geometry.dispose()
    if (object.material instanceof MeshBasicMaterial) object.material.dispose()
  })
})
</script>

<template>
  <primitive :object="group" />
</template>

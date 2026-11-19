<script setup lang="ts">
import { ref } from 'vue'
import { createUpdateState, type UpdateState } from './pwa/updateState'
import GameScreen from './ui/screens/GameScreen.vue'
import HomeScreen from './ui/screens/HomeScreen.vue'

const props = withDefaults(defineProps<{ updates?: UpdateState }>(), { updates: () => createUpdateState() })

const { updateReady, applyUpdate } = props.updates
const screen = ref<'home' | 'game'>('home')
const gamesStarted = ref(0)

function play() {
  gamesStarted.value += 1
  screen.value = 'game'
}
</script>

<template>
  <HomeScreen
    v-if="screen === 'home'"
    :update-ready="updateReady"
    @play="play"
    @reload="applyUpdate"
  />
  <GameScreen
    v-else
    :key="gamesStarted"
    @quit="screen = 'home'"
  />
</template>

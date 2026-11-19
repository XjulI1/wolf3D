<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch, watchEffect } from 'vue'
import { reportOf, type LevelReport } from '../../engine'
import { createGameAudio } from '../../game/audio'
import { isLastLevel, nextLevel, startCampaign, worldFor, type Campaign } from '../../game/campaign'
import { createInputController } from '../../game/input'
import { createGameSession, type GameSession } from '../../game/session'
import { usePointerLock } from '../../game/usePointerLock'
import GameScene from '../../scene/GameScene.vue'
import MessageToast from '../hud/MessageToast.vue'
import ScreenFlash from '../hud/ScreenFlash.vue'
import StatusBar from '../hud/StatusBar.vue'
import WeaponView from '../hud/WeaponView.vue'
import BriefingOverlay from '../overlays/BriefingOverlay.vue'
import DeathOverlay from '../overlays/DeathOverlay.vue'
import LevelSummary from '../overlays/LevelSummary.vue'

type Phase = 'briefing' | 'playing' | 'paused' | 'dead' | 'complete' | 'victory'

const emit = defineEmits<{
  quit: []
}>()

const CRITICAL_HEALTH = 25
const PAUSE_KEYS = new Set(['Escape', 'KeyP'])

const input = createInputController()
const audio = createGameAudio()
const viewElement = useTemplateRef<HTMLElement>('view')
const pointer = usePointerLock(viewElement)

const campaign = shallowRef<Campaign>(startCampaign())
const session = shallowRef<GameSession>(openSession())
const phase = ref<Phase>('briefing')
const report = shallowRef<LevelReport | null>(null)
const run = ref(0)

const level = computed(() => session.value.world.level)
const hasLockedDoors = computed(() => level.value.doors.some((door) => door.locked))
const critical = computed(() => phase.value === 'playing' && session.value.hud.value.health <= CRITICAL_HEALTH)

function openSession(): GameSession {
  return createGameSession(worldFor(campaign.value), { levelNumber: campaign.value.levelIndex + 1, input, audio })
}

function enterLevel(next: Campaign): void {
  campaign.value = next
  session.value = openSession()
  report.value = null
  run.value += 1
  phase.value = 'briefing'
}

async function play(): Promise<void> {
  audio.unlock()
  input.reset()
  const captured = await pointer.lock()
  if (captured || !pointer.supported) phase.value = 'playing'
}

function pause(): void {
  input.reset()
  phase.value = 'paused'
  pointer.unlock()
}

function retry(): void {
  enterLevel(campaign.value)
  void play()
}

function advance(): void {
  const next = phase.value === 'victory' ? startCampaign() : nextLevel(campaign.value, session.value.world)
  if (!next) return
  enterLevel(next)
  void play()
}

function quit(): void {
  pointer.unlock()
  emit('quit')
}

watchEffect(() => {
  session.value.paused.value = phase.value !== 'playing'
})

watch(pointer.locked, (locked) => {
  if (!locked && phase.value === 'playing') pause()
})

watch(
  () => session.value.status.value,
  (status) => {
    if (status === 'dead') phase.value = 'dead'
    if (status === 'complete') {
      report.value = reportOf(session.value.world)
      phase.value = isLastLevel(campaign.value) ? 'victory' : 'complete'
    }
    if (status !== 'playing') {
      input.reset()
      pointer.unlock()
    }
  },
)

function onKeyDown(event: KeyboardEvent): void {
  if (phase.value !== 'playing') return
  if (PAUSE_KEYS.has(event.code)) pause()
  else input.keyDown(event)
}

function onKeyUp(event: KeyboardEvent): void {
  input.keyUp(event)
}

function onMouseMove(event: MouseEvent): void {
  if (pointer.locked.value) input.mouseMove(event.movementX)
}

function onMouseDown(event: MouseEvent): void {
  if (phase.value === 'playing') input.mouseDown(event.button)
}

function onMouseUp(event: MouseEvent): void {
  input.mouseUp(event.button)
}

function onBlur(): void {
  if (phase.value === 'playing') pause()
  else input.reset()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('blur', onBlur)
  document.addEventListener('mousemove', onMouseMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('blur', onBlur)
  document.removeEventListener('mousemove', onMouseMove)
  audio.dispose()
})
</script>

<template>
  <div class="flex h-full flex-col bg-void select-none">
    <div
      ref="view"
      class="relative min-h-0 flex-1 overflow-hidden"
      :class="{ 'cursor-none': phase === 'playing' }"
      data-test="view"
      @mousedown="onMouseDown"
      @contextmenu.prevent
    >
      <GameScene
        :key="run"
        :session="session"
      />
      <ScreenFlash
        :hurt-count="session.hurtCount.value"
        :pickup-count="session.pickupCount.value"
        :critical="critical"
      />
      <WeaponView
        v-if="phase !== 'dead'"
        :pose="session.weapon.value"
      />
      <div
        v-if="phase === 'playing'"
        class="crosshair"
        aria-hidden="true"
      />
      <MessageToast :message="session.message.value" />
      <BriefingOverlay
        v-if="phase === 'briefing' || phase === 'paused'"
        :level-number="session.levelNumber"
        :level-name="level.name"
        :paused="phase === 'paused'"
        :has-locked-doors="hasLockedDoors"
        @play="play"
        @quit="quit"
      />
      <DeathOverlay
        v-else-if="phase === 'dead'"
        @retry="retry"
        @quit="quit"
      />
      <LevelSummary
        v-else-if="report"
        :report="report"
        :level-name="level.name"
        :score="session.hud.value.score"
        :victory="phase === 'victory'"
        @next="advance"
        @quit="quit"
      />
    </div>
    <StatusBar :hud="session.hud.value" />
  </div>
</template>

<style scoped>
.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  background:
    linear-gradient(var(--color-neon), var(--color-neon)) center / 2px 100% no-repeat,
    linear-gradient(var(--color-neon), var(--color-neon)) center / 100% 2px no-repeat;
  opacity: 0.75;
  pointer-events: none;
}
</style>

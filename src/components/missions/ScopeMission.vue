<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const scopeEl = ref<HTMLElement | null>(null)
const targetX = ref(0)
const targetY = ref(50)
let resolved = false

let animId: number | null = null
let startTime = 0
const SCOPE_SIZE = 100
const TARGET_SIZE = 8
const CENTER = 50
const HIT_RADIUS = 15

function animateTarget() {
  if (resolved) return
  const elapsed = Date.now() - startTime
  const t = elapsed / 1000
  targetX.value = 50 + 40 * Math.sin(t * 2.2)
  targetY.value = 50 + 25 * Math.cos(t * 1.7)
  animId = requestAnimationFrame(animateTarget)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true

  const dx = targetX.value - CENTER
  const dy = targetY.value - CENTER
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist <= HIT_RADIUS) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onMounted(() => {
  startTime = Date.now()
  targetX.value = 10
  animId = requestAnimationFrame(animateTarget)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="scope-mission">
    <div
      ref="scopeEl"
      class="scope-view"
      @pointerdown.stop="handleTap"
    >
      <div class="scope-ring" />

      <div class="crosshair-h" />
      <div class="crosshair-v" />

      <div
        class="target-blip"
        :style="{ left: `${targetX}%`, top: `${targetY}%` }"
      />

      <div class="scope-label">{{ t('조준경') }}</div>
    </div>

    <div class="scope-hint">{{ t('목표가 중앙에 올 때 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.scope-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.scope-view {
  position: relative;
  width: 180px;
  height: 180px;
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  background: #060e06;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  box-shadow:
    0 0 0 2px #111311,
    0 0 24px var(--px-green-glow);
}

.scope-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 60%;
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 0;
  transform: translate(-50%, -50%);
}

.crosshair-h {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--px-green-bright);
  opacity: 0.5;
  transform: translateY(-0.5px);
}

.crosshair-v {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--px-green-bright);
  opacity: 0.5;
  transform: translateX(-0.5px);
}

.target-blip {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
  border-radius: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.scope-label {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 9px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.scope-hint {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

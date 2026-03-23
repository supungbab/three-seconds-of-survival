<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentPoint = ref(0)
const holding = ref(false)
const holdProgress = ref(0)
const completed = ref([false, false, false])
const resolved = ref(false)

const HOLD_DURATION = 300
const TICK_INTERVAL = 16
let holdTimer: ReturnType<typeof setInterval> | null = null
let holdStart = 0

function clearHoldTimer() {
  if (holdTimer) {
    clearInterval(holdTimer)
    holdTimer = null
  }
}

function handlePointerDown(index: number, e: Event) {
  e.stopPropagation()
  if (resolved.value) return

  if (index !== currentPoint.value) {
    resolved.value = true
    emit('tap', false)
    return
  }

  holding.value = true
  holdStart = Date.now()
  holdProgress.value = 0

  holdTimer = setInterval(() => {
    const elapsed = Date.now() - holdStart
    holdProgress.value = Math.min(1, elapsed / HOLD_DURATION)

    if (elapsed >= HOLD_DURATION) {
      clearHoldTimer()
      holding.value = false
      holdProgress.value = 0

      const next = [...completed.value]
      next[index] = true
      completed.value = next
      playTick()

      if (currentPoint.value >= 2) {
        resolved.value = true
        emit('tap', true)
      } else {
        currentPoint.value++
      }
    }
  }, TICK_INTERVAL)
}

function handlePointerUp(index: number, e: Event) {
  e.stopPropagation()
  if (resolved.value) return

  if (holding.value && index === currentPoint.value) {
    clearHoldTimer()
    holding.value = false
    holdProgress.value = 0
    resolved.value = true
    emit('tap', false)
  }
}

onUnmounted(() => {
  clearHoldTimer()
})
</script>

<template>
  <div class="solder-mission">
    <div class="board-label">{{ t('납땜 포인트') }}</div>
    <div class="circuit-board">
      <div class="trace-line" />
      <div class="solder-points">
        <button
          v-for="(done, i) in completed"
          :key="i"
          class="solder-point"
          :class="{
            active: i === currentPoint && !done,
            holding: holding && i === currentPoint,
            completed: done,
            pending: i > currentPoint && !done,
          }"
          @pointerdown="handlePointerDown(i, $event)"
          @pointerup="handlePointerUp(i, $event)"
          @pointerleave="handlePointerUp(i, $event)"
        >
          <div
            class="point-fill"
            :style="{ transform: `scale(${holding && i === currentPoint ? holdProgress : done ? 1 : 0})` }"
          />
          <span class="point-label">{{ done ? '●' : i === currentPoint ? '○' : '·' }}</span>
        </button>
      </div>
    </div>
    <div class="solder-hint">{{ t('각 포인트를 누르세요') }}</div>
  </div>
</template>

<style scoped>
.solder-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.board-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.circuit-board {
  position: relative;
  width: 240px;
  padding: 24px 0;
}

.trace-line {
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 2px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-glow);
  transform: translateY(-50%);
}

.solder-points {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 0 12px;
}

.solder-point {
  width: 56px;
  height: 56px;
  background: var(--px-green-bg);
  border: 3px solid var(--arc-muted);
  border-radius: 0;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s;
  overflow: hidden;
  padding: 0;
}

.solder-point.active {
  border-color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.solder-point.holding {
  border-color: var(--px-green-bright);
  box-shadow: 0 0 24px var(--px-green-glow);
}

.solder-point.completed {
  border-color: var(--px-green-bright);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 16px var(--px-green-glow);
}

.solder-point.pending {
  opacity: 0.4;
}

.point-fill {
  position: absolute;
  inset: 0;
  background: rgba(140, 200, 144, 0.25);
  transition: transform 0.05s linear;
  transform-origin: center;
}

.point-label {
  font-size: 24px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  position: relative;
  z-index: 1;
}

.solder-hint {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

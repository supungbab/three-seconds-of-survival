<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const REQUIRED_SWIPES = 4
const swipeCount = ref(0)
const strength = ref(20) // start at 20%
let resolved = false
const containerEl = ref<HTMLElement | null>(null)
let startY = 0
let tracking = false

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  const y = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  startY = y
  tracking = true
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!tracking || resolved) return
  const y = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  const dy = startY - y
  if (dy > 30) {
    tracking = false
    swipeCount.value++
    playTick()
    strength.value = Math.min(100, 20 + (80 / REQUIRED_SWIPES) * swipeCount.value)
    if (swipeCount.value >= REQUIRED_SWIPES) {
      resolved = true
      emit('tap', true)
    }
  }
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  tracking = false
}

onMounted(() => {
  const el = containerEl.value
  if (!el) return
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

onUnmounted(() => {
  const el = containerEl.value
  if (!el) return
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchmove', onMove)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mousemove', onMove)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="signal-boost-mission">
    <div class="boost-header">{{ t('신호 증폭') }}</div>
    <div class="signal-display">
      <div class="bar-container">
        <div
          v-for="i in 5"
          :key="i"
          class="signal-bar"
          :class="{ active: strength >= i * 20 }"
          :style="{ height: `${i * 16 + 8}px` }"
        />
      </div>
      <div class="strength-value">{{ Math.round(strength) }}%</div>
    </div>
    <div class="swipe-count">{{ swipeCount }} / {{ REQUIRED_SWIPES }}</div>
    <div class="boost-hint">{{ t('위로 스와이프') }}</div>
  </div>
</template>

<style scoped>
.signal-boost-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 10px;
  min-height: 180px;
  touch-action: none;
}

.boost-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.signal-display {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.bar-container {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.signal-bar {
  width: 16px;
  background: #1a2a1a;
  border: 1px solid #2a3a2a;
  border-radius: 0;
  transition: background 0.2s, box-shadow 0.2s;
}

.signal-bar.active {
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  border-color: var(--px-green-bright);
}

.strength-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
  min-width: 60px;
  text-align: center;
}

.swipe-count {
  font-size: 12px;
  color: var(--arc-muted);
}

.boost-hint {
  font-size: 14px;
  color: var(--arc-muted);
  animation: hint-pulse 1s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>

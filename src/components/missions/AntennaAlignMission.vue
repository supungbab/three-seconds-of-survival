<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const targetAngle = ref(30 + Math.floor(Math.random() * 120))
const currentAngle = ref(90)
const containerEl = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const signalStrength = computed(() => {
  const diff = Math.abs(currentAngle.value - targetAngle.value)
  return Math.max(0, 1 - diff / 90)
})

const signalBars = computed(() => {
  return Math.round(signalStrength.value * 5)
})

const isAligned = computed(() => {
  return Math.abs(currentAngle.value - targetAngle.value) <= 15
})

function getAngleFromEvent(e: TouchEvent | MouseEvent): number {
  if (!containerEl.value) return currentAngle.value
  const rect = containerEl.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
  const relX = (clientX - rect.left) / rect.width
  return Math.round(relX * 180)
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = true
  currentAngle.value = getAngleFromEvent(e)
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value) return
  currentAngle.value = getAngleFromEvent(e)
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = false
}

function handleConfirm(e: Event) {
  e.stopPropagation()
  playTick()
  emit('tap', isAligned.value)
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchmove', onMove)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mousemove', onMove)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div class="antenna-align-mission">
    <div class="antenna-icon" :style="{ transform: `rotate(${currentAngle - 90}deg)` }">
      <span class="antenna-symbol">╿</span>
    </div>

    <div class="signal-meter">
      <div
        v-for="i in 5"
        :key="i"
        class="signal-bar"
        :class="{ active: i <= signalBars, strong: signalBars >= 4 }"
        :style="{ height: `${i * 8 + 4}px` }"
      />
    </div>

    <div class="angle-display">{{ currentAngle }}°</div>

    <div ref="containerEl" class="slider-track" :style="{ touchAction: 'none' }">
      <div class="slider-fill" :style="{ width: `${(currentAngle / 180) * 100}%` }" />
      <div class="slider-thumb" :style="{ left: `${(currentAngle / 180) * 100}%` }" />
    </div>

    <button class="confirm-btn" :class="{ aligned: isAligned }" @pointerdown="handleConfirm">
      CONFIRM
    </button>
  </div>
</template>

<style scoped>
.antenna-align-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.antenna-icon {
  font-size: 48px;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  transition: transform 0.1s linear;
}

.antenna-symbol {
  font-family: monospace;
}

.signal-meter {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 50px;
}

.signal-bar {
  width: 8px;
  background: #222;
  border: 1px solid #333;
  border-radius: 0;
  transition: background 0.15s;
}

.signal-bar.active {
  background: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.signal-bar.active.strong {
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.angle-display {
  font-family: monospace;
  font-size: 14px;
  color: var(--arc-muted);
}

.slider-track {
  position: relative;
  width: 220px;
  height: 24px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
  cursor: pointer;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--px-green-bright);
  opacity: 0.2;
  border-radius: 0;
}

.slider-thumb {
  position: absolute;
  top: -4px;
  width: 6px;
  height: 32px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  border-radius: 0;
  transform: translateX(-50%);
  pointer-events: none;
}

.confirm-btn {
  font-family: monospace;
  font-size: 14px;
  padding: 8px 24px;
  background: var(--px-green-bg);
  color: var(--arc-muted);
  border: 2px solid var(--arc-muted);
  border-radius: 0;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.15s;
}

.confirm-btn.aligned {
  color: var(--px-green-bright);
  border-color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.confirm-btn:active {
  transform: scale(0.95);
}
</style>

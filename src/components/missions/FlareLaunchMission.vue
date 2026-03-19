<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const resolved = ref(false)
const flareAngle = ref<number | null>(null)
const success = ref(false)
const failed = ref(false)
const flareTrail = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

let startX = 0
let startY = 0
const ANGLE_THRESHOLD = 20

function onTouchStart(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved.value) return
  const t = e.touches[0]
  startX = t.clientX
  startY = t.clientY
}

function onTouchEnd(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved.value) return
  const t = e.changedTouches[0]
  const dx = t.clientX - startX
  const dy = startY - t.clientY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 40) return

  const angleDeg = Math.atan2(dx, dy) * (180 / Math.PI)
  flareAngle.value = angleDeg
  resolved.value = true

  if (!containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  flareTrail.value = {
    x1: ((startX - rect.left) / rect.width) * 100,
    y1: ((startY - rect.top) / rect.height) * 100,
    x2: ((t.clientX - rect.left) / rect.width) * 100,
    y2: ((t.clientY - rect.top) / rect.height) * 100,
  }

  if (Math.abs(angleDeg) <= ANGLE_THRESHOLD) {
    success.value = true
    playTick()
    emit('tap', true)
  } else {
    failed.value = true
    emit('tap', false)
  }
}

function onTouchMove(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
}

function onMouseDown(e: MouseEvent) {
  e.stopPropagation()
  if (resolved.value) return
  startX = e.clientX
  startY = e.clientY
}

function onMouseUp(e: MouseEvent) {
  e.stopPropagation()
  if (resolved.value) return
  const dx = e.clientX - startX
  const dy = startY - e.clientY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 40) return

  const angleDeg = Math.atan2(dx, dy) * (180 / Math.PI)
  flareAngle.value = angleDeg
  resolved.value = true

  if (!containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  flareTrail.value = {
    x1: ((startX - rect.left) / rect.width) * 100,
    y1: ((startY - rect.top) / rect.height) * 100,
    x2: ((e.clientX - rect.left) / rect.width) * 100,
    y2: ((e.clientY - rect.top) / rect.height) * 100,
  }

  if (Math.abs(angleDeg) <= ANGLE_THRESHOLD) {
    success.value = true
    playTick()
    emit('tap', true)
  } else {
    failed.value = true
    emit('tap', false)
  }
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('touchend', onTouchEnd, { passive: false })
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchmove', onTouchMove)
  el.removeEventListener('touchend', onTouchEnd)
  el.removeEventListener('mousedown', onMouseDown)
  el.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div ref="containerEl" class="flare-launch-mission">
    <svg v-if="flareTrail" class="flare-trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line
        :x1="flareTrail.x1" :y1="flareTrail.y1"
        :x2="flareTrail.x2" :y2="flareTrail.y2"
        :stroke="success ? 'var(--px-green-bright)' : 'var(--arc-danger)'"
        stroke-width="1.5"
        opacity="0.8"
      />
    </svg>

    <div class="angle-guide">
      <div class="guide-line center" />
      <div class="guide-line left" :style="{ transform: `rotate(${ANGLE_THRESHOLD}deg)` }" />
      <div class="guide-line right" :style="{ transform: `rotate(-${ANGLE_THRESHOLD}deg)` }" />
      <div class="guide-label">±{{ ANGLE_THRESHOLD }}°</div>
    </div>

    <div class="flare-gun">
      <span class="gun-icon">▲</span>
      <span class="gun-label">FLARE</span>
    </div>

    <div v-if="!resolved" class="swipe-hint">
      ↑ SWIPE UP TO LAUNCH
    </div>
    <div v-if="success" class="result-text ok">FLARE SENT</div>
    <div v-if="failed" class="result-text bad">OFF TARGET</div>
  </div>
</template>

<style scoped>
.flare-launch-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  position: relative;
  min-height: 200px;
  touch-action: none;
}

.flare-trail-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.angle-guide {
  position: relative;
  width: 60px;
  height: 80px;
}

.guide-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  transform-origin: bottom center;
}

.guide-line.center {
  background: var(--px-green-bright);
  opacity: 0.6;
}

.guide-line.left,
.guide-line.right {
  background: var(--arc-muted);
  border-left: 1px dashed var(--arc-muted);
  opacity: 0.4;
}

.guide-label {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-family: monospace;
  color: var(--arc-muted);
  white-space: nowrap;
}

.flare-gun {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gun-icon {
  font-size: 40px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
}

.gun-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.swipe-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: hint-blink 1s ease-in-out infinite alternate;
}

.result-text {
  font-size: 16px;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 3px;
  animation: flash-in 0.2s ease-out;
}

.result-text.ok {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.result-text.bad {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

@keyframes hint-blink {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

@keyframes flash-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>

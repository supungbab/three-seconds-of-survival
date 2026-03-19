<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const barPosition = ref(0)
const resolved = ref(false)
const success = ref(false)
const failed = ref(false)

const GREEN_MIN = 40
const GREEN_MAX = 60
let direction = 1
let animId: number | null = null
let touchStartY = 0
let touchStartTime = 0

function animateBar() {
  if (resolved.value) return
  barPosition.value += direction * 1.8
  if (barPosition.value >= 100) { barPosition.value = 100; direction = -1 }
  if (barPosition.value <= 0) { barPosition.value = 0; direction = 1 }
  animId = requestAnimationFrame(animateBar)
}

function onTouchStart(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved.value) return
  const t = e.touches[0]
  touchStartY = t.clientY
  touchStartTime = Date.now()
}

function onTouchEnd(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved.value) return
  const t = e.changedTouches[0]
  const dy = touchStartY - t.clientY
  const dt = Date.now() - touchStartTime
  if (dy > 40 && dt < 500) {
    resolved.value = true
    if (barPosition.value >= GREEN_MIN && barPosition.value <= GREEN_MAX) {
      success.value = true
      playTick()
      emit('tap', true)
    } else {
      failed.value = true
      emit('tap', false)
    }
  }
}

function onTouchMove(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
}

function onMouseDown(e: MouseEvent) {
  e.stopPropagation()
  if (resolved.value) return
  touchStartY = e.clientY
  touchStartTime = Date.now()
}

function onMouseUp(e: MouseEvent) {
  e.stopPropagation()
  if (resolved.value) return
  const dy = touchStartY - e.clientY
  const dt = Date.now() - touchStartTime
  if (dy > 40 && dt < 500) {
    resolved.value = true
    if (barPosition.value >= GREEN_MIN && barPosition.value <= GREEN_MAX) {
      success.value = true
      playTick()
      emit('tap', true)
    } else {
      failed.value = true
      emit('tap', false)
    }
  }
}

onMounted(() => {
  animId = requestAnimationFrame(animateBar)
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('touchend', onTouchEnd, { passive: false })
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
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
  <div ref="containerEl" class="reload-mission">
    <div class="reload-display">
      <div class="slot-area">
        <span class="slot-icon">▣</span>
        <span class="slot-label">CHAMBER</span>
      </div>

      <div class="timing-bar-container">
        <div class="timing-bar-track">
          <div
            class="timing-bar-green"
            :style="{ top: `${100 - GREEN_MAX}%`, height: `${GREEN_MAX - GREEN_MIN}%` }"
          />
          <div
            class="timing-bar-indicator"
            :style="{ top: `${100 - barPosition}%` }"
          />
        </div>
      </div>

      <div class="magazine-area" :class="{ loaded: success, miss: failed }">
        <span class="mag-icon">▥</span>
        <span class="mag-label">MAG</span>
      </div>
    </div>

    <div class="swipe-hint" :class="{ hidden: resolved }">
      ↑ SWIPE UP TO RELOAD
    </div>

    <div v-if="success" class="result-flash success-flash">LOADED</div>
    <div v-if="failed" class="result-flash fail-flash">JAMMED</div>
  </div>
</template>

<style scoped>
.reload-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
}

.reload-display {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 160px;
}

.slot-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.slot-icon {
  font-size: 40px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.slot-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.timing-bar-container {
  width: 24px;
  height: 140px;
}

.timing-bar-track {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  overflow: hidden;
}

.timing-bar-green {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 255, 65, 0.15);
  border-top: 1px solid var(--px-green-bright);
  border-bottom: 1px solid var(--px-green-bright);
}

.timing-bar-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  transform: translateY(-50%);
  transition: none;
}

.magazine-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.3s ease-out;
}

.magazine-area.loaded {
  transform: translateY(-40px);
}

.magazine-area.miss {
  animation: mag-shake 0.3s ease;
}

.mag-icon {
  font-size: 40px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.mag-label {
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

.swipe-hint.hidden {
  opacity: 0;
}

.result-flash {
  font-size: 18px;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 4px;
  animation: flash-in 0.2s ease-out;
}

.success-flash {
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
}

.fail-flash {
  color: var(--arc-danger);
  text-shadow: 0 0 16px var(--arc-danger-glow);
}

@keyframes mag-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-4px); }
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

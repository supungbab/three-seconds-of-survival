<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const fillProgress = ref(0)
const isHolding = ref(false)
const HOLD_DURATION = 2500 // ms
let raf = 0
let holdStart = 0
let resolved = false

function animate(now: number) {
  if (!isHolding.value || resolved) return
  const elapsed = now - holdStart
  fillProgress.value = Math.min(1, elapsed / HOLD_DURATION)
  if (elapsed >= HOLD_DURATION) {
    resolved = true
    playTick()
    emit('tap', true)
    return
  }
  raf = requestAnimationFrame(animate)
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  isHolding.value = true
  holdStart = performance.now()
  raf = requestAnimationFrame(animate)
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved || !isHolding.value) return
  isHolding.value = false
  cancelAnimationFrame(raf)
  resolved = true
  emit('tap', false)
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mouseup', onEnd)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="deadman-mission">
    <div class="switch-btn" :class="{ active: isHolding }">
      <div class="fill-bar" :style="{ height: `${fillProgress * 100}%` }" />
      <span class="btn-text">{{ isHolding ? 'HOLDING...' : 'HOLD' }}</span>
    </div>
    <div class="timer">{{ (fillProgress * 100).toFixed(0) }}%</div>
    <div class="hint">DO NOT RELEASE</div>
  </div>
</template>

<style scoped>
.deadman-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 200px;
  touch-action: none;
}

.switch-btn {
  position: relative;
  width: 120px;
  height: 120px;
  border: 3px solid var(--arc-danger);
  background: #1a0808;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(255, 59, 92, 0.2);
  border-radius: 0;
}

.switch-btn.active {
  border-color: var(--arc-danger);
  box-shadow: 0 0 24px var(--arc-danger-glow);
}

.fill-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--arc-danger);
  opacity: 0.3;
  transition: height 0.05s linear;
}

.btn-text {
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.timer {
  font-size: 18px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-danger);
  animation: blink-warn 0.6s steps(1) infinite;
}

@keyframes blink-warn {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.4; }
}
</style>

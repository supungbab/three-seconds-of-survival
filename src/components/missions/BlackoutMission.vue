<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const screenGlow = ref(0) // 0~1
const flashOn = ref(false)
const phase = ref<'buildup' | 'peak' | 'fade'>('buildup')

const PEAK_START = 1400
const PEAK_END = 2000

let startTime = 0
let resolved = false
let raf = 0
let lastFlashTime = 0

function animate(now: number) {
  if (resolved) return
  const elapsed = now - startTime

  if (elapsed >= PEAK_START && elapsed <= PEAK_END) {
    phase.value = 'peak'
  } else if (elapsed > PEAK_END) {
    phase.value = 'fade'
  }

  // Flash interval: starts slow, gets fast, then slows
  let interval: number
  if (elapsed < PEAK_START) {
    const p = elapsed / PEAK_START
    interval = 500 - 420 * (p * p) // 500ms → 80ms
  } else if (elapsed <= PEAK_END) {
    interval = 60 // rapid strobe at peak
  } else {
    const p = Math.min(1, (elapsed - PEAK_END) / 600)
    interval = 80 + 420 * p // 80ms → 500ms
  }

  // Flash toggle
  if (now - lastFlashTime >= interval) {
    lastFlashTime = now
    flashOn.value = !flashOn.value
  }

  // Screen glow intensity
  if (elapsed < PEAK_START) {
    const p = elapsed / PEAK_START
    screenGlow.value = flashOn.value ? 0.03 + p * 0.15 : 0
  } else if (elapsed <= PEAK_END) {
    // Peak: bright flashes, screen visibly lights up
    screenGlow.value = flashOn.value ? 0.6 : 0.08
  } else {
    const p = Math.min(1, (elapsed - PEAK_END) / 600)
    screenGlow.value = flashOn.value ? 0.15 * (1 - p) : 0
  }

  if (elapsed > 2600 && !resolved) {
    resolved = true
    emit('tap', false)
    return
  }

  raf = requestAnimationFrame(animate)
}

function onTap(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  resolved = true

  if (phase.value === 'peak') {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onMounted(() => {
  startTime = performance.now()
  lastFlashTime = startTime
  raf = requestAnimationFrame(animate)
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTap, { passive: false })
  el.addEventListener('mousedown', onTap)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onTap)
  el.removeEventListener('mousedown', onTap)
})
</script>

<template>
  <div ref="containerEl" class="blackout-mission">
    <!-- Screen flash overlay -->
    <div class="screen-flash" :style="{ opacity: screenGlow }" />

    <!-- Emergency light -->
    <div class="emergency-light" :class="{ on: flashOn, peak: phase === 'peak' }" />

    <!-- Content -->
    <div class="blackout-content">
      <div class="power-icon" :class="{ peak: phase === 'peak' }">⏻</div>
      <div class="status-text" :class="phase">
        {{ phase === 'peak' ? 'POWER DETECTED' : phase === 'fade' ? 'SIGNAL LOST' : 'NO SIGNAL' }}
      </div>
    </div>

    <!-- Bottom bar flickers -->
    <div class="power-bar">
      <div
        class="power-segment"
        v-for="i in 8"
        :key="i"
        :class="{ lit: flashOn && phase === 'peak' && i <= 6, dim: flashOn && phase !== 'peak' && i <= 2 }"
      />
    </div>
  </div>
</template>

<style scoped>
.blackout-mission {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 20px;
  touch-action: none;
  min-height: 200px;
  background: #010101;
  overflow: hidden;
}

.screen-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(140, 200, 144, 0.4), transparent 70%);
  pointer-events: none;
  z-index: 1;
  will-change: opacity;
}

.emergency-light {
  position: absolute;
  top: 16px;
  right: 24px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #220000;
  z-index: 2;
  transition: none;
}

.emergency-light.on {
  background: #ff3b3b;
  box-shadow: 0 0 8px #ff3b3b, 0 0 20px rgba(255, 59, 59, 0.4);
}

.emergency-light.peak {
  background: #ff6b6b;
  box-shadow: 0 0 12px #ff3b3b, 0 0 32px rgba(255, 59, 59, 0.6);
}

.blackout-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.power-icon {
  font-size: 48px;
  color: #111;
  transition: none;
  will-change: color, text-shadow;
}

.power-icon.peak {
  color: var(--px-green-bright);
  text-shadow: 0 0 24px var(--px-green-glow-strong), 0 0 60px rgba(140, 200, 144, 0.3);
}

.status-text {
  font-size: 11px;
  letter-spacing: 4px;
  color: #111;
  transition: none;
}

.status-text.buildup {
  color: #1a1a1a;
}

.status-text.peak {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  animation: text-flicker 0.1s infinite alternate;
}

.status-text.fade {
  color: #1a1a1a;
}

@keyframes text-flicker {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

.power-bar {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.power-segment {
  width: 16px;
  height: 6px;
  background: #0a0a0a;
  border: 1px solid #151515;
}

.power-segment.dim {
  background: rgba(140, 200, 144, 0.08);
  border-color: rgba(140, 200, 144, 0.15);
}

.power-segment.lit {
  background: var(--px-green-bright);
  border-color: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}
</style>

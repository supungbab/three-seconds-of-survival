<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const tearY = ref(0)
let animFrame: number | null = null
let startTime = 0
const CYCLE_MS = 1600

function updateTear() {
  const elapsed = Date.now() - startTime
  const progress = (elapsed % CYCLE_MS) / CYCLE_MS
  tearY.value = progress * 100
  animFrame = requestAnimationFrame(updateTear)
}

function handleTap(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()

  const distFromCenter = Math.abs(tearY.value - 50)
  playTick()
  emit('tap', distFromCenter < 15)
}

onMounted(() => {
  startTime = Date.now()
  animFrame = requestAnimationFrame(updateTear)

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', handleTap, { passive: false })
  el.addEventListener('mousedown', handleTap)
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', handleTap)
  el.removeEventListener('mousedown', handleTap)
})
</script>

<template>
  <div ref="containerEl" class="vsync-mission">
    <div class="hint-label">TAP WHEN CENTERED</div>
    <div class="vsync-screen">
      <div class="screen-content">
        <span class="screen-text">VSYNC</span>
      </div>
      <div
        class="tear-line"
        :style="{ top: `${tearY}%` }"
      />
      <div
        class="tear-region"
        :style="{ top: `${tearY - 3}%`, height: '6%' }"
      />
      <div class="center-marker" />
      <div class="scanlines" />
    </div>
    <div class="position-readout">
      TEAR: {{ Math.round(tearY) }}%
    </div>
  </div>
</template>

<style scoped>
.vsync-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  user-select: none;
}

.hint-label {
  font-family: monospace;
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.vsync-screen {
  position: relative;
  width: 200px;
  height: 140px;
  border: 2px solid var(--px-green-bright);
  overflow: hidden;
  background: var(--px-green-bg);
}

.screen-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-text {
  font-family: monospace;
  font-size: 36px;
  font-weight: bold;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 6px;
}

.tear-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow), 0 0 20px var(--px-green-glow);
  z-index: 3;
  pointer-events: none;
}

.tear-region {
  position: absolute;
  left: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 255, 65, 0.08),
    transparent
  );
  z-index: 2;
  pointer-events: none;
}

.center-marker {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--arc-danger);
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.25) 2px,
    rgba(0, 0, 0, 0.25) 4px
  );
  pointer-events: none;
  z-index: 4;
}

.position-readout {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false

interface Wire {
  y: number
  gapStart: number
  gapEnd: number
}

const wires = ref<Wire[]>([])
const traceX = ref(0)
const traceY = ref(50)
const isTracing = ref(false)
const progress = ref(0)

onMounted(() => {
  const generated: Wire[] = []
  const numWires = 4
  for (let i = 0; i < numWires; i++) {
    const x = ((i + 1) / (numWires + 1)) * 100
    const gapCenter = 20 + Math.random() * 60
    const gapSize = 15
    generated.push({
      y: x,
      gapStart: gapCenter - gapSize / 2,
      gapEnd: gapCenter + gapSize / 2,
    })
  }
  wires.value = generated

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

function getRelativePos(e: TouchEvent | MouseEvent): { x: number; y: number } | null {
  if (!containerEl.value) return null
  const rect = containerEl.value.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

function checkWireCollision(x: number, y: number): boolean {
  for (const wire of wires.value) {
    const wireX = wire.y
    if (Math.abs(x - wireX) < 3) {
      if (y < wire.gapStart || y > wire.gapEnd) {
        return true
      }
    }
  }
  return false
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const pos = getRelativePos(e)
  if (!pos) return
  if (pos.x < 15) {
    isTracing.value = true
    traceX.value = pos.x
    traceY.value = pos.y
    progress.value = pos.x
  }
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isTracing.value || resolved) return
  const pos = getRelativePos(e)
  if (!pos) return

  traceX.value = pos.x
  traceY.value = pos.y
  progress.value = pos.x

  if (checkWireCollision(pos.x, pos.y)) {
    resolved = true
    isTracing.value = false
    emit('tap', false)
    return
  }

  if (pos.x >= 90) {
    resolved = true
    isTracing.value = false
    playTick()
    emit('tap', true)
  }
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isTracing.value = false
  traceX.value = 0
  progress.value = 0
}

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
  <div ref="containerEl" class="tripwire-mission">
    <div class="start-marker" :class="{ active: isTracing }">▶</div>
    <div class="end-marker">◀</div>

    <svg class="wire-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <template v-for="(wire, i) in wires" :key="i">
        <line
          :x1="wire.y" y1="0"
          :x2="wire.y" :y2="wire.gapStart"
          stroke="var(--arc-danger)" stroke-width="1.5"
        />
        <line
          :x1="wire.y" :y1="wire.gapEnd"
          :x2="wire.y" y2="100"
          stroke="var(--arc-danger)" stroke-width="1.5"
        />
        <line
          :x1="wire.y" :y1="wire.gapStart"
          :x2="wire.y" :y2="wire.gapEnd"
          stroke="var(--px-green-bright)" stroke-width="1"
          stroke-dasharray="2,2" opacity="0.5"
        />
      </template>

      <circle
        v-if="isTracing"
        :cx="traceX" :cy="traceY"
        r="2"
        fill="var(--px-green-bright)"
      />
    </svg>

    <div class="tripwire-progress-bar">
      <div class="tripwire-progress-fill" :style="{ width: `${progress}%` }" />
    </div>
    <div class="tripwire-hint">{{ t('틈 사이로 스와이프') }}</div>
  </div>
</template>

<style scoped>
.tripwire-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
  touch-action: none;
  position: relative;
}

.wire-svg {
  width: 100%;
  height: 120px;
  background: var(--px-green-bg);
  border: 2px solid #3a4a38;
}

.start-marker {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  z-index: 2;
}

.start-marker.active {
  text-shadow: 0 0 16px var(--px-green-glow), 0 0 30px var(--px-green-glow);
}

.end-marker {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  z-index: 2;
  animation: end-pulse 1s ease-in-out infinite alternate;
}

.tripwire-progress-bar {
  width: 160px;
  height: 8px;
  background: #0c140c;
  overflow: hidden;
  border: 2px solid #3a4a38;
  box-shadow: 0 0 0 2px #111311, inset 1px 1px 0 #2a322a;
}

.tripwire-progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  transition: width 0.05s linear;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.tripwire-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

@keyframes end-pulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>

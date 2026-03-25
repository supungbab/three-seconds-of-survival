<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { getRelativePos } from '@/utils/dom'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false

interface Point {
  x: number
  y: number
  traced: boolean
}

const crackPoints = ref<Point[]>([])
const isTracing = ref(false)
const traceProgress = ref(0)
const TOLERANCE = 12

onMounted(() => {
  const points: Point[] = []
  const numPoints = 10
  let y = 10
  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * 80 + 10
    y = y + (Math.random() - 0.5) * 20
    y = Math.max(15, Math.min(85, y))
    points.push({ x, y, traced: false })
  }
  crackPoints.value = points

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = ax + t * dx
  const projY = ay + t * dy
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

function checkTrace(pos: { x: number; y: number }): boolean {
  let onPath = false
  const pts = crackPoints.value
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distToSegment(pos.x, pos.y, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y)
    if (d < TOLERANCE) {
      onPath = true
      pts[i].traced = true
      pts[i + 1].traced = true
    }
  }
  return onPath
}

function updateProgress() {
  const traced = crackPoints.value.filter((p) => p.traced).length
  traceProgress.value = traced / crackPoints.value.length
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  if (!containerEl.value) return
  const pos = getRelativePos(containerEl.value, e)
  isTracing.value = true
  checkTrace(pos)
  updateProgress()
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isTracing.value || resolved) return
  if (!containerEl.value) return
  const pos = getRelativePos(containerEl.value, e)

  const onPath = checkTrace(pos)
  updateProgress()

  if (!onPath) {
    resolved = true
    isTracing.value = false
    emit('tap', false)
    return
  }

  if (traceProgress.value >= 0.7) {
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
}

const crackPath = computed(() => {
  const pts = crackPoints.value
  if (pts.length < 2) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const tracedPath = computed(() => {
  const pts = crackPoints.value.filter((p) => p.traced)
  if (pts.length < 2) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
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
  <div ref="containerEl" class="weld-mission">
    <div class="weld-label">{{ t('균열 용접') }}</div>
    <div class="weld-area">
      <svg class="weld-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          :d="crackPath"
          fill="none"
          stroke="#1a1a1a"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          :d="crackPath"
          fill="none"
          stroke="var(--arc-muted)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="3,3"
        />
        <path
          v-if="tracedPath"
          :d="tracedPath"
          fill="none"
          stroke="var(--px-green-bright)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#weldGlow)"
        />
        <defs>
          <filter id="weldGlow">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
    <div class="weld-progress-bar">
      <div class="weld-progress-fill" :style="{ width: `${traceProgress * 100}%` }" />
    </div>
    <div class="weld-hint">{{ t('균열을 따라 그리세요') }}</div>
  </div>
</template>

<style scoped>
.weld-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
  touch-action: none;
}

.weld-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.weld-area {
  width: 100%;
  height: 120px;
  position: relative;
  background: #0a120a;
  border: 2px solid #3a4a38;
}

.weld-svg {
  width: 100%;
  height: 100%;
}

.weld-progress-bar {
  width: 160px;
  height: 8px;
  background: #0c140c;
  overflow: hidden;
  border: 2px solid #3a4a38;
  box-shadow: 0 0 0 2px #111311, inset 1px 1px 0 #2a322a;
}

.weld-progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  transition: width 0.05s linear;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.weld-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    crankTarget?: number
  }>(),
  { crankTarget: 3 },
)

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false

const currentAngle = ref(0)
const totalRotation = ref(0)
let lastAngle: number | null = null
let isDragging = false
let centerX = 0
let centerY = 0

const progress = computed(() => {
  const target = props.crankTarget * 360
  return Math.min(1, totalRotation.value / target)
})

const rotations = computed(() => {
  return (totalRotation.value / 360).toFixed(1)
})

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

function getAngleFromCenter(e: TouchEvent | MouseEvent): number {
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return

  const dialEl = containerEl.value?.querySelector('.crank-dial')
  if (dialEl) {
    const rect = dialEl.getBoundingClientRect()
    centerX = rect.left + rect.width / 2
    centerY = rect.top + rect.height / 2
  }

  isDragging = true
  lastAngle = getAngleFromCenter(e)
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging || resolved) return

  const angle = getAngleFromCenter(e)
  if (lastAngle !== null) {
    let diff = angle - lastAngle
    while (diff > 180) diff -= 360
    while (diff < -180) diff += 360

    currentAngle.value += diff
    if (diff > 0) {
      totalRotation.value += Math.abs(diff)
    }
  }
  lastAngle = angle

  const target = props.crankTarget * 360
  if (totalRotation.value >= target) {
    resolved = true
    isDragging = false
    playTick()
    emit('tap', true)
  }
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging = false
  lastAngle = null
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
  <div ref="containerEl" class="crank-start-mission">
    <div class="crank-label">{{ t('크랭크 시동') }}</div>
    <div class="crank-dial" :style="{ transform: `rotate(${currentAngle}deg)` }">
      <div class="crank-handle">◆</div>
      <div class="crank-center">⊕</div>
    </div>
    <div class="crank-info">{{ rotations }} / {{ crankTarget }}</div>
    <div class="crank-progress-bar">
      <div class="crank-progress-fill" :style="{ width: `${progress * 100}%` }" />
    </div>
    <div class="crank-hint">{{ t('시계 방향으로 회전') }}</div>
  </div>
</template>

<style scoped>
.crank-start-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
  touch-action: none;
  min-height: 200px;
}

.crank-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.crank-dial {
  width: 130px;
  height: 130px;
  border: 3px solid #3a4a38;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 0 0 2px #111311,
    0 0 16px var(--px-green-glow),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  cursor: grab;
}

.crank-handle {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.crank-center {
  font-size: 36px;
  font-family: monospace;
  color: var(--arc-muted);
}

.crank-info {
  font-size: 16px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.crank-progress-bar {
  width: 160px;
  height: 8px;
  background: #0c140c;
  overflow: hidden;
  border: 2px solid #3a4a38;
  box-shadow: 0 0 0 2px #111311, inset 1px 1px 0 #2a322a;
}

.crank-progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  transition: width 0.05s linear;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.crank-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}
</style>

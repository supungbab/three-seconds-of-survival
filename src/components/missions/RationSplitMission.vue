<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    rationTotal?: number
    rationParts?: number
  }>(),
  { rationTotal: 100, rationParts: 4 },
)

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false

const dividerPos = ref(50)
const isDragging = ref(false)
const showConfirm = ref(true)

const targetPos = computed(() => {
  return (1 / props.rationParts) * 100
})

const splitValue = computed(() => {
  return Math.round((dividerPos.value / 100) * props.rationTotal)
})

const isCorrect = computed(() => {
  const target = props.rationTotal / props.rationParts
  const actual = (dividerPos.value / 100) * props.rationTotal
  const tolerance = props.rationTotal * 0.1
  return Math.abs(actual - target) <= tolerance
})

function getRelativeX(e: TouchEvent | MouseEvent): number | null {
  const barEl = containerEl.value?.querySelector('.ration-bar')
  if (!barEl) return null
  const rect = barEl.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  return ((clientX - rect.left) / rect.width) * 100
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const x = getRelativeX(e)
  if (x === null) return
  if (Math.abs(x - dividerPos.value) < 15) {
    isDragging.value = true
  }
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value || resolved) return
  const x = getRelativeX(e)
  if (x === null) return
  dividerPos.value = Math.max(5, Math.min(95, x))
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = false
}

function onConfirm(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  resolved = true
  if (isCorrect.value) {
    playTick()
  }
  emit('tap', isCorrect.value)
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
  <div ref="containerEl" class="ration-split-mission">
    <div class="ration-label">{{ t('식량 분배') }}: {{ rationTotal }} / {{ rationParts }}</div>
    <div class="ration-bar">
      <div class="ration-fill" :style="{ width: `${dividerPos}%` }" />
      <div
        class="ration-divider"
        :class="{ dragging: isDragging, correct: isCorrect }"
        :style="{ left: `${dividerPos}%` }"
      >
        <span class="divider-handle">│</span>
      </div>
    </div>
    <div class="ration-value">
      <span class="split-left">{{ splitValue }}</span>
      <span class="split-sep">│</span>
      <span class="split-right">{{ rationTotal - splitValue }}</span>
    </div>
    <button
      v-if="showConfirm"
      class="confirm-btn"
      :class="{ ready: isCorrect }"
      @touchstart.stop.prevent="onConfirm"
      @mousedown.stop.prevent="onConfirm"
    >
      {{ t('확인') }}
    </button>
  </div>
</template>

<style scoped>
.ration-split-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
}

.ration-label {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.ration-bar {
  position: relative;
  width: 100%;
  max-width: 280px;
  height: 32px;
  background: #0c140c;
  border: 2px solid #3a4a38;
}

.ration-fill {
  height: 100%;
  background: rgba(140, 200, 144, 0.15);
  border-right: none;
}

.ration-divider {
  position: absolute;
  top: -6px;
  bottom: -6px;
  width: 4px;
  transform: translateX(-50%);
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ration-divider.dragging {
  box-shadow: 0 0 16px var(--px-green-glow), 0 0 30px var(--px-green-glow);
}

.ration-divider.correct {
  background: var(--px-green-bright);
}

.divider-handle {
  font-size: 20px;
  color: var(--px-green-bright);
  pointer-events: none;
}

.ration-value {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 18px;
}

.split-left {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.split-sep {
  color: var(--arc-muted);
}

.split-right {
  color: var(--arc-muted);
}

.confirm-btn {
  font-size: 14px;
  padding: 8px 24px;
  background: #0c140c;
  color: var(--arc-muted);
  border: 2px solid #3a4a38;
  cursor: pointer;
  letter-spacing: 2px;
  text-shadow: 0 0 8px var(--px-green-glow);
  touch-action: none;
}

.confirm-btn.ready {
  color: var(--px-green-bright);
  border-color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}
</style>

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
const topOffset = ref(0)
const isDragging = ref(false)
const targetOffset = ref(0)
const startDragX = ref(0)
const startOffsetX = ref(0)

const TOLERANCE = 8
let resolved = false

onMounted(() => {
  const dir = Math.random() > 0.5 ? 1 : -1
  topOffset.value = dir * (30 + Math.random() * 40)
  targetOffset.value = 0
})

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
  startDragX.value = clientX
  startOffsetX.value = topOffset.value
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value || !containerEl.value) return
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
  const rect = containerEl.value.getBoundingClientRect()
  const dx = ((clientX - startDragX.value) / rect.width) * 100
  topOffset.value = startOffsetX.value + dx
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value) return
  isDragging.value = false

  const aligned = Math.abs(topOffset.value - targetOffset.value) < TOLERANCE
  if (aligned) {
    if (resolved) return
    resolved = true
    playTick()
    emit('tap', true)
  }
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
  <div ref="containerEl" class="interlace-mission">
    <div class="hint-label">{{ t('신호 정렬') }}</div>
    <div class="interlace-screen">
      <div class="scanlines" />
      <div class="half top-half" :style="{ transform: `translateX(${topOffset}%)` }">
        <span class="half-text">SYNC</span>
      </div>
      <div class="divider" />
      <div class="half bottom-half">
        <span class="half-text">SYNC</span>
      </div>
    </div>
    <div class="align-indicator" :class="{ close: Math.abs(topOffset) < TOLERANCE * 2 }">
      {{ t('오프셋') }}: {{ Math.round(topOffset) }}
    </div>
  </div>
</template>

<style scoped>
.interlace-mission {
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
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.interlace-screen {
  position: relative;
  width: 200px;
  height: 120px;
  border: 2px solid var(--px-green-bright);
  overflow: hidden;
  background: var(--px-green-bg);
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.3) 2px,
    rgba(0, 0, 0, 0.3) 4px
  );
  pointer-events: none;
  z-index: 2;
}

.half {
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.top-half {
  transition: transform 0.05s linear;
}

.half-text {
  font-size: 32px;
  font-weight: bold;
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
  letter-spacing: 8px;
}

.divider {
  width: 100%;
  height: 2px;
  background: var(--px-green-bright);
  opacity: 0.3;
  position: absolute;
  top: 50%;
  z-index: 1;
}

.align-indicator {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 1px;
  transition: color 0.2s;
}

.align-indicator.close {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}
</style>

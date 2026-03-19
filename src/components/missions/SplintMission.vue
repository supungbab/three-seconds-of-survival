<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const topOffsetX = ref(0)
const initialOffset = ref(0)
const TOLERANCE = 15

onMounted(() => {
  const offset = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.floor(Math.random() * 40))
  topOffsetX.value = offset
  initialOffset.value = offset

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

let dragStartX = 0
let dragStartOffset = 0

function getClientX(e: TouchEvent | MouseEvent): number {
  return 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = true
  dragStartX = getClientX(e)
  dragStartOffset = topOffsetX.value
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value) return
  const dx = getClientX(e) - dragStartX
  topOffsetX.value = dragStartOffset + dx
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value) return
  isDragging.value = false

  if (Math.abs(topOffsetX.value) <= TOLERANCE) {
    topOffsetX.value = 0
    playTick()
    emit('tap', true)
  }
}

const isAligned = computed(() => Math.abs(topOffsetX.value) <= TOLERANCE)
</script>

<template>
  <div class="splint-mission">
    <div class="splint-header">[ BONE ALIGNMENT ]</div>

    <div ref="containerEl" class="bone-area" :style="{ touchAction: 'none' }">
      <!-- Top bone fragment -->
      <div
        class="bone-fragment top"
        :class="{ aligned: isAligned, dragging: isDragging }"
        :style="{ transform: `translateX(${topOffsetX}px)` }"
      >
        <div class="bone-body" />
        <div class="bone-jagged">
          <span>▽▽▽</span>
        </div>
      </div>

      <!-- Gap line -->
      <div class="fracture-line" :class="{ aligned: isAligned }" />

      <!-- Bottom bone fragment (fixed) -->
      <div class="bone-fragment bottom">
        <div class="bone-jagged">
          <span>△△△</span>
        </div>
        <div class="bone-body" />
      </div>
    </div>

    <div class="splint-hint">DRAG TO ALIGN</div>
  </div>
</template>

<style scoped>
.splint-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.splint-header {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.bone-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  cursor: grab;
  user-select: none;
  min-height: 140px;
  justify-content: center;
}

.bone-fragment {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.05s linear;
}

.bone-fragment.dragging {
  transition: none;
}

.bone-body {
  width: 40px;
  height: 36px;
  background: var(--px-green-bright);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.bone-jagged {
  font-family: monospace;
  font-size: 14px;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
  line-height: 1;
  letter-spacing: -2px;
}

.bone-fragment.aligned .bone-body {
  box-shadow: 0 0 16px var(--px-green-glow), 0 0 24px var(--px-green-glow);
}

.fracture-line {
  width: 60px;
  height: 2px;
  background: var(--arc-danger);
  box-shadow: 0 0 6px var(--arc-danger-glow);
  margin: 2px 0;
  transition: all 0.2s;
}

.fracture-line.aligned {
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.splint-hint {
  font-family: monospace;
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}
</style>

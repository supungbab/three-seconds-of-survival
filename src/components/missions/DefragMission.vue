<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false

interface Cell {
  id: number
  isEmpty: boolean
  isTarget: boolean
}

const grid = ref<Cell[]>([])
const emptyIndex = ref(8)
const targetIndex = ref(0)
const dragIndex = ref<number | null>(null)
const dragOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDragging = ref(false)

onMounted(() => {
  const cells: Cell[] = []
  for (let i = 0; i < 9; i++) {
    cells.push({ id: i, isEmpty: false, isTarget: false })
  }

  const emptyIdx = Math.floor(Math.random() * 9)
  cells[emptyIdx].isEmpty = true
  emptyIndex.value = emptyIdx

  const adjacent = getAdjacent(emptyIdx)
  const targetIdx = pickRandom(adjacent)
  cells[targetIdx].isTarget = true
  targetIndex.value = targetIdx

  grid.value = cells

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

function getAdjacent(idx: number): number[] {
  const row = Math.floor(idx / 3)
  const col = idx % 3
  const adj: number[] = []
  if (row > 0) adj.push(idx - 3)
  if (row < 2) adj.push(idx + 3)
  if (col > 0) adj.push(idx - 1)
  if (col < 2) adj.push(idx + 1)
  return adj
}

function getCellFromPos(e: TouchEvent | MouseEvent): number | null {
  if (!containerEl.value) return null
  const gridEl = containerEl.value.querySelector('.defrag-grid')
  if (!gridEl) return null
  const rect = gridEl.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  const col = Math.floor(((clientX - rect.left) / rect.width) * 3)
  const row = Math.floor(((clientY - rect.top) / rect.height) * 3)
  if (col < 0 || col > 2 || row < 0 || row > 2) return null
  return row * 3 + col
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const cellIdx = getCellFromPos(e)
  if (cellIdx === null) return
  if (cellIdx === targetIndex.value) {
    isDragging.value = true
    dragIndex.value = cellIdx
  }
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value || resolved) return
  if (!containerEl.value) return
  const gridEl = containerEl.value.querySelector('.defrag-grid')
  if (!gridEl) return
  const rect = gridEl.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  dragOffset.value = {
    x: clientX - rect.left - ((targetIndex.value % 3) + 0.5) * (rect.width / 3),
    y: clientY - rect.top - (Math.floor(targetIndex.value / 3) + 0.5) * (rect.height / 3),
  }
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value || resolved) return
  isDragging.value = false

  const cellIdx = getCellFromPos(e)
  if (cellIdx === emptyIndex.value) {
    resolved = true
    playTick()
    emit('tap', true)
  } else {
    dragOffset.value = { x: 0, y: 0 }
  }
}

const targetStyle = computed(() => {
  if (!isDragging.value) return {}
  return {
    transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)`,
    zIndex: 10,
  }
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
  <div ref="containerEl" class="defrag-mission">
    <div class="defrag-label">{{ t('디스크 조각 모음') }}</div>
    <div class="defrag-grid">
      <div
        v-for="(cell, i) in grid"
        :key="cell.id"
        class="defrag-cell"
        :class="{
          empty: cell.isEmpty,
          target: cell.isTarget,
          dragging: cell.isTarget && isDragging,
        }"
        :style="cell.isTarget ? targetStyle : {}"
      >
        <span v-if="!cell.isEmpty" class="cell-content">
          {{ cell.isTarget ? '█' : '▓' }}
        </span>
      </div>
    </div>
    <div class="defrag-hint">{{ t('블록을 빈 칸으로 드래그') }}</div>
  </div>
</template>

<style scoped>
.defrag-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
}

.defrag-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.defrag-grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  grid-template-rows: repeat(3, 60px);
  gap: 4px;
}

.defrag-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c140c;
  border: 2px solid #3a4a38;
  position: relative;
  transition: transform 0.1s;
}

.defrag-cell.empty {
  background: #060a06;
  border-style: dashed;
  border-color: var(--px-green-bright);
  box-shadow: inset 0 0 12px rgba(140, 200, 144, 0.1);
}

.defrag-cell.target {
  background: #0e1e0e;
  border-color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
  cursor: grab;
}

.defrag-cell.dragging {
  cursor: grabbing;
  box-shadow: 0 0 20px var(--px-green-glow);
}

.cell-content {
  font-size: 28px;
  font-family: monospace;
  color: var(--arc-muted);
}

.defrag-cell.target .cell-content {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.defrag-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}
</style>

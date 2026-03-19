<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const cells = ref<boolean[]>(Array(9).fill(false))
const revealing = ref(true)
const tapped = ref(false)
let revealTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const mineCount = Math.random() < 0.5 ? 2 : 3
  const indices = new Set<number>()
  while (indices.size < mineCount) {
    indices.add(Math.floor(Math.random() * 9))
  }
  const grid = Array(9).fill(false)
  indices.forEach((i) => { grid[i] = true })
  cells.value = grid

  revealTimer = setTimeout(() => {
    revealing.value = false
  }, 800)
})

onUnmounted(() => {
  if (revealTimer) clearTimeout(revealTimer)
})

function handleCell(index: number, e: Event) {
  e.stopPropagation()
  if (tapped.value || revealing.value) return
  tapped.value = true
  playTick()
  emit('tap', !cells.value[index])
}
</script>

<template>
  <div class="minefield-mission">
    <div class="label">{{ revealing ? 'MEMORIZE MINES' : 'TAP SAFE CELL' }}</div>
    <div class="grid">
      <button
        v-for="(isMine, i) in cells"
        :key="i"
        class="cell"
        :class="{
          mine: revealing && isMine,
          hidden: !revealing
        }"
        @pointerdown="(e) => handleCell(i, e)"
      >
        <span v-if="revealing && isMine" class="mine-icon">✕</span>
        <span v-else-if="!revealing" class="cell-icon">?</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.minefield-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.cell {
  width: 52px;
  height: 52px;
  border: 2px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px var(--px-green-glow);
}

.cell:active {
  transform: scale(0.9);
}

.cell.mine {
  border-color: var(--arc-danger);
  background: rgba(255, 50, 50, 0.15);
  box-shadow: 0 0 12px var(--arc-danger-glow);
}

.mine-icon {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  font-size: 24px;
}

.cell.hidden {
  border-color: var(--px-green-bright);
  background: var(--px-green-bg);
}

.cell-icon {
  color: var(--arc-muted);
  text-shadow: 0 0 4px var(--px-green-glow);
}
</style>

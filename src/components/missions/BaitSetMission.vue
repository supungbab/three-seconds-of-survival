<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const GRID = 3
const targetCell = ref({ r: 0, c: 0 })
const trailPath = ref<{ r: number; c: number }[]>([])
let resolved = false

onMounted(() => {
  const path: { r: number; c: number }[] = []
  let r = Math.floor(Math.random() * GRID)
  path.push({ r, c: 0 })
  for (let i = 1; i < GRID - 1; i++) {
    const dr = r > 0 && Math.random() < 0.5 ? -1 : (r < GRID - 1 ? 1 : -1)
    r = Math.max(0, Math.min(GRID - 1, r + (Math.random() < 0.5 ? dr : 0)))
    path.push({ r, c: i })
  }
  trailPath.value = path
  targetCell.value = { r: path[path.length - 1].r, c: GRID - 1 }
})

function isTrail(r: number, c: number) {
  return trailPath.value.some(p => p.r === r && p.c === c)
}

function handleTap(r: number, c: number, e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', r === targetCell.value.r && c === targetCell.value.c)
}
</script>

<template>
  <div class="bait-mission">
    <div class="bait-hint">{{ t('흔적 끝에 미끼를 놓으세요') }}</div>
    <div class="bait-grid">
      <template v-for="r in GRID" :key="'row'+r">
        <button
          v-for="c in GRID" :key="'cell'+r+c"
          class="bait-cell"
          :class="{ trail: isTrail(r - 1, c - 1) }"
          @pointerdown="(e) => handleTap(r - 1, c - 1, e)"
        >
          <span v-if="isTrail(r - 1, c - 1)" class="paw">*</span>
          <span v-else class="empty">·</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bait-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
}

.bait-hint {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.bait-grid {
  display: grid;
  grid-template-columns: repeat(3, 64px);
  gap: 6px;
}

.bait-cell {
  width: 64px;
  height: 64px;
  background: #0c140c;
  border: 2px solid #2a3a2a;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  color: var(--arc-muted);
}

.bait-cell.trail {
  border-color: var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
}

.bait-cell:active {
  transform: scale(0.9);
}

.paw { font-size: 20px; }
.empty { font-size: 28px; opacity: 0.3; }
</style>

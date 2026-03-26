<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const GRID = 4
const subPos = ref({ r: 0, c: 0 })
const pingPhase = ref(0)
const isPinging = ref(false)
let resolved = false
let animFrame: number | null = null

onMounted(() => {
  subPos.value = {
    r: Math.floor(Math.random() * GRID),
    c: Math.floor(Math.random() * GRID),
  }
  let start = 0
  function animate(time: number) {
    if (!start) start = time
    const cycle = ((time - start) / 1000) % 2
    isPinging.value = cycle < 1.2
    pingPhase.value = isPinging.value ? cycle / 1.2 : 0
    animFrame = requestAnimationFrame(animate)
  }
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
})

function getHeat(r: number, c: number) {
  const dist = Math.abs(r - subPos.value.r) + Math.abs(c - subPos.value.c)
  return Math.max(0, 3 - dist)
}

function handleTap(r: number, c: number, e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', r === subPos.value.r && c === subPos.value.c)
}
</script>

<template>
  <div class="sonar-mission">
    <div class="sonar-grid">
      <template v-for="r in GRID" :key="'row'+r">
        <button
          v-for="c in GRID" :key="'cell'+r+c"
          class="sonar-cell"
          :class="{ hot: isPinging && getHeat(r-1, c-1) > 0 }"
          @pointerdown="(e) => handleTap(r-1, c-1, e)"
        >
          <span
            class="dot"
            :class="isPinging ? 'h' + getHeat(r-1, c-1) : 'h0'"
          />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sonar-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
}

.sonar-grid {
  display: grid;
  grid-template-columns: repeat(4, 52px);
  gap: 4px;
}

.sonar-cell {
  width: 52px;
  height: 52px;
  background: #060a06;
  border: 1px solid #1a2a1a;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.sonar-cell.hot {
  border-color: var(--px-green-bright);
  background: rgba(140, 200, 144, 0.05);
}

.sonar-cell:active { transform: scale(0.9); }

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1a2a1a;
  transition: all 0.3s;
}

.dot.h0 { background: #1a2a1a; }
.dot.h1 { background: rgba(140, 200, 144, 0.3); box-shadow: 0 0 4px var(--px-green-glow); }
.dot.h2 { background: rgba(140, 200, 144, 0.55); box-shadow: 0 0 8px var(--px-green-glow); }
.dot.h3 { background: var(--px-green-bright); box-shadow: 0 0 16px var(--px-green-glow); }
</style>

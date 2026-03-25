<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { randomInt, shuffle } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Hole {
  id: number
  x: number
  patched: boolean
  visible: boolean
}

const holes = ref<Hole[]>([])
const totalHoles = ref(0)
const patchedCount = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
let resolved = false

onMounted(() => {
  const count = randomInt(2, 3)
  totalHoles.value = count

  const positions = [15, 35, 55, 75]
  const shuffled = shuffle(positions).slice(0, count)

  const holeList: Hole[] = shuffled.map((x, i) => ({
    id: i,
    x,
    patched: false,
    visible: false,
  }))

  holes.value = holeList

  holeList.forEach((_, i) => {
    timers.push(setTimeout(() => {
      holes.value[i].visible = true
    }, i * 400))
  })
})

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t))
})

function handleHoleTap(index: number, e: Event) {
  e.stopPropagation()
  const hole = holes.value[index]
  if (!hole.visible || hole.patched) return

  playTick()
  hole.patched = true
  patchedCount.value++

  if (patchedCount.value >= totalHoles.value) {
    if (resolved) return
    resolved = true
    emit('tap', true)
  }
}

function handleFenceTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  emit('tap', false)
}
</script>

<template>
  <div class="perimeter-mission">
    <div class="perimeter-label">{{ t('침입구 수리') }}</div>

    <div class="fence-area" @pointerdown="handleFenceTap">
      <!-- Fence lines -->
      <div class="fence-line top" />
      <div class="fence-line mid" />
      <div class="fence-line bot" />

      <!-- Fence posts -->
      <div
        v-for="p in [0, 25, 50, 75, 100]"
        :key="p"
        class="fence-post"
        :style="{ left: p + '%' }"
      />

      <!-- Holes -->
      <button
        v-for="(hole, i) in holes"
        :key="hole.id"
        class="breach-hole"
        :class="{ visible: hole.visible, patched: hole.patched }"
        :style="{ left: hole.x + '%' }"
        @pointerdown.stop="handleHoleTap(i, $event)"
      >
        <span v-if="!hole.patched" class="hole-icon">✕</span>
        <span v-else class="patch-icon">■</span>
      </button>
    </div>

    <div class="perimeter-status">
      {{ patchedCount }}/{{ totalHoles }} {{ t('밀봉됨') }}
    </div>
  </div>
</template>

<style scoped>
.perimeter-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.perimeter-label {
  font-size: 13px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 3px;
}

.fence-area {
  position: relative;
  width: 100%;
  max-width: 280px;
  height: 100px;
  cursor: pointer;
}

.fence-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.fence-line.top { top: 20px; }
.fence-line.mid { top: 50px; }
.fence-line.bot { top: 80px; }

.fence-post {
  position: absolute;
  top: 12px;
  width: 4px;
  height: 76px;
  background: var(--px-green-bright);
  box-shadow: 0 0 4px var(--px-green-glow);
  transform: translateX(-50%);
}

.breach-hole {
  position: absolute;
  top: 30px;
  width: 40px;
  height: 40px;
  transform: translateX(-50%);
  background: transparent;
  border: 3px solid transparent;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.breach-hole.visible {
  opacity: 1;
  border-color: var(--arc-danger);
  background: rgba(255, 59, 92, 0.1);
  box-shadow: 0 0 12px var(--arc-danger-glow);
  animation: pulse-breach 0.6s infinite alternate;
}

.breach-hole.patched {
  border-color: var(--px-green-bright);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 8px var(--px-green-glow);
  animation: none;
}

.hole-icon {
  font-size: 20px;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.patch-icon {
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.perimeter-status {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

@keyframes pulse-breach {
  from { box-shadow: 0 0 8px var(--arc-danger-glow); }
  to { box-shadow: 0 0 20px var(--arc-danger-glow); }
}
</style>

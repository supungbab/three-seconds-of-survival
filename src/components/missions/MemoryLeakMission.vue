<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Leak {
  id: number
  x: number
  patched: boolean
}

const memUsage = ref(30)
const leaks = ref<Leak[]>([])
let resolved = false
let raf = 0
let lastTime = 0
const FILL_RATE = 18 // percent per second
const MAX_MEM = 100

function generateLeaks() {
  const positions = [15, 45, 75]
  leaks.value = positions.map((x, i) => ({ id: i, x, patched: false }))
}

function animate(now: number) {
  if (resolved) return
  if (!lastTime) lastTime = now
  const dt = (now - lastTime) / 1000
  lastTime = now

  const activeLeaks = leaks.value.filter(l => !l.patched).length
  memUsage.value = Math.min(MAX_MEM, memUsage.value + dt * FILL_RATE * (activeLeaks / 3))

  if (memUsage.value >= MAX_MEM) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function handlePatch(index: number, e: PointerEvent) {
  e.stopPropagation()
  if (resolved || leaks.value[index].patched) return
  playTick()
  leaks.value[index].patched = true
  if (leaks.value.every(l => l.patched)) {
    resolved = true
    emit('tap', true)
  }
}

onMounted(() => {
  generateLeaks()
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="memory-leak-mission">
    <div class="mem-bar-container">
      <div class="mem-label">MEM</div>
      <div class="mem-bar">
        <div
          class="mem-fill"
          :class="{ critical: memUsage > 80 }"
          :style="{ width: `${memUsage}%` }"
        />
      </div>
      <div class="mem-val">{{ Math.round(memUsage) }}%</div>
    </div>

    <div class="leak-row">
      <div
        v-for="(leak, i) in leaks"
        :key="leak.id"
        class="leak-source"
        :class="{ patched: leak.patched }"
        @pointerdown="(e: PointerEvent) => handlePatch(i, e)"
      >
        <span v-if="!leak.patched" class="drip">💧</span>
        <span v-else class="patched-icon">✓</span>
        <span class="leak-label">{{ leak.patched ? t('수정됨') : t('누수') }}</span>
      </div>
    </div>
    <div class="hint">{{ t('누수를 탭하여 패치하세요') }}</div>
  </div>
</template>

<style scoped>
.memory-leak-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 200px;
}

.mem-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.mem-label {
  font-size: 12px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  min-width: 32px;
}

.mem-bar {
  flex: 1;
  height: 14px;
  border: 2px solid var(--px-green-bright);
  background: #0c140c;
  overflow: hidden;
  border-radius: 0;
}

.mem-fill {
  height: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
  transition: width 0.1s linear;
}

.mem-fill.critical {
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.mem-val {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-muted);
  min-width: 36px;
  text-align: right;
}

.leak-row {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.leak-source {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border: 2px solid var(--arc-danger);
  background: rgba(255, 59, 92, 0.05);
  cursor: pointer;
  border-radius: 0;
  transition: all 0.2s;
}

.leak-source.patched {
  border-color: var(--px-green-bright);
  background: rgba(140, 200, 144, 0.05);
  cursor: default;
}

.drip {
  font-size: 20px;
  animation: drip-anim 0.6s ease-in-out infinite alternate;
}

.patched-icon {
  font-size: 20px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.leak-label {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-muted);
}

.leak-source.patched .leak-label {
  color: var(--px-green-bright);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}

@keyframes drip-anim {
  from { transform: translateY(0); }
  to { transform: translateY(4px); }
}
</style>

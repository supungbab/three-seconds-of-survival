<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const indicatorPos = ref(0) // 0-100
const targetStart = ref(0)
const targetEnd = ref(0)
let raf = 0
let startTime = 0
let resolved = false
const TARGET_WIDTH = 20

onMounted(() => {
  const center = 25 + Math.random() * 50
  targetStart.value = center - TARGET_WIDTH / 2
  targetEnd.value = center + TARGET_WIDTH / 2
  startTime = performance.now()
  raf = requestAnimationFrame(animate)
})

function animate(now: number) {
  if (resolved) return
  const elapsed = (now - startTime) / 1000
  indicatorPos.value = 50 + Math.sin(elapsed * 1.8) * 48
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  const pos = indicatorPos.value
  if (pos >= targetStart.value && pos <= targetEnd.value) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="oxygen-mission" @pointerdown="handleTap">
    <div class="gas-labels">
      <span class="gas o2">O2</span>
      <span class="gas n2">N2</span>
    </div>
    <div class="slider-track">
      <div
        class="target-zone"
        :style="{ left: `${targetStart}%`, width: `${targetEnd - targetStart}%` }"
      />
      <div class="indicator" :style="{ left: `${indicatorPos}%` }" />
    </div>
    <div class="readout">
      O2: {{ indicatorPos.toFixed(0) }}% / N2: {{ (100 - indicatorPos).toFixed(0) }}%
    </div>
    <div class="hint">{{ t('탭하여 혼합 잠금') }}</div>
  </div>
</template>

<style scoped>
.oxygen-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 180px;
  cursor: pointer;
}

.gas-labels {
  display: flex;
  justify-content: space-between;
  width: 90%;
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
}

.gas.o2 { color: var(--px-green-bright); text-shadow: 0 0 8px var(--px-green-glow); }
.gas.n2 { color: var(--arc-muted); }

.slider-track {
  position: relative;
  width: 90%;
  height: 24px;
  background: #0c140c;
  border: 2px solid var(--px-green-bg);
}

.target-zone {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(140, 200, 144, 0.15);
  border-left: 2px solid var(--px-green-bright);
  border-right: 2px solid var(--px-green-bright);
}

.indicator {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 32px;
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
  transform: translateX(-50%);
}

.readout {
  font-size: 14px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
}
</style>

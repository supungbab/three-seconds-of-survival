<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false
let raf = 0
let startTime = 0
const ecgX = ref(0)
const peakActive = ref(false)
const CYCLE = 1.5 // seconds per heartbeat cycle
const PEAK_WINDOW = 0.15 // seconds tolerance
const ECG_WIDTH = 280

function animate(t: number) {
  if (!startTime) startTime = t
  const elapsed = (t - startTime) / 1000
  const phase = (elapsed % CYCLE) / CYCLE
  ecgX.value = phase * ECG_WIDTH
  // Peak occurs at phase ~0.5
  peakActive.value = Math.abs(phase - 0.5) < (PEAK_WINDOW / CYCLE)
  raf = requestAnimationFrame(animate)
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  cancelAnimationFrame(raf)
  emit('tap', peakActive.value)
}

// SVG ECG waveform path
const ecgPath = 'M0,30 L60,30 L70,30 L80,28 L90,32 L100,30 L120,30 L130,8 L140,52 L150,30 L160,30 L170,26 L180,30 L280,30'
</script>

<template>
  <div class="defib-mission" @pointerdown="handleTap">
    <div class="defib-header">{{ t('제세동') }}</div>
    <div class="ecg-viewport">
      <svg viewBox="0 0 280 60" class="ecg-svg" preserveAspectRatio="none">
        <path
          :d="ecgPath"
          fill="none"
          stroke="var(--arc-danger)"
          stroke-width="2"
          class="ecg-line"
        />
        <line
          :x1="ecgX" y1="0"
          :x2="ecgX" y2="60"
          stroke="var(--px-green-bright)"
          stroke-width="1.5"
          opacity="0.7"
        />
      </svg>
      <div class="heart-icon" :class="{ peak: peakActive }">&#9829;</div>
    </div>
    <div class="defib-hint">{{ t('맥박 피크에 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.defib-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  min-height: 180px;
  cursor: pointer;
}

.defib-header {
  font-size: 16px;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.ecg-viewport {
  width: 100%;
  max-width: 280px;
  height: 80px;
  background: #0a0606;
  border: 1px solid var(--arc-danger);
  border-radius: 0;
  position: relative;
  overflow: hidden;
}

.ecg-svg {
  width: 100%;
  height: 100%;
}

.ecg-line {
  filter: drop-shadow(0 0 4px var(--arc-danger-glow));
}

.heart-icon {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 18px;
  color: var(--arc-danger);
  opacity: 0.3;
  transition: transform 0.1s, opacity 0.1s;
}

.heart-icon.peak {
  opacity: 1;
  transform: scale(1.3);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.defib-hint {
  font-size: 12px;
  color: var(--arc-muted);
}
</style>

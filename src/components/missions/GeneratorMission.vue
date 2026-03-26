<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { randomInt } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const needleAngle = ref(0)
const zoneStart = ref(0)
const zoneEnd = ref(0)
let animFrame = 0
let startTime = 0

onMounted(() => {
  const center = randomInt(50, 130)
  const halfWidth = 20
  zoneStart.value = center - halfWidth
  zoneEnd.value = center + halfWidth

  startTime = performance.now()
  function animate() {
    const t = (performance.now() - startTime) / 1000
    const base = 90 + 70 * Math.sin(t * 2.3)
    const jitter = 15 * Math.sin(t * 7.1) + 10 * Math.cos(t * 11.3)
    needleAngle.value = Math.max(0, Math.min(180, base + jitter))
    animFrame = requestAnimationFrame(animate)
  }
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

function handleTap(e: Event) {
  e.stopPropagation()
  playTick()
  const angle = needleAngle.value
  emit('tap', angle >= zoneStart.value && angle <= zoneEnd.value)
}
</script>

<template>
  <div class="generator-mission">
    <div class="gauge-label">RPM {{ t('안정화') }}</div>

    <div class="gauge-container" @pointerdown="handleTap">
      <!-- Gauge arc background -->
      <svg class="gauge-svg" viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer arc -->
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#1a2a1a"
          stroke-width="16"
        />
        <!-- Safe zone arc -->
        <path
          :d="`M ${10 + 90 - 90 * Math.cos(zoneStart * Math.PI / 180)} ${100 - 90 * Math.sin(zoneStart * Math.PI / 180)} A 90 90 0 0 1 ${10 + 90 - 90 * Math.cos(zoneEnd * Math.PI / 180)} ${100 - 90 * Math.sin(zoneEnd * Math.PI / 180)}`"
          fill="none"
          stroke="var(--px-green-bright)"
          stroke-width="16"
          opacity="0.35"
        />
        <!-- Danger zone ticks -->
        <line x1="10" y1="100" x2="20" y2="100" stroke="var(--arc-danger)" stroke-width="2" />
        <line x1="190" y1="100" x2="180" y2="100" stroke="var(--arc-danger)" stroke-width="2" />
        <!-- Needle -->
        <line
          x1="100"
          y1="100"
          :x2="100 - 75 * Math.cos(needleAngle * Math.PI / 180)"
          :y2="100 - 75 * Math.sin(needleAngle * Math.PI / 180)"
          stroke="var(--px-green-bright)"
          stroke-width="3"
          stroke-linecap="square"
        />
        <!-- Needle hub -->
        <rect x="96" y="96" width="8" height="8" fill="var(--px-green-bright)" />
      </svg>
    </div>

    <div class="gauge-hint">{{ t('녹색 구간에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.generator-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
}

.gauge-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 3px;
}

.gauge-container {
  width: 200px;
  height: 110px;
  cursor: pointer;
  position: relative;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-hint {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

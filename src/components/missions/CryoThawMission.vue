<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const gaugePos = ref(50) // 0-100
const safeStart = ref(0)
const safeEnd = ref(0)
let raf = 0
let startTime = 0
let resolved = false
const SPEED = 120 // units per second
const SAFE_WIDTH = 18

onMounted(() => {
  const center = 30 + Math.random() * 40
  safeStart.value = center - SAFE_WIDTH / 2
  safeEnd.value = center + SAFE_WIDTH / 2
  startTime = performance.now()
  raf = requestAnimationFrame(animate)
})

function animate(now: number) {
  if (resolved) return
  const elapsed = (now - startTime) / 1000
  gaugePos.value = 50 + Math.sin(elapsed * SPEED * 0.05 * Math.PI) * 48
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  const pos = gaugePos.value
  if (pos >= safeStart.value && pos <= safeEnd.value) {
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
  <div class="cryo-mission" @pointerdown="handleTap">
    <div class="label">{{ t('냉동 해동 — 안전 구역에서 탭하세요') }}</div>
    <div class="gauge-track">
      <div
        class="safe-zone"
        :style="{ left: `${safeStart}%`, width: `${safeEnd - safeStart}%` }"
      />
      <div class="needle" :style="{ left: `${gaugePos}%` }" />
    </div>
    <div class="temp-readout">{{ gaugePos.toFixed(0) }}°K</div>
  </div>
</template>

<style scoped>
.cryo-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 180px;
  cursor: pointer;
}

.label {
  font-size: 14px;
  color: var(--arc-muted);
  text-transform: uppercase;
}

.gauge-track {
  position: relative;
  width: 90%;
  height: 32px;
  background: #0c140c;
  border: 2px solid var(--px-green-bg);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.safe-zone {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(140, 200, 144, 0.15);
  border-left: 2px solid var(--px-green-bright);
  border-right: 2px solid var(--px-green-bright);
  box-shadow: inset 0 0 8px var(--px-green-glow);
}

.needle {
  position: absolute;
  top: -4px;
  width: 3px;
  height: 40px;
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
  transform: translateX(-50%);
  transition: none;
}

.temp-readout {
  font-size: 20px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
}
</style>

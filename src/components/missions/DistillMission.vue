<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const temperature = ref(20)
const targetMin = 80
const targetMax = 90
const maxTemp = 110
let resolved = false
let raf = 0
let startTime = 0
const RISE_SPEED = 35 // degrees per second

function animate(now: number) {
  if (resolved) return
  if (!startTime) startTime = now
  const elapsed = (now - startTime) / 1000
  temperature.value = Math.min(maxTemp, 20 + elapsed * RISE_SPEED)
  if (temperature.value >= maxTemp) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  playTick()
  const t = temperature.value
  emit('tap', t >= targetMin && t <= targetMax)
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="distill-mission" @pointerdown="handleTap">
    <div class="thermometer">
      <div class="thermo-track">
        <div class="target-zone" :style="{
          bottom: `${(targetMin / maxTemp) * 100}%`,
          height: `${((targetMax - targetMin) / maxTemp) * 100}%`
        }" />
        <div class="mercury" :style="{ height: `${(temperature / maxTemp) * 100}%` }" />
      </div>
      <div class="thermo-bulb" />
      <div class="tick-labels">
        <span class="tick" :style="{ bottom: `${(targetMax / maxTemp) * 100}%` }">{{ targetMax }}°</span>
        <span class="tick" :style="{ bottom: `${(targetMin / maxTemp) * 100}%` }">{{ targetMin }}°</span>
      </div>
    </div>
    <div class="temp-readout">{{ Math.round(temperature) }}°C</div>
    <div class="hint">{{ t('구역 안에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.distill-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 200px;
  cursor: pointer;
}

.thermometer {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.thermo-track {
  position: relative;
  width: 28px;
  height: 140px;
  border: 2px solid var(--px-green-bright);
  background: #0c140c;
  overflow: hidden;
  border-radius: 0;
}

.target-zone {
  position: absolute;
  width: 100%;
  background: rgba(140, 200, 144, 0.15);
  border-top: 2px dashed var(--px-green-bright);
  border-bottom: 2px dashed var(--px-green-bright);
  z-index: 1;
}

.mercury {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
  transition: height 0.05s linear;
}

.thermo-bulb {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  background: var(--arc-danger);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.tick-labels {
  position: absolute;
  left: 38px;
  top: 0;
  bottom: 0;
}

.tick {
  position: absolute;
  font-size: 11px;
  font-family: monospace;
  color: var(--px-green-bright);
  white-space: nowrap;
  transform: translateY(50%);
}

.temp-readout {
  font-size: 22px;
  font-weight: 700;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}
</style>

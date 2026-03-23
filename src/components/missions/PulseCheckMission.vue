<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const isNormal = ref(true)
const waveformBars = ref<number[]>([])

function generateNormalWaveform(): number[] {
  const bars: number[] = []
  for (let i = 0; i < 24; i++) {
    const phase = (i % 8) / 8
    if (phase < 0.1) bars.push(20)
    else if (phase < 0.2) bars.push(60)
    else if (phase < 0.25) bars.push(95)
    else if (phase < 0.35) bars.push(30)
    else if (phase < 0.4) bars.push(10)
    else if (phase < 0.5) bars.push(40)
    else bars.push(20)
  }
  return bars
}

function generateAbnormalWaveform(): number[] {
  const bars: number[] = []
  const type = Math.random()
  for (let i = 0; i < 24; i++) {
    if (type < 0.5) {
      // Flatline
      bars.push(15 + Math.random() * 5)
    } else {
      // Erratic
      bars.push(10 + Math.random() * 85)
    }
  }
  return bars
}

onMounted(() => {
  isNormal.value = Math.random() > 0.5
  waveformBars.value = isNormal.value ? generateNormalWaveform() : generateAbnormalWaveform()
})

function handleDiagnosis(e: Event, diagnosisNormal: boolean) {
  e.stopPropagation()
  playTick()
  emit('tap', diagnosisNormal === isNormal.value)
}
</script>

<template>
  <div class="pulse-check-mission">
    <div class="ecg-header">{{ t('[ 생체 신호 ]') }}</div>
    <div class="ecg-monitor">
      <div class="ecg-waveform">
        <div
          v-for="(h, i) in waveformBars"
          :key="i"
          class="ecg-bar"
          :style="{
            height: `${h}%`,
            animationDelay: `${i * 0.08}s`,
          }"
        />
      </div>
      <div class="ecg-scanline" />
    </div>
    <div class="diagnosis-buttons">
      <button class="diag-btn normal" @pointerdown="(e) => handleDiagnosis(e, true)">
        {{ t('정상') }}
      </button>
      <button class="diag-btn abnormal" @pointerdown="(e) => handleDiagnosis(e, false)">
        {{ t('비정상') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pulse-check-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.ecg-header {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.ecg-monitor {
  position: relative;
  width: 260px;
  height: 80px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
  overflow: hidden;
  padding: 4px;
}

.ecg-waveform {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 100%;
  width: 100%;
}

.ecg-bar {
  flex: 1;
  background: var(--px-green-bright);
  border-radius: 0;
  min-height: 2px;
  box-shadow: 0 0 4px var(--px-green-glow);
  animation: bar-pulse 2s ease-in-out infinite;
}

.ecg-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--px-green-bright);
  opacity: 0.4;
  animation: scan-sweep 2s linear infinite;
}

.diagnosis-buttons {
  display: flex;
  gap: 12px;
}

.diag-btn {
  font-family: monospace;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 0;
  cursor: pointer;
  letter-spacing: 1px;
  font-weight: 700;
}

.diag-btn.normal {
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  border: 2px solid var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.diag-btn.abnormal {
  background: var(--px-green-bg);
  color: var(--arc-danger);
  border: 2px solid var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.diag-btn:active {
  transform: scale(0.93);
}

@keyframes bar-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes scan-sweep {
  from { left: 0; }
  to { left: 100%; }
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentRpm = ref(0)
const targetRpm = ref(500)
const rotation = ref(0)
const stopped = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null
let animId: number | null = null

onMounted(() => {
  const targets = [300, 400, 500, 600, 700, 800]
  targetRpm.value = targets[Math.floor(Math.random() * targets.length)]

  intervalId = setInterval(() => {
    if (stopped.value) return
    currentRpm.value = Math.min(currentRpm.value + 50, 1200)
  }, 150)

  function spin() {
    if (!stopped.value) {
      rotation.value += currentRpm.value * 0.02
    }
    animId = requestAnimationFrame(spin)
  }
  animId = requestAnimationFrame(spin)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (animId) cancelAnimationFrame(animId)
})

function handleStop(e: Event) {
  e.stopPropagation()
  if (stopped.value) return
  stopped.value = true
  playTick()
  const diff = Math.abs(currentRpm.value - targetRpm.value)
  emit('tap', diff <= 50)
}
</script>

<template>
  <div class="centrifuge-mission">
    <div class="target-label">{{ t('목표') }}: {{ targetRpm }} RPM</div>
    <div class="disc-container">
      <div class="disc" :style="{ transform: `rotate(${rotation}deg)` }">
        <span class="disc-mark">|</span>
        <span class="disc-mark second">|</span>
      </div>
    </div>
    <div class="rpm-display">
      <span class="rpm-value" :class="{ danger: currentRpm > 1000 }">{{ currentRpm }}</span>
      <span class="rpm-unit">RPM</span>
    </div>
    <button
      class="stop-btn"
      :disabled="stopped"
      @pointerdown="handleStop"
    >{{ t('정지') }}</button>
  </div>
</template>

<style scoped>
.centrifuge-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.target-label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.disc-container {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--px-green-bright);
  box-shadow: 0 0 16px var(--px-green-glow);
  background: var(--px-green-bg);
}

.disc {
  width: 70px;
  height: 70px;
  border: 2px solid var(--px-green-bright);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disc-mark {
  position: absolute;
  top: 2px;
  font-family: monospace;
  font-size: 18px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.disc-mark.second {
  top: auto;
  bottom: 2px;
  transform: rotate(180deg);
}

.rpm-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: monospace;
}

.rpm-value {
  font-size: 36px;
  font-weight: 900;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.rpm-value.danger {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.rpm-unit {
  font-size: 14px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.stop-btn {
  font-family: monospace;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 32px;
  border: 3px solid var(--arc-danger);
  background: var(--px-green-bg);
  color: var(--arc-danger);
  cursor: pointer;
  text-shadow: 0 0 8px var(--arc-danger-glow);
  box-shadow: 0 0 12px var(--arc-danger-glow);
  letter-spacing: 3px;
}

.stop-btn:active {
  transform: scale(0.92);
}

.stop-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>

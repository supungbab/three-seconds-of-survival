<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentValue = ref(999)
const safeThreshold = 100
const tapped = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    if (tapped.value) return
    currentValue.value = Math.max(0, Math.floor(currentValue.value * 0.88))
  }, 200)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function handleTap(e: Event) {
  e.stopPropagation()
  if (tapped.value) return
  tapped.value = true
  playTick()
  emit('tap', currentValue.value <= safeThreshold)
}

function barPercent(): number {
  return Math.min(100, (currentValue.value / 999) * 100)
}
</script>

<template>
  <div class="isotope-mission" @pointerdown="handleTap">
    <div class="label">RADIATION DECAY</div>
    <div class="gauge-container">
      <div class="gauge-bar">
        <div
          class="gauge-fill"
          :class="{ safe: currentValue <= safeThreshold }"
          :style="{ height: `${barPercent()}%` }"
        ></div>
        <div class="safe-line" :style="{ bottom: `${(safeThreshold / 999) * 100}%` }">
          <span class="safe-label">SAFE</span>
        </div>
      </div>
      <div class="value-display">
        <span class="value" :class="{ safe: currentValue <= safeThreshold }">{{ currentValue }}</span>
        <span class="unit">mSv</span>
      </div>
    </div>
    <div class="hint">TAP WHEN SAFE</div>
  </div>
</template>

<style scoped>
.isotope-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  cursor: pointer;
}

.label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.gauge-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gauge-bar {
  width: 40px;
  height: 140px;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 12px var(--px-green-glow);
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--arc-danger);
  box-shadow: 0 0 12px var(--arc-danger-glow);
  transition: height 0.2s linear;
}

.gauge-fill.safe {
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.safe-line {
  position: absolute;
  left: -4px;
  right: -4px;
  height: 2px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  z-index: 2;
}

.safe-label {
  position: absolute;
  right: -42px;
  top: -8px;
  font-family: monospace;
  font-size: 10px;
  color: var(--px-green-bright);
  letter-spacing: 2px;
  text-shadow: 0 0 6px var(--px-green-glow);
}

.value-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-family: monospace;
}

.value {
  font-size: 36px;
  font-weight: 900;
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.value.safe {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.unit {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.hint {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: blink-hint 1s ease-in-out infinite alternate;
}

@keyframes blink-hint {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>

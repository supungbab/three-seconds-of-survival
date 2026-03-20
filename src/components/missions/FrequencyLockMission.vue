<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const freq1 = ref(50)
const freq2 = ref(50)
const targetFreq = ref(50)
let resolved = false
let animFrame: number | null = null
let startTime = 0

onMounted(() => {
  targetFreq.value = 30 + Math.floor(Math.random() * 40)
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
})

function animate(time: number) {
  if (!startTime) startTime = time
  const t = (time - startTime) / 1000
  freq1.value = targetFreq.value + Math.sin(t * 2.3) * 30 + Math.sin(t * 0.7) * 15
  freq2.value = targetFreq.value + Math.cos(t * 1.8) * 25 + Math.cos(t * 1.1) * 12
  animFrame = requestAnimationFrame(animate)
}

function handleLock(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  const diff = Math.abs(freq1.value - freq2.value)
  emit('tap', diff < 10)
}
</script>

<template>
  <div class="freqlock-mission">
    <div class="freq-display">
      <div class="freq-channel">
        <div class="freq-label">CH-A</div>
        <div class="freq-bar-track">
          <div class="freq-bar-fill" :style="{ width: freq1 + '%' }" />
        </div>
        <div class="freq-value">{{ freq1.toFixed(0) }} MHz</div>
      </div>
      <div class="freq-channel">
        <div class="freq-label">CH-B</div>
        <div class="freq-bar-track">
          <div class="freq-bar-fill ch-b" :style="{ width: freq2 + '%' }" />
        </div>
        <div class="freq-value">{{ freq2.toFixed(0) }} MHz</div>
      </div>
    </div>

    <div class="freq-diff" :class="{ close: Math.abs(freq1 - freq2) < 10 }">
      Δ {{ Math.abs(freq1 - freq2).toFixed(0) }}
    </div>

    <button class="lock-btn" @pointerdown="handleLock">
      LOCK
    </button>
  </div>
</template>

<style scoped>
.freqlock-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
}

.freq-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 260px;
}

.freq-channel {
  display: flex;
  align-items: center;
  gap: 8px;
}

.freq-label {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  min-width: 36px;
}

.freq-bar-track {
  flex: 1;
  height: 12px;
  background: #0c140c;
  border: 1px solid #2a3a2a;
  position: relative;
  overflow: hidden;
}

.freq-bar-fill {
  height: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  transition: width 0.05s linear;
}

.freq-bar-fill.ch-b {
  background: #ff9944;
  box-shadow: 0 0 8px rgba(255, 153, 68, 0.5);
}

.freq-value {
  font-size: 11px;
  font-family: monospace;
  color: var(--px-green-bright);
  min-width: 56px;
  text-align: right;
}

.freq-diff {
  font-size: 20px;
  font-family: monospace;
  font-weight: 900;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  transition: all 0.15s;
}

.freq-diff.close {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.lock-btn {
  padding: 12px 32px;
  font-size: 18px;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 4px;
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  cursor: pointer;
  box-shadow:
    inset 1px 1px 0 var(--px-green-bevel-light, #5a6858),
    inset -1px -1px 0 var(--px-green-bevel-dark, #2a322a);
}

.lock-btn:active {
  transform: scale(0.95);
}
</style>

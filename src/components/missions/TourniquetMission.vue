<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const REQUIRED_TAPS = 6
const tapCount = ref(0)
const progress = ref(0)
let resolved = false

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  tapCount.value++
  progress.value = Math.min(1, tapCount.value / REQUIRED_TAPS)
  playTick()
  if (tapCount.value >= REQUIRED_TAPS) {
    resolved = true
    emit('tap', true)
  }
}

const circumference = 2 * Math.PI * 44
</script>

<template>
  <div class="tourniquet-mission" @pointerdown="handleTap">
    <div class="tq-header">APPLY TOURNIQUET</div>
    <div class="ring-container">
      <svg viewBox="0 0 100 100" class="ring-svg">
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="#2a0a0a"
          stroke-width="6"
        />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="#ff3b5c"
          stroke-width="6"
          stroke-linecap="butt"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference * (1 - progress)"
          class="progress-ring"
        />
      </svg>
      <div class="ring-center">
        <div class="tap-count">{{ tapCount }}/{{ REQUIRED_TAPS }}</div>
      </div>
    </div>
    <div class="tq-hint">TAP RAPIDLY</div>
  </div>
</template>

<style scoped>
.tourniquet-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
  cursor: pointer;
}

.tq-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.ring-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring {
  transition: stroke-dashoffset 0.15s ease-out;
  filter: drop-shadow(0 0 6px #ff3b5c);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tap-count {
  font-size: 20px;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.tq-hint {
  font-size: 12px;
  color: var(--arc-muted);
  animation: hint-pulse 0.6s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>

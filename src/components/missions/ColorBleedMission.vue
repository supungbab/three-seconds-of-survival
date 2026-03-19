<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const step = ref(0)
const channels = ['R', 'G', 'B'] as const
const failed = ref(false)

function handleChannel(e: Event, channel: 'R' | 'G' | 'B') {
  e.stopPropagation()
  if (failed.value) return

  const expected = channels[step.value]
  if (channel === expected) {
    playTick()
    step.value++
    if (step.value >= 3) {
      emit('tap', true)
    }
  } else {
    failed.value = true
    playTick()
    emit('tap', false)
  }
}
</script>

<template>
  <div class="color-bleed-mission">
    <div class="hint-label">ALIGN CHANNELS: R &rarr; G &rarr; B</div>
    <div class="rgb-display">
      <span
        class="channel channel-r"
        :class="{ aligned: step > 0 }"
      >R</span>
      <span
        class="channel channel-g"
        :class="{ aligned: step > 1 }"
      >G</span>
      <span
        class="channel channel-b"
        :class="{ aligned: step > 2 }"
      >B</span>
    </div>
    <div class="button-row">
      <button
        v-for="ch in channels"
        :key="ch"
        class="channel-btn"
        :class="[
          `btn-${ch.toLowerCase()}`,
          { done: (ch === 'R' && step > 0) || (ch === 'G' && step > 1) || (ch === 'B' && step > 2) }
        ]"
        @pointerdown.stop="(e: Event) => handleChannel(e, ch)"
      >
        {{ ch }}
      </button>
    </div>
    <div class="step-indicator">
      {{ step }}/3 ALIGNED
    </div>
  </div>
</template>

<style scoped>
.color-bleed-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.hint-label {
  font-family: monospace;
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.rgb-display {
  position: relative;
  width: 160px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
}

.channel {
  position: absolute;
  font-family: monospace;
  font-size: 40px;
  font-weight: bold;
  transition: transform 0.3s, opacity 0.3s;
}

.channel-r {
  color: #ff4444;
  transform: translate(-12px, -4px);
  opacity: 0.6;
  mix-blend-mode: screen;
}

.channel-r.aligned {
  transform: translate(0, 0);
  opacity: 1;
}

.channel-g {
  color: #44ff44;
  transform: translate(4px, 6px);
  opacity: 0.6;
  mix-blend-mode: screen;
}

.channel-g.aligned {
  transform: translate(0, 0);
  opacity: 1;
}

.channel-b {
  color: #4444ff;
  transform: translate(8px, -2px);
  opacity: 0.6;
  mix-blend-mode: screen;
}

.channel-b.aligned {
  transform: translate(0, 0);
  opacity: 1;
}

.button-row {
  display: flex;
  gap: 12px;
}

.channel-btn {
  width: 56px;
  height: 44px;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  border: 2px solid;
  border-radius: 0;
  background: var(--px-green-bg);
  cursor: pointer;
}

.channel-btn:active {
  transform: scale(0.9);
}

.btn-r {
  color: #ff4444;
  border-color: #ff4444;
}

.btn-g {
  color: #44ff44;
  border-color: #44ff44;
}

.btn-b {
  color: #4444ff;
  border-color: #4444ff;
}

.channel-btn.done {
  opacity: 0.3;
  border-style: dashed;
}

.step-indicator {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}
</style>

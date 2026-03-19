<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentStep = ref(0)
const boltStates = ref<('idle' | 'done' | 'wrong')[]>(['idle', 'idle', 'idle', 'idle'])

const BOLT_LABELS = ['1', '2', '3', '4']

function handleBolt(index: number, e: Event) {
  e.stopPropagation()
  if (boltStates.value[index] === 'done') return

  playTick()

  if (index === currentStep.value) {
    boltStates.value[index] = 'done'
    currentStep.value++
    if (currentStep.value >= 4) {
      emit('tap', true)
    }
  } else {
    boltStates.value[index] = 'wrong'
    emit('tap', false)
  }
}
</script>

<template>
  <div class="hatch-seal-mission">
    <div class="hatch-label">SEAL HATCH ▸ CLOCKWISE</div>

    <div class="bolt-grid">
      <button
        v-for="(state, i) in boltStates"
        :key="i"
        class="bolt-btn"
        :class="state"
        @pointerdown="handleBolt(i, $event)"
      >
        <span class="bolt-icon">⬡</span>
        <span class="bolt-num">{{ BOLT_LABELS[i] }}</span>
      </button>
    </div>

    <div class="hatch-progress">
      <span
        v-for="n in 4"
        :key="n"
        class="step-dot"
        :class="{ active: n - 1 < currentStep }"
      >■</span>
    </div>
  </div>
</template>

<style scoped>
.hatch-seal-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.hatch-label {
  font-size: 13px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.bolt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.bolt-btn {
  width: 72px;
  height: 72px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.12s;
  box-shadow: 0 0 6px var(--px-green-glow);
}

.bolt-icon {
  font-size: 24px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.bolt-num {
  font-size: 14px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-muted);
}

.bolt-btn.done {
  background: rgba(140, 200, 144, 0.15);
  border-color: var(--px-green-bright);
  box-shadow: 0 0 16px var(--px-green-glow);
  opacity: 0.5;
}

.bolt-btn.done .bolt-icon {
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
}

.bolt-btn.done .bolt-num {
  color: var(--px-green-bright);
}

.bolt-btn.wrong {
  border-color: var(--arc-danger);
  box-shadow: 0 0 16px var(--arc-danger-glow);
}

.bolt-btn.wrong .bolt-icon {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.bolt-btn.wrong .bolt-num {
  color: var(--arc-danger);
}

.bolt-btn:active {
  transform: scale(0.9);
}

.hatch-progress {
  display: flex;
  gap: 8px;
}

.step-dot {
  font-size: 14px;
  font-family: monospace;
  color: #1a2a1a;
  transition: color 0.15s;
}

.step-dot.active {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}
</style>

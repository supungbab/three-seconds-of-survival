<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  biosCode: number[]
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentStep = ref(0)

function handleBtnTap(e: Event, num: number) {
  e.stopPropagation()
  playTick()
  if (num === props.biosCode[currentStep.value]) {
    currentStep.value++
    if (currentStep.value >= props.biosCode.length) {
      emit('tap', true)
    }
  } else {
    emit('tap', false)
  }
}
</script>

<template>
  <div class="bios-error-mission">
    <div class="bios-header">{{ t('BIOS 오류') }}</div>
    <div class="bios-progress">
      <span
        v-for="(code, i) in biosCode"
        :key="i"
        class="progress-step"
        :class="{ done: i < currentStep, active: i === currentStep }"
      >
        {{ code }}
      </span>
    </div>
    <div class="bios-buttons">
      <button
        v-for="n in 4"
        :key="n"
        class="bios-btn"
        @pointerdown="(e) => handleBtnTap(e, n - 1)"
      >
        {{ n - 1 }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bios-error-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.bios-header {
  font-size: 20px;
  font-weight: 700;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
  letter-spacing: 3px;
}

.bios-progress {
  display: flex;
  gap: 10px;
  font-family: monospace;
  font-size: 18px;
}

.progress-step {
  color: var(--arc-muted);
  transition: all 0.15s;
}

.progress-step.done {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  opacity: 0.4;
}

.progress-step.active {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.bios-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
}

.bios-btn {
  width: 64px;
  height: 64px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 24px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
  transition: all 0.1s;
}

.bios-btn:active {
  transform: scale(0.9);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 20px var(--px-green-glow);
}
</style>

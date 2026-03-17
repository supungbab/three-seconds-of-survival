<script setup lang="ts">
import type { SequenceStep } from '@/types/game'

defineProps<{
  steps: SequenceStep[]
  currentStep: number
}>()

const STEP_ICONS: Record<string, string> = {
  TAP: '👆',
  UP: '⬆️',
  DOWN: '⬇️',
  LEFT: '⬅️',
  RIGHT: '➡️',
}

function getIcon(step: SequenceStep): string {
  if (step.action === 'TAP') return STEP_ICONS.TAP
  return STEP_ICONS[step.direction]
}
</script>

<template>
  <div class="sequence-mission">
    <div class="steps">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step"
        :class="{ done: i < currentStep, active: i === currentStep }"
      >
        <span class="step-icon">{{ getIcon(step) }}</span>
      </div>
    </div>
    <div class="sequence-hint">순서대로!</div>
  </div>
</template>

<style scoped>
.sequence-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.steps {
  display: flex;
  gap: 16px;
  align-items: center;
}

.step {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 3px solid var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: all 0.2s;
}

.step.done {
  border-color: var(--success);
  background: rgba(0, 230, 118, 0.15);
  opacity: 0.6;
}

.step.active {
  border-color: var(--accent);
  animation: pulse 0.8s ease-in-out infinite;
}

.step-icon {
  line-height: 1;
}

.sequence-hint {
  font-size: 16px;
  color: var(--muted);
}
</style>

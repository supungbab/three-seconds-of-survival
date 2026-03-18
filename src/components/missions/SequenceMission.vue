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
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid var(--arc-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: all 0.2s;
}

.step.done {
  border-color: var(--arc-green);
  background: rgba(57, 255, 20, 0.08);
  opacity: 0.5;
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.15);
}

.step.active {
  border-color: var(--arc-amber);
  animation: pulse 0.8s ease-in-out infinite;
  box-shadow: 0 0 16px var(--arc-amber-glow);
}

.step-icon {
  line-height: 1;
}

.sequence-hint {
  font-size: 16px;
  color: var(--arc-muted);
}
</style>

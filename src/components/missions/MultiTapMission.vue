<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tapCount: number
  currentTaps: number
}>()

const progressPercent = computed(() =>
  Math.min(100, (props.currentTaps / props.tapCount) * 100),
)
</script>

<template>
  <div class="multi-tap-mission">
    <div class="tap-counter">
      <span class="current">{{ currentTaps }}</span>
      <span class="separator">/</span>
      <span class="target">{{ tapCount }}</span>
    </div>
    <div class="tap-progress-bar">
      <div class="tap-progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="tap-hint">연타!</div>
  </div>
</template>

<style scoped>
.multi-tap-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.tap-counter {
  font-size: 48px;
  font-weight: 900;
}

.current {
  color: var(--arc-green);
  text-shadow: 0 0 12px var(--arc-green-glow);
}

.separator {
  color: var(--arc-muted);
  margin: 0 4px;
}

.target {
  color: var(--arc-muted);
}

.tap-progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.tap-progress-fill {
  height: 100%;
  background: var(--arc-green);
  border-radius: 4px;
  transition: width 0.05s linear;
  box-shadow: 0 0 8px var(--arc-green-glow);
}

.tap-hint {
  font-size: 16px;
  color: var(--arc-muted);
}
</style>

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
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
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
  background: #0c140c;
  border-radius: 0;
  overflow: hidden;
  border: 2px solid #3a4a38;
  box-shadow:
    0 0 0 2px #111311,
    inset 1px 1px 0 #2a322a;
}

.tap-progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  border-radius: 0;
  transition: width 0.05s linear;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.tap-hint {
  font-size: 16px;
  color: var(--arc-muted);
}
</style>

<script setup lang="ts">
defineProps<{
  progress: number
  active: boolean
}>()
</script>

<template>
  <div class="timer-bar-container">
    <div
      class="timer-bar-fill"
      :class="{ urgent: progress < 0.3, active }"
      :style="{ width: `${progress * 100}%` }"
    />
  </div>
</template>

<style scoped>
.timer-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.timer-bar-fill {
  height: 100%;
  background: var(--arc-green);
  border-radius: 3px;
  transition: none;
  will-change: width;
}

.timer-bar-fill.active {
  box-shadow:
    0 0 8px var(--arc-green-glow),
    0 0 20px rgba(57, 255, 20, 0.15);
}

.timer-bar-fill.urgent {
  background: var(--arc-danger);
  box-shadow:
    0 0 8px var(--arc-danger-glow),
    0 0 20px rgba(255, 59, 92, 0.2);
}
</style>

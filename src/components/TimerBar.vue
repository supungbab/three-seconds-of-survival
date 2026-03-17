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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: none;
  will-change: width;
}

.timer-bar-fill.active {
  box-shadow: 0 0 10px var(--accent-dim);
}

.timer-bar-fill.urgent {
  background: var(--danger);
  box-shadow: 0 0 10px rgba(255, 59, 92, 0.5);
}
</style>

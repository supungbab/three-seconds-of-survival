<script setup lang="ts">
defineProps<{
  balance: number
}>()
</script>

<template>
  <div class="volt-display">
    <span class="volt-icon">⚡</span>
    <span class="volt-value">{{ balance }}</span>
    <span class="volt-label">VOLT</span>
  </div>
</template>

<style scoped>
.volt-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.volt-icon {
  font-size: 12px;
}

.volt-value {
  font-size: 14px;
  font-weight: 900;
  color: var(--arc-amber);
  text-shadow: 0 0 8px var(--arc-amber-glow);
}

.volt-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--arc-amber);
  opacity: 0.6;
  letter-spacing: 1px;
}
</style>

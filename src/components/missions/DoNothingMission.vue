<script setup lang="ts">
</script>

<template>
  <div class="do-nothing-mission">
    <div class="warning-icon">⚠️</div>
    <div class="warning-text">참아!</div>
  </div>
</template>

<style scoped>
.do-nothing-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.warning-icon {
  font-size: 64px;
  animation: pulse-warning 0.6s ease-in-out infinite;
}

.warning-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--arc-danger);
  animation: pulse-warning 0.6s ease-in-out infinite;
  text-shadow: 0 0 16px var(--arc-danger-glow);
}

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}
</style>

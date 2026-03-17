<script setup lang="ts">
</script>

<template>
  <div class="dual-tap-mission">
    <div class="dual-targets">
      <div class="dual-circle left">
        <span>👈</span>
      </div>
      <div class="dual-circle right">
        <span>👉</span>
      </div>
    </div>
    <div class="dual-hint">두 손가락으로 동시에!</div>
  </div>
</template>

<style scoped>
.dual-tap-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.dual-targets {
  display: flex;
  gap: 48px;
}

.dual-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 3px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  animation: pulse 1s ease-in-out infinite;
}

.dual-circle.right {
  animation-delay: 0.5s;
}

.dual-hint {
  font-size: 16px;
  color: var(--muted);
}
</style>

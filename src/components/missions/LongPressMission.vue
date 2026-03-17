<script setup lang="ts">
defineProps<{
  isPressed: boolean
}>()
</script>

<template>
  <div class="long-press-mission">
    <div class="press-circle" :class="{ pressing: isPressed }">
      <div class="press-inner">
        <span class="press-icon">👇</span>
      </div>
    </div>
    <div class="press-hint">1초 이상 누르세요</div>
  </div>
</template>

<style scoped>
.long-press-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.press-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 3px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.press-circle.pressing {
  transform: scale(0.9);
  box-shadow: 0 0 40px var(--accent-dim);
  border-color: var(--success);
}

.press-inner {
  font-size: 48px;
  line-height: 1;
}

.press-icon {
  display: block;
}

.press-hint {
  font-size: 16px;
  color: var(--muted);
}
</style>

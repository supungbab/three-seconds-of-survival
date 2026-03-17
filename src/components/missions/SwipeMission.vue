<script setup lang="ts">
import type { SwipeDirection } from '@/types/game'

defineProps<{
  direction: SwipeDirection
  reverse?: boolean
}>()

const ARROWS: Record<SwipeDirection, string> = {
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
}
</script>

<template>
  <div class="swipe-mission">
    <div class="arrow-display" :class="{ reverse }">
      {{ ARROWS[direction] }}
    </div>
    <div v-if="reverse" class="reverse-label">반대로!</div>
  </div>
</template>

<style scoped>
.swipe-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.arrow-display {
  font-size: 96px;
  line-height: 1;
  color: var(--accent);
  text-shadow: 0 0 40px var(--accent-dim);
}

.arrow-display.reverse {
  color: var(--danger);
  text-shadow: 0 0 40px rgba(255, 59, 92, 0.4);
}

.reverse-label {
  font-size: 20px;
  color: var(--danger);
  font-weight: 700;
  margin-top: 8px;
}
</style>

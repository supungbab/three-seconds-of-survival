<script setup lang="ts">
import type { MissionColor } from '@/types/game'

const props = defineProps<{
  targetColor: MissionColor
  colors: MissionColor[]
  negative?: boolean
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const COLOR_MAP: Record<MissionColor, string> = {
  red: 'var(--color-red)',
  blue: 'var(--color-blue)',
  yellow: 'var(--color-yellow)',
  green: 'var(--color-green)',
  purple: 'var(--color-purple)',
}

function handleTap(color: MissionColor) {
  const correct = props.negative
    ? color !== props.targetColor
    : color === props.targetColor
  emit('tap', correct)
}
</script>

<template>
  <div class="color-tap-mission">
    <div class="color-circles">
      <button
        v-for="(color, i) in colors"
        :key="i"
        class="color-circle"
        :style="{ backgroundColor: COLOR_MAP[color] }"
        @pointerdown="handleTap(color)"
      />
    </div>
  </div>
</template>

<style scoped>
.color-tap-mission {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.color-circles {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: transform 0.1s;
}

.color-circle:active {
  transform: scale(0.9);
}
</style>

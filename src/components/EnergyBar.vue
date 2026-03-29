<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  energy: number
  maxEnergy: number
  timeToNext: number
}>()

const percent = computed(() => Math.min(100, (props.energy / props.maxEnergy) * 100))
const isOverCap = computed(() => props.energy > props.maxEnergy)

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<template>
  <div class="energy-bar">
    <div class="energy-label">
      <span class="energy-icon">⚡</span>
      <span class="energy-text" :class="{ 'over-cap': isOverCap }">
        {{ energy }}/{{ maxEnergy }}
      </span>
    </div>
    <div class="energy-track">
      <div class="energy-fill" :style="{ width: percent + '%' }" />
    </div>
    <div v-if="energy < maxEnergy && !isOverCap" class="energy-timer">
      {{ formatTime(timeToNext) }}
    </div>
    <div v-else-if="isOverCap" class="energy-timer over">
      OVER
    </div>
  </div>
</template>

<style scoped>
.energy-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.energy-label {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.energy-icon {
  font-size: 14px;
}

.energy-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--px-green);
  letter-spacing: 1px;
}

.energy-text.over-cap {
  color: var(--arc-amber);
}

.energy-track {
  flex: 1;
  height: 6px;
  background: #1a1a1c;
  border: 1px solid #2a2a28;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: var(--px-green);
  box-shadow: 0 0 6px var(--px-green-glow);
  transition: width 0.3s ease;
}

.energy-timer {
  font-size: 11px;
  color: var(--arc-muted);
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}

.energy-timer.over {
  color: var(--arc-amber);
  font-weight: 700;
}
</style>

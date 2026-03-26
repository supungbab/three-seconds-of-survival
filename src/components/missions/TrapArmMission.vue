<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentStep = ref(0)
const TOTAL = 3
let resolved = false

const points = [
  { x: 20, y: 30 },
  { x: 50, y: 70 },
  { x: 80, y: 25 },
]

function handleTap(index: number, e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  if (index === currentStep.value) {
    currentStep.value++
    playTick()
    if (currentStep.value >= TOTAL) {
      resolved = true
      emit('tap', true)
    }
  } else {
    resolved = true
    emit('tap', false)
  }
}
</script>

<template>
  <div class="trap-mission">
    <div class="label">{{ t('트랩 설치: 1 → 2 → 3 탭') }}</div>
    <div class="field">
      <svg class="wire-lines" viewBox="0 0 100 100">
        <line
          v-for="i in Math.max(0, currentStep - 1)"
          :key="i"
          :x1="points[i].x" :y1="points[i].y"
          :x2="points[i + 1].x" :y2="points[i + 1].y"
          stroke="var(--px-green-bright)"
          stroke-width="1.5"
          stroke-dasharray="3 2"
          opacity="0.7"
        />
      </svg>
      <button
        v-for="(pt, i) in points"
        :key="i"
        class="node"
        :class="{
          done: i < currentStep,
          active: i === currentStep,
        }"
        :style="{ left: `${pt.x}%`, top: `${pt.y}%` }"
        @pointerdown="handleTap(i, $event)"
      >
        {{ i + 1 }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.trap-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  gap: 10px;
  min-height: 180px;
}

.label {
  font-size: 14px;
  color: var(--arc-muted);
}

.field {
  position: relative;
  width: 100%;
  height: 140px;
  background: #060e06;
  border: 2px solid var(--px-green-bg);
}

.wire-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.node {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  border: 2px solid var(--arc-muted);
  background: #0c140c;
  color: var(--arc-muted);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}

.node.active {
  border-color: var(--px-green-bright);
  color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
  animation: pulse-node 0.8s ease infinite;
}

.node.done {
  border-color: var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

@keyframes pulse-node {
  0%, 100% { box-shadow: 0 0 8px var(--px-green-glow); }
  50% { box-shadow: 0 0 20px var(--px-green-glow); }
}
</style>

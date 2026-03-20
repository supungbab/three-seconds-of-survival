<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const step = ref<0 | 1 | 2 | 3>(0) // 0=place, 1=arm, 2=detonate, 3=done
const LABELS = ['PLACE CHARGE', 'ARM', 'DETONATE']

function handlePlace(e: PointerEvent) {
  e.stopPropagation()
  if (step.value !== 0) return
  playTick()
  step.value = 1
}

function handleArm(e: PointerEvent) {
  e.stopPropagation()
  if (step.value !== 1) return
  playTick()
  step.value = 2
}

function handleDetonate(e: PointerEvent) {
  e.stopPropagation()
  if (step.value !== 2) return
  playTick()
  step.value = 3
  emit('tap', true)
}
</script>

<template>
  <div class="breach-mission">
    <div class="wall">
      <div class="bricks">
        <div v-for="r in 3" :key="r" class="brick-row">
          <span v-for="c in 4" :key="c" class="brick" />
        </div>
      </div>
      <div
        class="mark-x"
        :class="{ placed: step >= 1 }"
        @pointerdown="handlePlace"
      >
        <span v-if="step === 0" class="x-label">✕</span>
        <span v-else class="charge-icon">▣</span>
      </div>
    </div>

    <div class="controls">
      <button
        v-if="step === 1"
        class="action-btn arm"
        @pointerdown="handleArm"
      >ARM</button>
      <button
        v-else-if="step === 2"
        class="action-btn detonate"
        @pointerdown="handleDetonate"
      >DETONATE</button>
      <div v-else-if="step === 3" class="boom">█ BREACH █</div>
    </div>

    <div class="step-indicator">
      <span
        v-for="(label, i) in LABELS"
        :key="i"
        class="step-dot"
        :class="{ done: step > i, active: step === i }"
      >{{ i + 1 }}</span>
    </div>
    <div class="hint">{{ step < 3 ? LABELS[step] : '' }}</div>
  </div>
</template>

<style scoped>
.breach-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 200px;
}

.wall {
  position: relative;
  width: 160px;
  height: 90px;
  border: 2px solid var(--arc-muted);
  background: #1a1610;
  overflow: hidden;
}

.bricks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
}

.brick-row {
  display: flex;
  gap: 2px;
}

.brick-row:nth-child(even) {
  padding-left: 12px;
}

.brick {
  width: 34px;
  height: 20px;
  background: #3a2e22;
  border: 1px solid #2a2018;
}

.mark-x {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  cursor: pointer;
}

.x-label {
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
  animation: pulse-x 0.6s ease-in-out infinite alternate;
}

.charge-icon {
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
}

.mark-x.placed {
  cursor: default;
}

.controls {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.action-btn {
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  padding: 8px 24px;
  border: 2px solid;
  background: transparent;
  cursor: pointer;
  border-radius: 0;
}

.action-btn.arm {
  color: var(--px-green-bright);
  border-color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.action-btn.detonate {
  color: var(--arc-danger);
  border-color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  box-shadow: 0 0 12px var(--arc-danger-glow);
  animation: pulse-btn 0.4s ease-in-out infinite alternate;
}

.action-btn:active {
  filter: brightness(1.5);
}

.boom {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 16px var(--arc-danger-glow);
}

.step-indicator {
  display: flex;
  gap: 10px;
}

.step-dot {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-family: monospace;
  border: 2px solid var(--arc-muted);
  color: var(--arc-muted);
}

.step-dot.active {
  border-color: var(--px-green-bright);
  color: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.step-dot.done {
  border-color: var(--px-green-bright);
  background: var(--px-green-bright);
  color: #000;
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}

@keyframes pulse-x {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

@keyframes pulse-btn {
  from { box-shadow: 0 0 6px var(--arc-danger-glow); }
  to { box-shadow: 0 0 18px var(--arc-danger-glow); }
}
</style>

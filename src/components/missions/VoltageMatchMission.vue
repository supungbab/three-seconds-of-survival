<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const targetVoltage = ref(0)
const currentVoltage = ref(0)
const THRESHOLD = 0.3
let resolved = false
let raf = 0
let startTime = 0

onMounted(() => {
  targetVoltage.value = Math.round((3 + Math.random() * 9) * 10) / 10 // 3.0 - 12.0
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

function animate(t: number) {
  if (!startTime) startTime = t
  const elapsed = (t - startTime) / 1000
  // Oscillate around the target with varying speed
  currentVoltage.value = Math.round(
    (targetVoltage.value + Math.sin(elapsed * 2.2) * 4 + Math.sin(elapsed * 0.7) * 2) * 10
  ) / 10
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  cancelAnimationFrame(raf)
  const diff = Math.abs(currentVoltage.value - targetVoltage.value)
  emit('tap', diff <= THRESHOLD)
}
</script>

<template>
  <div class="voltage-match-mission">
    <div class="volt-header">MATCH VOLTAGE</div>
    <div class="volt-displays">
      <div class="volt-box target">
        <div class="volt-label">TARGET</div>
        <div class="volt-value">{{ targetVoltage.toFixed(1) }}V</div>
      </div>
      <div class="volt-arrow">⟶</div>
      <div class="volt-box current">
        <div class="volt-label">CURRENT</div>
        <div class="volt-value">{{ currentVoltage.toFixed(1) }}V</div>
      </div>
    </div>
    <button class="lock-btn" @pointerdown="handleTap">LOCK</button>
    <div class="volt-hint">TAP WHEN VALUES MATCH</div>
  </div>
</template>

<style scoped>
.voltage-match-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
}

.volt-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.volt-displays {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volt-box {
  background: #060806;
  border: 2px solid var(--px-green-bright);
  padding: 8px 12px;
  text-align: center;
  border-radius: 0;
  min-width: 80px;
}

.volt-label {
  font-size: 9px;
  color: var(--arc-muted);
  margin-bottom: 4px;
}

.volt-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
}

.volt-box.current .volt-value {
  color: #ffd644;
  text-shadow: 0 0 10px rgba(255, 214, 68, 0.5);
}

.volt-arrow {
  font-size: 20px;
  color: var(--arc-muted);
}

.lock-btn {
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 16px;
  font-weight: 700;
  padding: 10px 32px;
  cursor: pointer;
  border-radius: 0;
  text-shadow: 0 0 6px var(--px-green-glow);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.lock-btn:active {
  background: var(--px-green-bg);
  filter: brightness(1.3);
}

.volt-hint {
  font-size: 11px;
  color: var(--arc-muted);
}
</style>

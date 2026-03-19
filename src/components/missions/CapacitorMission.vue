<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const charge = ref(0)
const discharged = ref(false)
let animId: number | null = null
let startTime = 0
const chargeDuration = 2000

onMounted(() => {
  startTime = performance.now()

  function animate(now: number) {
    if (discharged.value) return
    const elapsed = now - startTime
    charge.value = Math.min(100, (elapsed / chargeDuration) * 100)

    if (charge.value >= 100) {
      discharged.value = true
      emit('tap', false)
      return
    }
    animId = requestAnimationFrame(animate)
  }
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

function handleDischarge(e: Event) {
  e.stopPropagation()
  if (discharged.value) return
  discharged.value = true
  playTick()
  const c = charge.value
  emit('tap', c >= 70 && c <= 85)
}

function zoneClass(): string {
  const c = charge.value
  if (c >= 90) return 'overload'
  if (c >= 70) return 'safe'
  return 'charging'
}
</script>

<template>
  <div class="capacitor-mission">
    <div class="label">CAPACITOR CHARGE</div>
    <div class="gauge-outer">
      <div class="zone-marks">
        <div class="zone safe-zone" style="bottom: 70%; height: 15%;">SAFE</div>
        <div class="zone danger-zone" style="bottom: 90%; height: 10%;">!</div>
      </div>
      <div class="gauge-track">
        <div
          class="gauge-fill"
          :class="zoneClass()"
          :style="{ height: `${charge}%` }"
        ></div>
      </div>
    </div>
    <div class="pct-display">
      <span class="pct-value" :class="zoneClass()">{{ Math.floor(charge) }}</span>
      <span class="pct-sign">%</span>
    </div>
    <button
      class="discharge-btn"
      :disabled="discharged"
      @pointerdown="handleDischarge"
    >DISCHARGE</button>
  </div>
</template>

<style scoped>
.capacitor-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 14px;
}

.label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.gauge-outer {
  display: flex;
  gap: 8px;
  align-items: stretch;
  height: 120px;
}

.zone-marks {
  position: relative;
  width: 36px;
  height: 120px;
}

.zone {
  position: absolute;
  left: 0;
  right: 0;
  font-family: monospace;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}

.safe-zone {
  border: 1px solid var(--px-green-bright);
  color: var(--px-green-bright);
  opacity: 0.6;
}

.danger-zone {
  border: 1px solid var(--arc-danger);
  color: var(--arc-danger);
  opacity: 0.6;
}

.gauge-track {
  width: 40px;
  height: 120px;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 12px var(--px-green-glow);
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.05s linear;
}

.gauge-fill.charging {
  background: var(--arc-muted);
}

.gauge-fill.safe {
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.gauge-fill.overload {
  background: var(--arc-danger);
  box-shadow: 0 0 16px var(--arc-danger-glow);
  animation: overload-flash 0.2s ease-in-out infinite alternate;
}

.pct-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: monospace;
}

.pct-value {
  font-size: 32px;
  font-weight: 900;
}

.pct-value.charging {
  color: var(--arc-muted);
}

.pct-value.safe {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.pct-value.overload {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.pct-sign {
  font-size: 16px;
  color: var(--arc-muted);
}

.discharge-btn {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 28px;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 10px var(--px-green-glow);
  letter-spacing: 3px;
}

.discharge-btn:active {
  transform: scale(0.92);
}

.discharge-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

@keyframes overload-flash {
  from { opacity: 0.7; }
  to { opacity: 1; }
}
</style>

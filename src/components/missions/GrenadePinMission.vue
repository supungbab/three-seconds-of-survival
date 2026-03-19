<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const gauge = ref(0)
const holding = ref(false)
const resolved = ref(false)
const success = ref(false)
const failed = ref(false)

const ZONE_MIN = 60
const ZONE_MAX = 80
const FILL_SPEED = 1.2

let animId: number | null = null
let lastTime = 0

function fillGauge(now: number) {
  if (!holding.value || resolved.value) return
  if (lastTime === 0) lastTime = now
  const dt = now - lastTime
  lastTime = now
  gauge.value = Math.min(100, gauge.value + FILL_SPEED * (dt / 16))

  if (gauge.value >= 100) {
    resolved.value = true
    failed.value = true
    holding.value = false
    emit('tap', false)
    return
  }
  animId = requestAnimationFrame(fillGauge)
}

function onPointerDown(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value) return
  holding.value = true
  lastTime = 0
  animId = requestAnimationFrame(fillGauge)
}

function onPointerUp(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value || !holding.value) return
  holding.value = false
  if (animId) cancelAnimationFrame(animId)
  resolved.value = true

  if (gauge.value >= ZONE_MIN && gauge.value <= ZONE_MAX) {
    success.value = true
    playTick()
    emit('tap', true)
  } else {
    failed.value = true
    emit('tap', false)
  }
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointerleave', onPointerUp)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('pointerdown', onPointerDown)
  el.removeEventListener('pointerup', onPointerUp)
  el.removeEventListener('pointerleave', onPointerUp)
})
</script>

<template>
  <div ref="containerEl" class="grenade-pin-mission">
    <div class="grenade-body" :class="{ shaking: holding }">
      <div class="grenade-icon">
        <span class="grenade-symbol">◈</span>
        <span v-if="!resolved" class="pin-symbol">⌐</span>
        <span v-if="success" class="pin-gone">✕</span>
      </div>
      <div class="grenade-label">GRENADE</div>
    </div>

    <div class="gauge-container">
      <div class="gauge-track">
        <div
          class="gauge-zone"
          :style="{ bottom: `${ZONE_MIN}%`, height: `${ZONE_MAX - ZONE_MIN}%` }"
        />
        <div
          class="gauge-fill"
          :class="{ danger: gauge > ZONE_MAX, inzone: gauge >= ZONE_MIN && gauge <= ZONE_MAX }"
          :style="{ height: `${gauge}%` }"
        />
      </div>
      <div class="gauge-marks">
        <span class="mark" :style="{ bottom: `${ZONE_MAX}%` }">▸</span>
        <span class="mark" :style="{ bottom: `${ZONE_MIN}%` }">▸</span>
      </div>
    </div>

    <div v-if="!resolved" class="pull-hint">
      HOLD TO PULL PIN
    </div>
    <div v-if="success" class="result-text ok">PIN PULLED</div>
    <div v-if="failed" class="result-text bad">{{ gauge >= 100 ? 'OVERCOOKED' : 'TOO EARLY' }}</div>
  </div>
</template>

<style scoped>
.grenade-pin-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  user-select: none;
}

.grenade-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.grenade-body.shaking {
  animation: g-shake 0.08s linear infinite alternate;
}

.grenade-icon {
  position: relative;
  font-size: 48px;
  font-family: monospace;
}

.grenade-symbol {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.pin-symbol {
  position: absolute;
  top: -8px;
  right: -12px;
  font-size: 20px;
  color: var(--arc-muted);
}

.pin-gone {
  position: absolute;
  top: -8px;
  right: -12px;
  font-size: 20px;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.grenade-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.gauge-container {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}

.gauge-track {
  position: relative;
  width: 28px;
  height: 100%;
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  overflow: hidden;
}

.gauge-zone {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 255, 65, 0.12);
  border-top: 1px dashed var(--px-green-bright);
  border-bottom: 1px dashed var(--px-green-bright);
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  transition: height 0.05s linear;
}

.gauge-fill.inzone {
  background: var(--px-green-bright);
  box-shadow: 0 0 16px var(--px-green-glow);
}

.gauge-fill.danger {
  background: var(--arc-danger);
  box-shadow: 0 0 12px var(--arc-danger-glow);
}

.gauge-marks {
  position: relative;
  height: 100%;
  width: 12px;
}

.mark {
  position: absolute;
  font-size: 10px;
  font-family: monospace;
  color: var(--px-green-bright);
  transform: translateY(50%);
}

.pull-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: hint-blink 1s ease-in-out infinite alternate;
}

.result-text {
  font-size: 16px;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 3px;
  animation: flash-in 0.2s ease-out;
}

.result-text.ok {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.result-text.bad {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

@keyframes g-shake {
  from { transform: translateX(-2px) rotate(-1deg); }
  to { transform: translateX(2px) rotate(1deg); }
}

@keyframes hint-blink {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

@keyframes flash-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>

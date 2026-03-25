<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { useAudio } from '@/composables/useAudio'

const { t } = useI18n()
const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false
let startX = 0
let startY = 0

function onStart(e: PointerEvent) {
  e.stopPropagation()
  startX = e.clientX
  startY = e.clientY
}

function onEnd(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  const dy = e.clientY - startY
  const dx = e.clientX - startX
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 30) return // too short, not a swipe
  resolved = true
  const isUp = Math.abs(dy) > Math.abs(dx) && dy < 0
  if (isUp) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}
</script>

<template>
  <div class="vent-mission" @pointerdown="onStart" @pointerup="onEnd">
    <div class="vent-hatch">
      <div class="hatch-slats">
        <div class="slat" />
        <div class="slat" />
        <div class="slat" />
      </div>
      <div class="hatch-label">{{ t('환기구') }}</div>
    </div>

    <div class="radiation-zone">
      <div class="rad-icon">☢</div>
      <div class="rad-label">{{ t('방사능 감지') }}</div>
    </div>

    <div class="swipe-hint">{{ t('↑ 스와이프하여 환기') }}</div>
  </div>
</template>

<style scoped>
.vent-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 16px;
  min-height: 200px;
}

.vent-hatch {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hatch-slats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border: 2px solid var(--px-green-border);
  background: #0c140c;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.slat {
  height: 4px;
  background: var(--px-green-dim);
  box-shadow: 0 0 4px var(--px-green-glow);
}

.hatch-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--px-green-dim);
  letter-spacing: 2px;
}

.radiation-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rad-icon {
  font-size: 64px;
  color: var(--arc-danger);
  text-shadow: 0 0 24px rgba(255, 59, 92, 0.5);
  animation: rad-pulse 0.8s ease-in-out infinite alternate;
}

.rad-label {
  font-size: 14px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 8px rgba(255, 59, 92, 0.4);
  letter-spacing: 2px;
  animation: rad-blink 1s steps(2) infinite;
}

.swipe-hint {
  font-size: 18px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 3px;
  animation: hint-bob 0.8s ease-in-out infinite alternate;
}

@keyframes rad-pulse {
  from {
    text-shadow: 0 0 12px rgba(255, 59, 92, 0.3);
    opacity: 0.7;
  }
  to {
    text-shadow: 0 0 36px rgba(255, 59, 92, 0.7);
    opacity: 1;
  }
}

@keyframes rad-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.3; }
}

@keyframes hint-bob {
  from { transform: translateY(4px); }
  to { transform: translateY(-4px); }
}
</style>

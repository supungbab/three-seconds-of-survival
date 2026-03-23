<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const buttonActive = ref(false)
let interval: ReturnType<typeof setInterval> | null = null
let resolved = false

onMounted(() => {
  buttonActive.value = true
  interval = setInterval(() => {
    if (!resolved) {
      buttonActive.value = !buttonActive.value
    }
  }, 400)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

function handleTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()

  if (buttonActive.value) {
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}
</script>

<template>
  <div class="degauss-mission">
    <div class="degauss-distort">
      <div class="degauss-glitch-line r" />
      <div class="degauss-glitch-line g" />
      <div class="degauss-glitch-line b" />
    </div>

    <button
      class="degauss-btn"
      :class="{ active: buttonActive, hidden: !buttonActive }"
      @pointerdown="handleTap"
    >
      {{ t('디가우스') }}
    </button>

    <div class="degauss-hint">{{ t('불이 켜졌을 때 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.degauss-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.degauss-distort {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: degauss-warp 0.6s ease-in-out infinite alternate;
}

.degauss-glitch-line {
  position: absolute;
  width: 100%;
  height: 33%;
  mix-blend-mode: screen;
}

.degauss-glitch-line.r {
  top: 0;
  background: rgba(255, 59, 92, 0.08);
  animation: glitch-r 0.3s infinite;
}

.degauss-glitch-line.g {
  top: 33%;
  background: rgba(140, 200, 144, 0.08);
  animation: glitch-g 0.25s infinite;
}

.degauss-glitch-line.b {
  top: 66%;
  background: rgba(80, 140, 255, 0.08);
  animation: glitch-b 0.35s infinite;
}

@keyframes glitch-r {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}

@keyframes glitch-g {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-2px); }
}

@keyframes glitch-b {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

@keyframes degauss-warp {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(30deg); }
}

.degauss-btn {
  position: relative;
  z-index: 1;
  padding: 12px 32px;
  font-size: 22px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 4px;
  border-radius: 0;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
  cursor: pointer;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    0 0 24px var(--px-green-glow),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
  transition: opacity 0.05s;
}

.degauss-btn.hidden {
  opacity: 0.1;
  border-color: var(--arc-muted);
  color: var(--arc-muted);
  text-shadow: none;
  box-shadow: none;
}

.degauss-btn.active {
  animation: degauss-pulse 0.4s ease-in-out infinite alternate;
}

.degauss-btn:active {
  transform: scale(0.92);
}

@keyframes degauss-pulse {
  from {
    box-shadow:
      0 0 0 2px var(--px-green-frame),
      0 0 16px var(--px-green-glow);
  }
  to {
    box-shadow:
      0 0 0 2px var(--px-green-frame),
      0 0 40px var(--px-green-glow);
  }
}

.degauss-hint {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

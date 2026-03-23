<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const playheadX = ref(0)
const zoneStart = ref(0)
const zoneEnd = ref(0)
const bars = ref<number[]>([])
let animFrame = 0
let startTime = 0
let resolved = false
const DURATION = 2000

onMounted(() => {
  const numBars = 40
  const generated: number[] = []
  for (let i = 0; i < numBars; i++) {
    generated.push(20 + Math.random() * 60)
  }
  bars.value = generated

  const start = 20 + Math.random() * 40
  zoneStart.value = start
  zoneEnd.value = start + 20

  startTime = performance.now()
  animate()

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTap, { passive: false })
  el.addEventListener('mousedown', onTap)
})

function animate() {
  const elapsed = performance.now() - startTime
  const progress = Math.min(1, elapsed / DURATION)
  playheadX.value = progress * 100

  if (progress < 1 && !resolved) {
    animFrame = requestAnimationFrame(animate)
  }
}

function onTap(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(animFrame)

  const inZone = playheadX.value >= zoneStart.value && playheadX.value <= zoneEnd.value
  if (inZone) {
    playTick()
  }
  emit('tap', inZone)
}

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onTap)
  el.removeEventListener('mousedown', onTap)
})
</script>

<template>
  <div ref="containerEl" class="blackbox-mission">
    <div class="waveform-label">{{ t('신호 분석') }}</div>
    <div class="waveform-container">
      <div
        class="target-zone"
        :style="{ left: `${zoneStart}%`, width: `${zoneEnd - zoneStart}%` }"
      />
      <div
        v-for="(h, i) in bars"
        :key="i"
        class="wave-bar"
        :class="{ 'in-zone': (i / bars.length) * 100 >= zoneStart && (i / bars.length) * 100 <= zoneEnd }"
        :style="{ height: `${h}%`, left: `${(i / bars.length) * 100}%` }"
      />
      <div
        class="playhead"
        :style="{ left: `${playheadX}%` }"
      />
    </div>
    <div class="tap-hint">{{ t('타겟 영역에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.blackbox-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
}

.waveform-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.waveform-container {
  position: relative;
  width: 100%;
  height: 100px;
  background: var(--px-green-bg);
  border: 2px solid #3a4a38;
  overflow: hidden;
}

.target-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(140, 200, 144, 0.08);
  border-left: 2px solid var(--px-green-bright);
  border-right: 2px solid var(--px-green-bright);
  box-shadow: inset 0 0 16px rgba(140, 200, 144, 0.1);
}

.wave-bar {
  position: absolute;
  bottom: 50%;
  width: 2px;
  background: var(--arc-muted);
  transform: translateY(50%);
  opacity: 0.5;
}

.wave-bar.in-zone {
  background: var(--px-green-bright);
  opacity: 1;
  box-shadow: 0 0 4px var(--px-green-glow);
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow), 0 0 20px var(--px-green-glow);
  transition: none;
}

.tap-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}
</style>

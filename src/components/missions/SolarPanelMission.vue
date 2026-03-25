<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { randomInt } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const sunAngle = ref(0)
const panelAngle = ref(90)
const dragging = ref(false)
let animFrame = 0
let startTime = 0

const sunSpeed = randomInt(15, 30)
const sunStartAngle = randomInt(20, 60)

const sunX = computed(() => {
  return (sunAngle.value / 180) * 100
})

onMounted(() => {
  sunAngle.value = sunStartAngle
  startTime = performance.now()

  function animate() {
    const elapsed = (performance.now() - startTime) / 1000
    sunAngle.value = Math.min(180, sunStartAngle + elapsed * sunSpeed)
    if (sunAngle.value < 180) {
      animFrame = requestAnimationFrame(animate)
    }
  }
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

let sliderRect: DOMRect | null = null

function handleSliderDown(e: PointerEvent) {
  e.stopPropagation()
  dragging.value = true
  const target = (e.currentTarget as HTMLElement)
  sliderRect = target.getBoundingClientRect()
  updateAngle(e.clientX)
  target.setPointerCapture(e.pointerId)
}

function handleSliderMove(e: PointerEvent) {
  if (!dragging.value || !sliderRect) return
  e.stopPropagation()
  updateAngle(e.clientX)
}

function handleSliderUp(e: PointerEvent) {
  e.stopPropagation()
  dragging.value = false
  sliderRect = null
}

function updateAngle(clientX: number) {
  if (!sliderRect) return
  const ratio = Math.max(0, Math.min(1, (clientX - sliderRect.left) / sliderRect.width))
  panelAngle.value = Math.round(ratio * 180)
}

function handleConfirm(e: Event) {
  e.stopPropagation()
  playTick()
  const diff = Math.abs(panelAngle.value - sunAngle.value)
  emit('tap', diff <= 15)
}

const sliderPercent = computed(() => (panelAngle.value / 180) * 100)
</script>

<template>
  <div class="solar-panel-mission">
    <!-- Sun track -->
    <div class="sun-track">
      <div class="sun-icon" :style="{ left: sunX + '%' }">☀</div>
      <div class="track-line" />
    </div>

    <!-- Panel display -->
    <div class="panel-display">
      <div class="panel-body">
        <div
          class="panel-face"
          :style="{ transform: `rotate(${panelAngle - 90}deg)` }"
        >
          <span class="panel-symbol">▬▬</span>
        </div>
      </div>
      <div class="angle-readout">{{ panelAngle }}°</div>
    </div>

    <!-- Slider -->
    <div
      class="angle-slider"
      @pointerdown="handleSliderDown"
      @pointermove="handleSliderMove"
      @pointerup="handleSliderUp"
    >
      <div class="slider-track" />
      <div class="slider-fill" :style="{ width: sliderPercent + '%' }" />
      <div class="slider-thumb" :style="{ left: sliderPercent + '%' }" />
      <div class="slider-labels">
        <span>0°</span>
        <span>90°</span>
        <span>180°</span>
      </div>
    </div>

    <!-- Confirm -->
    <button class="confirm-btn" @pointerdown="handleConfirm">
      {{ t('■ 정렬') }}
    </button>
  </div>
</template>

<style scoped>
.solar-panel-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 14px;
}

.sun-track {
  position: relative;
  width: 100%;
  max-width: 240px;
  height: 32px;
}

.track-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--arc-muted);
}

.sun-icon {
  position: absolute;
  bottom: 4px;
  font-size: 24px;
  transform: translateX(-50%);
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow), 0 0 32px var(--px-green-glow);
  transition: left 0.05s linear;
}

.panel-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.panel-body {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  background: var(--px-green-bg);
}

.panel-face {
  transition: transform 0.1s;
}

.panel-symbol {
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.angle-readout {
  font-size: 16px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.angle-slider {
  position: relative;
  width: 100%;
  max-width: 240px;
  height: 40px;
  cursor: pointer;
  touch-action: none;
}

.slider-track {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  height: 6px;
  background: #1a2a1a;
  border: 1px solid var(--arc-muted);
}

.slider-fill {
  position: absolute;
  top: 12px;
  left: 0;
  height: 6px;
  background: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.slider-thumb {
  position: absolute;
  top: 6px;
  width: 16px;
  height: 18px;
  background: var(--px-green-bright);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  transform: translateX(-50%);
  box-shadow: 0 0 10px var(--px-green-glow);
}

.slider-labels {
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-family: monospace;
  color: var(--arc-muted);
}

.confirm-btn {
  padding: 10px 28px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 16px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 2px;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.confirm-btn:active {
  transform: scale(0.95);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 16px var(--px-green-glow);
}
</style>

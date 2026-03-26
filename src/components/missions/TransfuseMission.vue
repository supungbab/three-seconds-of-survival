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
const fluidLevel = ref(0)
const targetMin = ref(60)
const targetMax = ref(80)
let animFrame: number | null = null
let startTime = 0
const FILL_DURATION = 2200
let resolved = false

onMounted(() => {
  targetMin.value = 55 + Math.random() * 10
  targetMax.value = targetMin.value + 15

  startTime = Date.now()
  animFrame = requestAnimationFrame(updateFluid)
})

function updateFluid() {
  const elapsed = Date.now() - startTime
  fluidLevel.value = Math.min(100, (elapsed / FILL_DURATION) * 100)
  if (fluidLevel.value < 100) {
    animFrame = requestAnimationFrame(updateFluid)
  }
}

function handleTap(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return

  const inZone = fluidLevel.value >= targetMin.value && fluidLevel.value <= targetMax.value
  resolved = true
  playTick()
  emit('tap', inZone)
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', handleTap, { passive: false })
  el.addEventListener('mousedown', handleTap)
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', handleTap)
  el.removeEventListener('mousedown', handleTap)
})
</script>

<template>
  <div ref="containerEl" class="transfuse-mission">
    <div class="hint-label">{{ t('구간 안에서 탭하세요') }}</div>
    <div class="gauge-container">
      <div class="gauge">
        <div
          class="target-zone"
          :style="{
            bottom: `${targetMin}%`,
            height: `${targetMax - targetMin}%`
          }"
        />
        <div
          class="fluid"
          :style="{ height: `${fluidLevel}%` }"
        />
        <div class="gauge-marks">
          <div
            v-for="i in 10"
            :key="i"
            class="gauge-mark"
            :style="{ bottom: `${i * 10}%` }"
          >
            <span class="mark-label">{{ i * 10 }}</span>
          </div>
        </div>
      </div>
      <div class="level-readout">
        {{ Math.round(fluidLevel) }}%
      </div>
    </div>
  </div>
</template>

<style scoped>
.transfuse-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  user-select: none;
}

.hint-label {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.gauge-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.gauge {
  position: relative;
  width: 48px;
  height: 180px;
  border: 2px solid var(--px-green-bright);
  background: var(--px-green-bg);
  overflow: hidden;
}

.fluid {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(
    0deg,
    var(--arc-danger) 0%,
    var(--arc-danger-glow) 100%
  );
  transition: height 0.05s linear;
  z-index: 1;
}

.target-zone {
  position: absolute;
  left: 0;
  width: 100%;
  border-top: 2px dashed var(--px-green-bright);
  border-bottom: 2px dashed var(--px-green-bright);
  background: rgba(0, 255, 65, 0.08);
  z-index: 2;
  pointer-events: none;
}

.gauge-marks {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.gauge-mark {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--px-green-bright);
  opacity: 0.2;
}

.mark-label {
  position: absolute;
  right: -30px;
  top: -6px;
  font-size: 9px;
  color: var(--arc-muted);
}

.level-readout {
  font-size: 16px;
  font-weight: bold;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  min-width: 40px;
}
</style>

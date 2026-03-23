<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const waterLevel = ref(10)
const resolved = ref(false)
const leftPressed = ref(false)
const rightPressed = ref(false)

let leftTime = 0
let rightTime = 0
let animId: number | null = null
const SIMULTANEOUS_MS = 200

function riseWater() {
  if (resolved.value) return
  waterLevel.value = Math.min(100, waterLevel.value + 0.3)
  animId = requestAnimationFrame(riseWater)
}

function checkBothValves() {
  if (resolved.value) return
  if (leftPressed.value && rightPressed.value) {
    const diff = Math.abs(leftTime - rightTime)
    if (diff <= SIMULTANEOUS_MS) {
      resolved.value = true
      playTick()
      emit('tap', true)
    }
  }
}

function onLeftTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value) return
  leftPressed.value = true
  leftTime = Date.now()
  checkBothValves()
}

function onRightTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value) return
  rightPressed.value = true
  rightTime = Date.now()
  checkBothValves()
}

let resetTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    if (!resolved.value) {
      leftPressed.value = false
      rightPressed.value = false
    }
  }, SIMULTANEOUS_MS + 50)
}

function onLeftTapWrapped(e: PointerEvent) {
  onLeftTap(e)
  scheduleReset()
}

function onRightTapWrapped(e: PointerEvent) {
  onRightTap(e)
  scheduleReset()
}

onMounted(() => {
  animId = requestAnimationFrame(riseWater)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <div class="water-level-mission">
    <div class="tank-container">
      <button
        class="valve left-valve"
        :class="{ pressed: leftPressed }"
        @pointerdown.stop="onLeftTapWrapped"
      >
        <span class="valve-icon">⊕</span>
        <span class="valve-label">L</span>
      </button>

      <div class="tank">
        <div class="water" :style="{ height: `${waterLevel}%` }">
          <div class="wave" />
        </div>
        <div class="tank-marks">
          <span class="mark-line" style="bottom: 25%" />
          <span class="mark-line" style="bottom: 50%" />
          <span class="mark-line" style="bottom: 75%" />
        </div>
        <div class="tank-label">{{ t('수위') }}</div>
      </div>

      <button
        class="valve right-valve"
        :class="{ pressed: rightPressed }"
        @pointerdown.stop="onRightTapWrapped"
      >
        <span class="valve-icon">⊕</span>
        <span class="valve-label">R</span>
      </button>
    </div>

    <div class="hint-text">
      {{ t('양쪽 밸브를 동시에 탭하세요') }}
    </div>
  </div>
</template>

<style scoped>
.water-level-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.tank-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tank {
  position: relative;
  width: 80px;
  height: 160px;
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  background: #060e06;
  overflow: hidden;
  box-shadow: 0 0 0 2px #111311;
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(50, 120, 255, 0.3);
  border-top: 2px solid rgba(80, 160, 255, 0.6);
  transition: height 0.1s linear;
}

.wave {
  position: absolute;
  top: -4px;
  left: -10%;
  right: -10%;
  height: 8px;
  background: rgba(80, 160, 255, 0.2);
  animation: wave-anim 1.2s ease-in-out infinite alternate;
}

.tank-marks {
  position: absolute;
  inset: 0;
}

.mark-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 255, 65, 0.15);
}

.tank-label {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.valve {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: #0c140c;
  border: 2px solid var(--arc-danger);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 0 0 0 2px #111311;
}

.valve:active {
  transform: scale(0.9);
}

.valve.pressed {
  background: rgba(255, 60, 60, 0.15);
  border-color: var(--arc-danger);
  box-shadow:
    0 0 0 2px #111311,
    0 0 12px var(--arc-danger-glow);
}

.valve-icon {
  font-size: 28px;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.valve-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.hint-text {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: hint-blink 1s ease-in-out infinite alternate;
}

@keyframes wave-anim {
  from { transform: translateX(-5%); }
  to { transform: translateX(5%); }
}

@keyframes hint-blink {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>

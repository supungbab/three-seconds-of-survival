<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const DIRECTIONS = ['↑', '→', '↓', '←'] as const
const ANGLES = [0, 90, 180, 270]
const enemyIndex = ref(Math.floor(Math.random() * 4))
const arrowAngle = ref(0)
let resolved = false
let raf = 0
let startTime = 0
const ROTATION_SPEED = 180 // degrees per second
const TOLERANCE = 30

function animate(now: number) {
  if (resolved) return
  if (!startTime) startTime = now
  const elapsed = (now - startTime) / 1000
  arrowAngle.value = (elapsed * ROTATION_SPEED) % 360
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  playTick()

  const targetAngle = ANGLES[enemyIndex.value]
  let diff = Math.abs(arrowAngle.value - targetAngle)
  if (diff > 180) diff = 360 - diff
  emit('tap', diff <= TOLERANCE)
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="claymore-mission" @pointerdown="handleTap">
    <div class="enemy-indicator">
      <span class="enemy-label">{{ t('적') }}</span>
      <span class="enemy-dir">{{ DIRECTIONS[enemyIndex] }}</span>
    </div>
    <div class="mine-area">
      <div class="mine-body">◈</div>
      <div class="aim-arrow" :style="{ transform: `rotate(${arrowAngle}deg)` }">
        <span class="arrow-tip">▲</span>
      </div>
      <div
        v-for="(d, i) in DIRECTIONS"
        :key="i"
        class="compass-mark"
        :class="{ target: i === enemyIndex }"
        :style="{ transform: `rotate(${ANGLES[i]}deg) translateY(-52px)` }"
      >
        {{ d }}
      </div>
    </div>
    <div class="hint">{{ t('조준되면 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.claymore-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 200px;
  cursor: pointer;
}

.enemy-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.enemy-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
}

.enemy-dir {
  font-size: 24px;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.mine-area {
  position: relative;
  width: 130px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-body {
  font-size: 28px;
  color: var(--arc-muted);
  z-index: 1;
}

.aim-arrow {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  transition: none;
}

.arrow-tip {
  font-size: 18px;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  margin-top: 8px;
}

.compass-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
  transform-origin: 0 0;
  margin-left: -6px;
  margin-top: -8px;
}

.compass-mark.target {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  font-weight: 700;
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}
</style>

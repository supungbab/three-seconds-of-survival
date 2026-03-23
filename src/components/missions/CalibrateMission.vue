<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const crosshairX = ref(50)
const crosshairY = ref(50)
let animFrame: number | null = null
let startTime = 0

function animate(time: number) {
  if (!startTime) startTime = time
  const elapsed = (time - startTime) / 1000
  crosshairX.value = 50 + Math.sin(elapsed * 1.7) * 35 + Math.sin(elapsed * 0.9) * 10
  crosshairY.value = 50 + Math.cos(elapsed * 1.3) * 30 + Math.cos(elapsed * 2.1) * 8
  animFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
})

function handleTap(e: Event) {
  e.stopPropagation()
  playTick()
  const dx = crosshairX.value - 50
  const dy = crosshairY.value - 50
  const dist = Math.sqrt(dx * dx + dy * dy)
  emit('tap', dist < 20)
}
</script>

<template>
  <div class="calibrate-mission" @pointerdown="handleTap">
    <div class="target-zone">+</div>
    <div
      class="crosshair"
      :style="{ left: crosshairX + '%', top: crosshairY + '%' }"
    >
      +
    </div>
  </div>
</template>

<style scoped>
.calibrate-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
}

.target-zone {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border: 2px dashed var(--arc-muted);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-family: monospace;
  color: var(--arc-muted);
  pointer-events: none;
}

.crosshair {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
  pointer-events: none;
  will-change: left, top;
}
</style>

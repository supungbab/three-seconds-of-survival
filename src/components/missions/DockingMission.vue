<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const craftX = ref(0)
const craftY = ref(0)
const tapped = ref(false)
let animId: number | null = null

const containerSize = 160
const center = containerSize / 2
const craftSize = 20
const portSize = 30

let startX = 0
let startY = 0
let velocityX = 0
let velocityY = 0
let startTime = 0

onMounted(() => {
  const angle = Math.random() * Math.PI * 2
  const edgeDist = containerSize / 2 + 20
  startX = center + Math.cos(angle) * edgeDist
  startY = center + Math.sin(angle) * edgeDist
  const speed = 0.08
  velocityX = (center - startX) * speed
  velocityY = (center - startY) * speed

  craftX.value = startX
  craftY.value = startY
  startTime = performance.now()

  function animate(now: number) {
    if (tapped.value) return
    const elapsed = (now - startTime)
    craftX.value = startX + velocityX * elapsed
    craftY.value = startY + velocityY * elapsed

    if (
      craftX.value < -40 || craftX.value > containerSize + 40 ||
      craftY.value < -40 || craftY.value > containerSize + 40
    ) {
      if (Math.abs(craftX.value - center) > edgeDist || Math.abs(craftY.value - center) > edgeDist) {
        emit('tap', false)
        return
      }
    }
    animId = requestAnimationFrame(animate)
  }
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

function handleTap(e: Event) {
  e.stopPropagation()
  if (tapped.value) return
  tapped.value = true
  playTick()
  const dx = craftX.value - center
  const dy = craftY.value - center
  const dist = Math.sqrt(dx * dx + dy * dy)
  const threshold = containerSize * 0.15
  emit('tap', dist <= threshold)
}
</script>

<template>
  <div class="docking-mission">
    <div class="label">DOCK SPACECRAFT</div>
    <div
      class="dock-area"
      :style="{ width: `${containerSize}px`, height: `${containerSize}px` }"
      @pointerdown="handleTap"
    >
      <div
        class="dock-port"
        :style="{
          width: `${portSize}px`,
          height: `${portSize}px`,
          left: `${center - portSize / 2}px`,
          top: `${center - portSize / 2}px`
        }"
      >
        <span class="port-mark">[ ]</span>
      </div>
      <div
        class="craft"
        :style="{
          width: `${craftSize}px`,
          height: `${craftSize}px`,
          left: `${craftX - craftSize / 2}px`,
          top: `${craftY - craftSize / 2}px`
        }"
      >◆</div>
    </div>
    <div class="hint">TAP TO DOCK</div>
  </div>
</template>

<style scoped>
.docking-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.dock-area {
  position: relative;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 0 16px var(--px-green-glow);
}

.dock-port {
  position: absolute;
  border: 2px dashed var(--px-green-bright);
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.port-mark {
  font-family: monospace;
  font-size: 12px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.craft {
  position: absolute;
  font-family: monospace;
  font-size: 16px;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: blink-hint 1s ease-in-out infinite alternate;
}

@keyframes blink-hint {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>

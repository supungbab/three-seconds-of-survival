<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const leftY = ref(0)
const rightY = ref(0)
let resolved = false
let raf = 0
let startTime = 0
const THRESHOLD = 8 // px alignment tolerance

function animate(t: number) {
  if (!startTime) startTime = t
  const elapsed = (t - startTime) / 1000
  leftY.value = Math.sin(elapsed * 2.5) * 20
  rightY.value = Math.sin(elapsed * 3.1 + 1.2) * 20
  raf = requestAnimationFrame(animate)
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

function handleSplice(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  cancelAnimationFrame(raf)
  const diff = Math.abs(leftY.value - rightY.value)
  emit('tap', diff <= THRESHOLD)
}
</script>

<template>
  <div class="tape-splice-mission">
    <div class="splice-label">SPLICE TAPE</div>
    <div class="tape-area">
      <div class="tape-end left" :style="{ transform: `translateY(${leftY}px)` }">
        <div class="tape-strip" />
        <div class="tape-edge right-edge" />
      </div>
      <button class="splice-zone" @pointerdown="handleSplice">
        SPLICE
      </button>
      <div class="tape-end right" :style="{ transform: `translateY(${rightY}px)` }">
        <div class="tape-edge left-edge" />
        <div class="tape-strip" />
      </div>
    </div>
    <div class="splice-hint">TAP WHEN ALIGNED</div>
  </div>
</template>

<style scoped>
.tape-splice-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 10px;
  font-family: monospace;
  min-height: 180px;
}

.splice-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.tape-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  height: 100px;
  position: relative;
}

.tape-end {
  display: flex;
  align-items: center;
  transition: none;
}

.tape-strip {
  width: 60px;
  height: 16px;
  background: #8b6914;
  box-shadow: 0 0 4px rgba(139, 105, 20, 0.5);
}

.tape-edge {
  width: 8px;
  height: 16px;
}

.right-edge {
  background: repeating-linear-gradient(90deg, #8b6914 0px, #8b6914 2px, transparent 2px, transparent 4px);
}

.left-edge {
  background: repeating-linear-gradient(90deg, transparent 0px, transparent 2px, #8b6914 2px, #8b6914 4px);
}

.splice-zone {
  width: 64px;
  height: 48px;
  background: rgba(140, 200, 144, 0.08);
  border: 2px dashed var(--px-green-bright);
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 0;
  text-shadow: 0 0 6px var(--px-green-glow);
  z-index: 1;
}

.splice-zone:active {
  background: rgba(140, 200, 144, 0.2);
}

.splice-hint {
  font-size: 11px;
  color: var(--arc-muted);
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const position = ref(0) // -1 to 1
let animFrame = 0
let resolved = false
let startTime = 0

const SAFE_ZONE = 0.15 // +-15% of center = 30% total

function animate(time: number) {
  if (startTime === 0) startTime = time
  const elapsed = (time - startTime) / 1000
  // Oscillate: 1 cycle per second
  position.value = Math.sin(elapsed * Math.PI * 2)
  animFrame = requestAnimationFrame(animate)
}

function handleTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  cancelAnimationFrame(animFrame)

  const inZone = Math.abs(position.value) <= SAFE_ZONE
  emit('tap', inZone)
}

onMounted(() => {
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="purify-mission" @pointerdown="handleTap">
    <div class="purify-label">PURIFY</div>
    <div class="purify-bar">
      <div class="purify-safe-zone" />
      <div
        class="purify-indicator"
        :style="{ left: `${(position + 1) * 50}%` }"
      />
    </div>
    <div class="purify-hint">TAP IN GREEN ZONE</div>
  </div>
</template>

<style scoped>
.purify-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  cursor: pointer;
}

.purify-label {
  font-size: 18px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 4px;
}

.purify-bar {
  position: relative;
  width: 220px;
  height: 24px;
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  overflow: hidden;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.purify-safe-zone {
  position: absolute;
  left: 35%;
  width: 30%;
  height: 100%;
  background: rgba(140, 200, 144, 0.15);
  border-left: 2px solid var(--px-green-bright);
  border-right: 2px solid var(--px-green-bright);
}

.purify-indicator {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
  transform: translateX(-50%);
  transition: none;
}

.purify-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

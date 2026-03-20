<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const waveScale = ref(0)
const HIT_ZONE_MIN = 0.6
const HIT_ZONE_MAX = 0.85
const SPEED = 0.35 // scale per second
let raf = 0
let startTime = 0
let resolved = false

onMounted(() => {
  startTime = performance.now()
  raf = requestAnimationFrame(animate)
})

function animate(now: number) {
  if (resolved) return
  const elapsed = (now - startTime) / 1000
  waveScale.value = Math.min(1.2, elapsed * SPEED)
  if (waveScale.value >= 1.2) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  const s = waveScale.value
  if (s >= HIT_ZONE_MIN && s <= HIT_ZONE_MAX) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="emp-mission">
    <div class="label">EMP INCOMING — ACTIVATE SHIELD</div>
    <div class="radar">
      <div
        class="wave"
        :style="{ transform: `scale(${waveScale})`, opacity: 1 - waveScale * 0.6 }"
      />
      <div class="shield-zone" />
      <button class="shield-btn" @pointerdown="handleTap">
        ⛨
      </button>
    </div>
    <div class="hint">TAP WHEN WAVE IS CLOSE</div>
  </div>
</template>

<style scoped>
.emp-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  gap: 10px;
  min-height: 200px;
}

.label {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
}

.radar {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--arc-danger);
  box-shadow: 0 0 16px var(--arc-danger-glow), inset 0 0 16px var(--arc-danger-glow);
  border-radius: 0;
}

.shield-zone {
  position: absolute;
  width: 75%;
  height: 75%;
  border: 2px dashed var(--px-green-bright);
  opacity: 0.3;
  border-radius: 0;
}

.shield-btn {
  position: relative;
  z-index: 1;
  width: 56px;
  height: 56px;
  border: 2px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 0 12px var(--px-green-glow);
  border-radius: 0;
}

.shield-btn:active {
  box-shadow: 0 0 24px var(--px-green-glow);
  background: rgba(140, 200, 144, 0.15);
}

.hint {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
}
</style>

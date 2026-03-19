<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
let resolved = false
let animFrame = 0

const playerX = ref(50)
const playerY = ref(85)
const safeZone = ref({ x: 0, y: 0 })
const isDragging = ref(false)

interface Particle {
  id: number
  x: number
  y: number
  speed: number
}

const particles = ref<Particle[]>([])
let nextId = 0
let lastSpawn = 0

onMounted(() => {
  safeZone.value = {
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 40,
  }

  lastSpawn = performance.now()
  animate()

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

function getRelativePos(e: TouchEvent | MouseEvent): { x: number; y: number } | null {
  if (!containerEl.value) return null
  const rect = containerEl.value.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const pos = getRelativePos(e)
  if (!pos) return
  const dx = pos.x - playerX.value
  const dy = pos.y - playerY.value
  if (Math.sqrt(dx * dx + dy * dy) < 15) {
    isDragging.value = true
  }
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (!isDragging.value || resolved) return
  const pos = getRelativePos(e)
  if (!pos) return
  playerX.value = Math.max(5, Math.min(95, pos.x))
  playerY.value = Math.max(5, Math.min(95, pos.y))

  const dx = playerX.value - safeZone.value.x
  const dy = playerY.value - safeZone.value.y
  if (Math.sqrt(dx * dx + dy * dy) < 10) {
    resolved = true
    cancelAnimationFrame(animFrame)
    playTick()
    emit('tap', true)
  }
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  isDragging.value = false
}

function animate() {
  if (resolved) return
  const now = performance.now()

  if (now - lastSpawn > 300) {
    lastSpawn = now
    particles.value.push({
      id: nextId++,
      x: Math.random() * 100,
      y: -5,
      speed: 0.8 + Math.random() * 1.2,
    })
  }

  const updated: Particle[] = []
  for (const p of particles.value) {
    p.y += p.speed
    if (p.y < 105) {
      updated.push(p)
    }

    const dx = p.x - playerX.value
    const dy = p.y - playerY.value
    if (Math.sqrt(dx * dx + dy * dy) < 6 && !resolved) {
      resolved = true
      cancelAnimationFrame(animFrame)
      emit('tap', false)
      return
    }
  }
  particles.value = updated

  animFrame = requestAnimationFrame(animate)
}

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchmove', onMove)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mousemove', onMove)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="fallout-dodge-mission">
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{ left: `${p.x}%`, top: `${p.y}%` }"
    >
      ☢
    </div>

    <div
      class="safe-zone"
      :style="{ left: `${safeZone.x}%`, top: `${safeZone.y}%` }"
    >
      <span class="zone-symbol">□</span>
      <span class="zone-label">SAFE</span>
    </div>

    <div
      class="player"
      :class="{ dragging: isDragging }"
      :style="{ left: `${playerX}%`, top: `${playerY}%` }"
    >
      ■
    </div>
  </div>
</template>

<style scoped>
.fallout-dodge-mission {
  position: relative;
  width: 100%;
  height: 220px;
  background: var(--px-green-bg);
  border: 2px solid #3a4a38;
  overflow: hidden;
  touch-action: none;
}

.particle {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  pointer-events: none;
}

.safe-zone {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.zone-symbol {
  font-size: 36px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
  animation: zone-pulse 1s ease-in-out infinite alternate;
}

.zone-label {
  font-size: 10px;
  font-family: monospace;
  color: var(--px-green-bright);
  letter-spacing: 2px;
  text-shadow: 0 0 8px var(--px-green-glow);
}

.player {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  z-index: 5;
  cursor: grab;
}

.player.dragging {
  cursor: grabbing;
  text-shadow: 0 0 20px var(--px-green-glow), 0 0 40px var(--px-green-glow);
}

@keyframes zone-pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
</style>

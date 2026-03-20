<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Cluster {
  x: number
  y: number
  fixed: boolean
}

const clusters = ref<Cluster[]>([])
const resolved = ref(false)
let noiseRaf = 0

function generateClusters() {
  const spots: Cluster[] = []
  const positions = [
    { x: 15 + Math.random() * 20, y: 15 + Math.random() * 25 },
    { x: 55 + Math.random() * 20, y: 10 + Math.random() * 30 },
    { x: 25 + Math.random() * 25, y: 60 + Math.random() * 25 },
  ]
  for (const p of positions) {
    spots.push({ x: p.x, y: p.y, fixed: false })
  }
  clusters.value = spots
}

function handleClusterTap(index: number, e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value || clusters.value[index].fixed) return
  playTick()
  clusters.value[index].fixed = true
  if (clusters.value.every(c => c.fixed)) {
    resolved.value = true
    emit('tap', true)
  }
}

function animateNoise() {
  noiseRaf = requestAnimationFrame(animateNoise)
}

onMounted(() => {
  generateClusters()
  noiseRaf = requestAnimationFrame(animateNoise)
})

onUnmounted(() => {
  cancelAnimationFrame(noiseRaf)
})
</script>

<template>
  <div class="dead-pixel-mission">
    <div class="crt-screen">
      <div class="scanlines" />
      <div class="static-bg" />
      <div
        v-for="(c, i) in clusters"
        :key="i"
        class="dead-cluster"
        :class="{ fixed: c.fixed }"
        :style="{ left: `${c.x}%`, top: `${c.y}%` }"
        @pointerdown="(e: PointerEvent) => handleClusterTap(i, e)"
      >
        <div class="pixel-block" />
      </div>
    </div>
    <div class="fix-progress">
      <span
        v-for="(c, i) in clusters"
        :key="i"
        class="fix-dot"
        :class="{ done: c.fixed }"
      >{{ c.fixed ? '■' : '□' }}</span>
    </div>
    <div class="hint">TAP DEAD PIXELS</div>
  </div>
</template>

<style scoped>
.dead-pixel-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 200px;
}

.crt-screen {
  position: relative;
  width: 100%;
  height: 130px;
  border: 2px solid var(--px-green-bright);
  background: #060e06;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(140, 200, 144, 0.05);
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 3;
}

.static-bg {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  animation: static-shift 0.2s steps(4) infinite;
  pointer-events: none;
}

.dead-cluster {
  position: absolute;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
}

.pixel-block {
  width: 20px;
  height: 20px;
  background: #000;
  border: 1px solid #111;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}

.dead-cluster.fixed .pixel-block {
  background: var(--px-green-bright);
  border-color: var(--px-green-bright);
  box-shadow: 0 0 10px var(--px-green-glow);
}

.fix-progress {
  display: flex;
  gap: 10px;
  font-size: 16px;
  font-family: monospace;
  color: var(--arc-muted);
}

.fix-dot.done {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}

@keyframes static-shift {
  0% { background-position: 0 0; }
  25% { background-position: -32px -16px; }
  50% { background-position: 16px -32px; }
  75% { background-position: -16px 16px; }
  100% { background-position: 0 0; }
}
</style>

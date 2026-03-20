<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Tear {
  x: number
  y: number
  sealed: boolean
}

let resolved = false

const tears = ref<Tear[]>([
  { x: 30, y: 25, sealed: false },
  { x: 65, y: 55, sealed: false },
  { x: 40, y: 80, sealed: false },
])

function handleSeal(e: PointerEvent, index: number) {
  e.stopPropagation()
  if (resolved) return
  if (tears.value[index].sealed) return
  tears.value[index].sealed = true
  playTick()
  const allSealed = tears.value.every(t => t.sealed)
  if (allSealed) {
    resolved = true
    emit('tap', true)
  }
}
</script>

<template>
  <div class="hazmat-seal-mission">
    <div class="hz-header">SEAL HAZMAT SUIT</div>
    <div class="suit-outline">
      <svg viewBox="0 0 100 110" class="suit-svg">
        <!-- Simple body outline -->
        <path
          d="M50,5 C40,5 35,15 35,25 L35,40 L20,40 L20,55 L35,55 L35,80 L30,110 L42,110 L50,85 L58,110 L70,110 L65,80 L65,55 L80,55 L80,40 L65,40 L65,25 C65,15 60,5 50,5 Z"
          fill="none"
          stroke="#8a8a2a"
          stroke-width="1.5"
          opacity="0.6"
        />
        <!-- Head circle -->
        <circle cx="50" cy="12" r="8" fill="none" stroke="#8a8a2a" stroke-width="1.5" opacity="0.6" />
      </svg>
      <!-- Tear marks -->
      <button
        v-for="(tear, i) in tears"
        :key="i"
        class="tear-mark"
        :class="{ sealed: tear.sealed }"
        :style="{ left: `${tear.x}%`, top: `${tear.y}%` }"
        @pointerdown="(e) => handleSeal(e, i)"
      >
        <span v-if="!tear.sealed" class="tear-icon">✕</span>
        <span v-else class="seal-icon">✓</span>
      </button>
    </div>
    <div class="hz-status">{{ tears.filter(t => t.sealed).length }} / {{ tears.length }} SEALED</div>
  </div>
</template>

<style scoped>
.hazmat-seal-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
}

.hz-header {
  font-size: 14px;
  font-weight: 700;
  color: #c8c840;
  text-shadow: 0 0 8px rgba(200, 200, 64, 0.5);
}

.suit-outline {
  position: relative;
  width: 160px;
  height: 140px;
}

.suit-svg {
  width: 100%;
  height: 100%;
}

.tear-mark {
  position: absolute;
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
  background: transparent;
  border: 2px solid var(--arc-danger);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 0;
  transition: all 0.2s;
}

.tear-mark:not(.sealed) {
  animation: tear-pulse 0.8s ease-in-out infinite;
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.tear-mark.sealed {
  border-color: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.tear-icon {
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
}

.seal-icon {
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
  font-weight: 700;
}

.hz-status {
  font-size: 12px;
  color: var(--arc-muted);
}

@keyframes tear-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

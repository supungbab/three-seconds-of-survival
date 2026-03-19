<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const props = defineProps<{
  barricadeCount: number
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentStep = ref(0)
const resolved = ref(false)
const failed = ref(false)

interface PiecePos {
  x: number
  y: number
  num: number
}

const pieces = ref<PiecePos[]>([])

onMounted(() => {
  const count = props.barricadeCount || 3
  const generated: PiecePos[] = []
  for (let i = 0; i < count; i++) {
    generated.push({
      x: 10 + Math.random() * 70,
      y: 10 + Math.random() * 60,
      num: i + 1,
    })
  }
  pieces.value = generated
})

const totalPieces = computed(() => props.barricadeCount || 3)

function handlePieceTap(e: PointerEvent, num: number) {
  e.stopPropagation()
  if (resolved.value) return

  const expected = currentStep.value + 1
  if (num === expected) {
    playTick()
    currentStep.value = num
    if (num === totalPieces.value) {
      resolved.value = true
      emit('tap', true)
    }
  } else {
    resolved.value = true
    failed.value = true
    emit('tap', false)
  }
}
</script>

<template>
  <div class="barricade-mission">
    <div class="barricade-header">
      <span class="header-label">BARRICADE</span>
      <span class="header-progress">{{ currentStep }} / {{ totalPieces }}</span>
    </div>

    <div class="barricade-field">
      <button
        v-for="piece in pieces"
        :key="piece.num"
        class="barricade-piece"
        :class="{
          done: piece.num <= currentStep,
          next: piece.num === currentStep + 1 && !resolved,
          wrong: failed && piece.num === currentStep + 1,
        }"
        :style="{ left: `${piece.x}%`, top: `${piece.y}%` }"
        @pointerdown.stop="(e: PointerEvent) => handlePieceTap(e, piece.num)"
      >
        {{ piece.num }}
      </button>
    </div>

    <div v-if="failed" class="result-text bad">WRONG ORDER</div>
  </div>
</template>

<style scoped>
.barricade-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.barricade-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.header-progress {
  font-size: 16px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.barricade-field {
  position: relative;
  width: 100%;
  height: 160px;
}

.barricade-piece {
  position: absolute;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 20px;
  font-family: monospace;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 0 0 2px #111311;
}

.barricade-piece.next {
  border-color: var(--px-green-bright);
  animation: piece-pulse 0.6s ease-in-out infinite alternate;
  box-shadow:
    0 0 0 2px #111311,
    0 0 16px var(--px-green-glow);
}

.barricade-piece.done {
  background: var(--px-green-bg);
  border-color: var(--arc-muted);
  color: var(--arc-muted);
  opacity: 0.5;
  cursor: default;
}

.barricade-piece.wrong {
  border-color: var(--arc-danger);
  color: var(--arc-danger);
  box-shadow: 0 0 12px var(--arc-danger-glow);
}

.barricade-piece:active:not(.done) {
  transform: translate(-50%, -50%) scale(0.9);
}

.result-text.bad {
  font-size: 16px;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
  animation: flash-in 0.2s ease-out;
}

@keyframes piece-pulse {
  from { box-shadow: 0 0 0 2px #111311, 0 0 8px var(--px-green-glow); }
  to { box-shadow: 0 0 0 2px #111311, 0 0 24px var(--px-green-glow); }
}

@keyframes flash-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>

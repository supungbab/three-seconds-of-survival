<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Blob {
  x: number
  y: number
  shape: string
  isHuman: boolean
}

const blobs = ref<Blob[]>([])
let resolved = false

const SHAPES = ['●', '◆', '▲', '◼']
const HUMAN_SHAPE = '🯅'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

onMounted(() => {
  const positions = shuffle([
    { x: 15, y: 25 },
    { x: 45, y: 20 },
    { x: 75, y: 30 },
    { x: 30, y: 65 },
    { x: 65, y: 70 },
  ])
  const humanIdx = Math.floor(Math.random() * positions.length)
  blobs.value = positions.map((pos, i) => ({
    x: pos.x,
    y: pos.y,
    shape: i === humanIdx ? HUMAN_SHAPE : SHAPES[i % SHAPES.length],
    isHuman: i === humanIdx,
  }))
})

function handleTap(blob: Blob, e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  if (blob.isHuman) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}
</script>

<template>
  <div class="thermal-mission">
    <div class="label">{{ t('열 감지 — 사람을 찾으세요') }}</div>
    <div class="scan-field">
      <button
        v-for="(blob, i) in blobs"
        :key="i"
        class="blob"
        :class="{ human: blob.isHuman }"
        :style="{ left: `${blob.x}%`, top: `${blob.y}%` }"
        @pointerdown="handleTap(blob, $event)"
      >
        {{ blob.shape }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.thermal-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  gap: 10px;
  min-height: 200px;
}

.label {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
}

.scan-field {
  position: relative;
  width: 100%;
  height: 150px;
  background: #0a0206;
  border: 2px solid var(--arc-danger);
  box-shadow: inset 0 0 20px rgba(255, 59, 92, 0.05);
  overflow: hidden;
}

.blob {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  filter: blur(1px);
  opacity: 0.85;
  color: #ff6b35;
  text-shadow: 0 0 14px #ff4500, 0 0 28px #ff2200;
  border-radius: 0;
}

.blob.human {
  color: #ffaa44;
  text-shadow: 0 0 14px #ffcc00, 0 0 28px #ff9900;
  filter: blur(0.5px);
}

.blob:active {
  filter: none;
  opacity: 1;
}
</style>

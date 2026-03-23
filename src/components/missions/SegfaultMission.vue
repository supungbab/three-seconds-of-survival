<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface MemBlock {
  address: string
  corrupted: boolean
}

const blocks = ref<MemBlock[]>([])
let resolved = false
let pulseTimer = 0
const pulseOn = ref(true)

function randomAddr(): string {
  return '0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

onMounted(() => {
  const corruptedIndex = Math.floor(Math.random() * 9)
  const items: MemBlock[] = []
  for (let i = 0; i < 9; i++) {
    items.push({ address: randomAddr(), corrupted: i === corruptedIndex })
  }
  blocks.value = items
  pulseTimer = window.setInterval(() => {
    pulseOn.value = !pulseOn.value
  }, 400)
})

onUnmounted(() => {
  clearInterval(pulseTimer)
})

function handleTap(e: PointerEvent, block: MemBlock) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', block.corrupted)
}
</script>

<template>
  <div class="segfault-mission">
    <div class="seg-header">SEGMENTATION FAULT</div>
    <div class="seg-hint">{{ t('손상된 블록 격리') }}</div>
    <div class="mem-grid">
      <button
        v-for="(block, i) in blocks"
        :key="i"
        class="mem-block"
        :class="{ corrupted: block.corrupted, pulse: block.corrupted && pulseOn }"
        @pointerdown="(e) => handleTap(e, block)"
      >
        {{ block.address }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.segfault-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
}

.seg-header {
  font-size: 16px;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
}

.seg-hint {
  font-size: 11px;
  color: var(--arc-muted);
}

.mem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
  max-width: 280px;
}

.mem-block {
  background: #0c140c;
  border: 1px solid var(--px-green-bright);
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 12px;
  padding: 12px 4px;
  cursor: pointer;
  border-radius: 0;
  text-align: center;
  text-shadow: 0 0 4px var(--px-green-glow);
}

.mem-block.corrupted {
  border-color: var(--arc-danger);
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
}

.mem-block.corrupted.pulse {
  background: rgba(255, 59, 92, 0.15);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.mem-block:active {
  filter: brightness(1.4);
}
</style>

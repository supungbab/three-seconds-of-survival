<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const GRID_SIZE = 8
const totalPixels = GRID_SIZE * GRID_SIZE
const hotPixel = ref(Math.floor(Math.random() * totalPixels))
let flickerTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  flickerTimer = setInterval(() => {
    hotPixel.value = Math.floor(Math.random() * totalPixels)
  }, 1200)
})

onUnmounted(() => {
  if (flickerTimer) clearInterval(flickerTimer)
})

let resolved = false

function handlePixelTap(e: Event, index: number) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', index === hotPixel.value)
}
</script>

<template>
  <div class="pixel-fix-mission">
    <div class="pixel-header">{{ t('[ 불량 화소 스캔 ]') }}</div>
    <div class="pixel-grid">
      <button
        v-for="i in totalPixels"
        :key="i - 1"
        class="pixel-cell"
        :class="{ hot: (i - 1) === hotPixel }"
        @pointerdown="(e) => handlePixelTap(e, i - 1)"
      />
    </div>
    <div class="pixel-hint">{{ t('불량 화소를 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.pixel-fix-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.pixel-header {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.pixel-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  width: 200px;
  height: 200px;
}

.pixel-cell {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 0;
  cursor: pointer;
  padding: 0;
  transition: none;
}

.pixel-cell:active {
  background: #222;
}

.pixel-cell.hot {
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow), 0 0 16px var(--px-green-glow);
  animation: flicker 0.3s ease-in-out infinite alternate;
}

.pixel-hint {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}

@keyframes flicker {
  0% {
    opacity: 0.6;
    box-shadow: 0 0 4px var(--px-green-glow);
  }
  100% {
    opacity: 1;
    box-shadow: 0 0 12px var(--px-green-glow), 0 0 20px var(--px-green-glow);
  }
}
</style>

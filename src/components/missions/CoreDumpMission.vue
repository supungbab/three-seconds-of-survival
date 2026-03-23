<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false
let raf = 0
const scrollOffset = ref(0)
const SCROLL_SPEED = 60 // px per second
const LINE_HEIGHT = 20
const TOTAL_LINES = 20
const errorLineIndex = Math.floor(Math.random() * 6) + 7 // appears mid-scroll
let startTime = 0

function randomHexLine(): string {
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0') + ' '
  }
  return s.trim()
}

const lines = ref<{ text: string; isError: boolean }[]>([])

function init() {
  const result = []
  for (let i = 0; i < TOTAL_LINES; i++) {
    result.push({
      text: randomHexLine(),
      isError: i === errorLineIndex,
    })
  }
  lines.value = result
}

init()

function animate(t: number) {
  if (!startTime) startTime = t
  const elapsed = (t - startTime) / 1000
  scrollOffset.value = elapsed * SCROLL_SPEED
  if (scrollOffset.value < TOTAL_LINES * LINE_HEIGHT) {
    raf = requestAnimationFrame(animate)
  } else if (!resolved) {
    resolved = true
    emit('tap', false)
  }
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  cancelAnimationFrame(raf)
  // Check if error line is currently visible in viewport
  const errorY = errorLineIndex * LINE_HEIGHT - scrollOffset.value
  const visible = errorY >= -LINE_HEIGHT && errorY <= 100
  emit('tap', visible)
}
</script>

<template>
  <div class="core-dump-mission" @pointerdown="handleTap">
    <div class="dump-header">{{ t('코어 덤프 — 에러를 탭하세요') }}</div>
    <div class="dump-viewport">
      <div class="dump-scroll" :style="{ transform: `translateY(-${scrollOffset}px)` }">
        <div
          v-for="(line, i) in lines"
          :key="i"
          class="dump-line"
          :class="{ error: line.isError }"
        >
          <span v-if="line.isError" class="err-marker">[ERR]</span>
          <span v-else class="addr">{{ (i * 16).toString(16).toUpperCase().padStart(4, '0') }}:</span>
          {{ line.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.core-dump-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
  cursor: pointer;
}

.dump-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.dump-viewport {
  width: 100%;
  height: 100px;
  overflow: hidden;
  background: #060806;
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
  position: relative;
}

.dump-scroll {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  padding: 0 6px;
}

.dump-line {
  height: 20px;
  line-height: 20px;
  font-size: 10px;
  color: var(--arc-muted);
  white-space: nowrap;
  overflow: hidden;
}

.dump-line.error {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  font-weight: 700;
  background: rgba(255, 59, 92, 0.1);
}

.err-marker {
  color: var(--arc-danger);
  margin-right: 4px;
}

.addr {
  color: var(--px-green-bright);
  margin-right: 4px;
  opacity: 0.5;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const progress = ref(0)
const lastDirection = ref<'left' | 'right' | null>(null)
const swipeCount = ref(0)
const REQUIRED_SWIPES = 5
const depth = ref(0)
let startX = 0
let resolved = false

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  startX = clientX
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const clientX = 'changedTouches' in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX
  const dx = clientX - startX
  if (Math.abs(dx) < 30) return

  const dir = dx > 0 ? 'right' : 'left'
  if (lastDirection.value === null || dir !== lastDirection.value) {
    lastDirection.value = dir
    swipeCount.value++
    depth.value = Math.round((swipeCount.value / REQUIRED_SWIPES) * 12)
    progress.value = swipeCount.value / REQUIRED_SWIPES
    playTick()

    if (swipeCount.value >= REQUIRED_SWIPES) {
      resolved = true
      emit('tap', true)
    }
  }
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mouseup', onEnd)
})

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="tunnel-mission">
    <div class="depth-label">{{ t('깊이') }}: {{ depth }}m</div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
    </div>
    <div class="tunnel-visual">
      <div
        v-for="i in REQUIRED_SWIPES"
        :key="i"
        class="layer"
        :class="{ dug: i <= swipeCount }"
      >
        {{ i <= swipeCount ? '░' : '▓' }}
      </div>
    </div>
    <div class="hint">
      ← {{ t('스와이프') }} {{ lastDirection === 'left' || lastDirection === null ? t('오른쪽') + ' →' : '← ' + t('왼쪽') }}
    </div>
  </div>
</template>

<style scoped>
.tunnel-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 180px;
  touch-action: none;
}

.depth-label {
  font-size: 18px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.progress-track {
  width: 80%;
  height: 10px;
  background: #0c140c;
  border: 2px solid var(--px-green-bg);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
  transition: width 0.15s;
}

.tunnel-visual {
  display: flex;
  gap: 6px;
  font-size: 24px;
  font-family: monospace;
}

.layer {
  color: var(--arc-muted);
  transition: all 0.2s;
}

.layer.dug {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
  animation: blink-hint 0.8s steps(1) infinite;
}

@keyframes blink-hint {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
</style>

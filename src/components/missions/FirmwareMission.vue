<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const progress = ref(0)
const overflowed = ref(false)
let resolved = false

const DURATION = 2200
const MAX_PROGRESS = 110
const TICK_INTERVAL = 16
let startTime = 0
let animTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  startTime = Date.now()
  animTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const pct = (elapsed / DURATION) * 100
    progress.value = Math.min(pct, MAX_PROGRESS)

    if (pct > 100 && !overflowed.value) {
      overflowed.value = true
    }

    if (pct >= MAX_PROGRESS && !resolved) {
      clearTimer()
      resolved = true
      emit('tap', false)
    }
  }, TICK_INTERVAL)
})

function clearTimer() {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
}

function handleTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  clearTimer()
  playTick()

  if (progress.value >= 97 && progress.value <= 100) {
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <div class="firmware-mission" @pointerdown="handleTap">
    <div class="fw-label">{{ t('펌웨어 업로드') }}</div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{ overflow: overflowed }"
        :style="{ width: `${Math.min(progress, 100)}%` }"
      />
      <div
        v-if="overflowed"
        class="overflow-fill"
        :style="{ width: `${progress - 100}%` }"
      />
    </div>
    <div class="readout" :class="{ overflow: overflowed }">
      <template v-if="!overflowed">
        {{ Math.floor(Math.min(progress, 100)) }}%
      </template>
      <template v-else>
        {{ t('오버플로우') }}
      </template>
    </div>
    <div class="fw-hint">{{ t('100%에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.firmware-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  cursor: pointer;
}

.fw-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.progress-track {
  width: 220px;
  height: 28px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.progress-fill {
  height: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
  transition: width 0.016s linear;
}

.progress-fill.overflow {
  background: var(--px-green-bright);
}

.overflow-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--arc-danger);
  box-shadow: 0 0 12px var(--arc-danger-glow);
  animation: overflow-blink 0.2s infinite;
}

.readout {
  font-size: 28px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 2px;
}

.readout.overflow {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
  animation: overflow-blink 0.2s infinite;
}

.fw-hint {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

@keyframes overflow-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>

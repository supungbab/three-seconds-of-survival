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
const targetFreq = ref(50) // 타겟 위치 0-100
const currentFreq = ref(0) // 바늘 현재 위치
const isHolding = ref(false)
let resolved = false
let raf = 0
let direction = 1 // 1=오른쪽, -1=왼쪽
const SPEED = 150 // 초당 이동 %
let lastTime = 0

function getProximity(): number {
  const diff = Math.abs(currentFreq.value - targetFreq.value)
  return Math.max(0, 1 - diff / 50)
}

function animate(now: number) {
  if (resolved || !isHolding.value) return

  const dt = (now - lastTime) / 1000
  lastTime = now

  currentFreq.value += direction * SPEED * dt

  // 벽에서 반전
  if (currentFreq.value >= 100) {
    currentFreq.value = 100
    direction = -1
  } else if (currentFreq.value <= 0) {
    currentFreq.value = 0
    direction = 1
  }

  raf = requestAnimationFrame(animate)
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  isHolding.value = true
  lastTime = performance.now()
  raf = requestAnimationFrame(animate)
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved || !isHolding.value) return
  isHolding.value = false
  cancelAnimationFrame(raf)
  resolved = true

  const diff = Math.abs(currentFreq.value - targetFreq.value)
  if (diff < 6) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onMounted(() => {
  targetFreq.value = 25 + Math.random() * 50
  // 바늘 시작: 타겟 반대편
  currentFreq.value = targetFreq.value > 50 ? 5 + Math.random() * 10 : 90 + Math.random() * 5
  direction = targetFreq.value > currentFreq.value ? 1 : -1
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mouseup', onEnd)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="tune-mission">
    <div class="oscilloscope">
      <svg class="waveform" viewBox="0 0 200 60" preserveAspectRatio="none">
        <path
          :d="`M0,30 ${Array.from({length: 40}, (_, i) => {
            const x = i * 5
            const noise = (1 - getProximity()) * 12
            const y = 30 + Math.sin(i * 0.8 + currentFreq * 0.1) * (8 + noise) + (Math.random() - 0.5) * noise
            return `L${x},${y}`
          }).join(' ')}`"
          fill="none"
          stroke="var(--px-green-bright)"
          stroke-width="1.5"
          :opacity="0.5 + getProximity() * 0.5"
        />
      </svg>
    </div>

    <!-- Target zone -->
    <div class="freq-bar">
      <div class="target-zone" :style="{ left: `${targetFreq - 5}%`, width: '10%' }" />
      <div
        class="needle"
        :class="{ moving: isHolding, locked: resolved && Math.abs(currentFreq - targetFreq) < 6 }"
        :style="{ left: `${currentFreq}%` }"
      />
    </div>

    <div class="tune-hint">
      {{ resolved ? (Math.abs(currentFreq - targetFreq) < 6 ? t('잠김') : t('빗나감')) : isHolding ? t('타겟에서 떼기') : t('홀드하여 조정') }}
    </div>
  </div>
</template>

<style scoped>
.tune-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  touch-action: none;
  min-height: 180px;
}

.oscilloscope {
  width: 100%;
  height: 60px;
  border: 2px solid var(--px-green-border);
  background: #060e06;
  overflow: hidden;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 0 0 20px rgba(140, 200, 144, 0.05);
}

.waveform {
  width: 100%;
  height: 100%;
}

.freq-bar {
  position: relative;
  width: 100%;
  height: 32px;
  background: #0c140c;
  border: 2px solid #3a4a38;
  box-shadow: 0 0 0 2px #111311;
}

.target-zone {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(140, 200, 144, 0.12);
  border-left: 2px dashed var(--px-green-dim);
  border-right: 2px dashed var(--px-green-dim);
}

.needle {
  position: absolute;
  top: -4px;
  width: 3px;
  height: calc(100% + 8px);
  background: var(--px-green-bright);
  transform: translateX(-50%);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.needle.moving {
  box-shadow: 0 0 12px var(--px-green-glow-strong);
}

.needle.locked {
  background: #fff;
  box-shadow: 0 0 16px var(--px-green-glow-strong), 0 0 32px var(--px-green-glow);
}

.tune-hint {
  font-size: 16px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}
</style>

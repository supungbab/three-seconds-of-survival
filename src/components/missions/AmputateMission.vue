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
const infection = ref(0) // 0~100, percent from right
const cutLineY = 65 // percent from top where cut line is
let resolved = false
let raf = 0
let startTime = 0
let swipeStartX = 0
let swipeStartY = 0
const INFECTION_SPEED = 30 // percent per second
const CUT_LINE_THRESHOLD = 85 // infection must not exceed this

function animate(now: number) {
  if (resolved) return
  if (!startTime) startTime = now
  const elapsed = (now - startTime) / 1000
  infection.value = Math.min(100, elapsed * INFECTION_SPEED)
  if (infection.value >= CUT_LINE_THRESHOLD) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  swipeStartX = clientX
  swipeStartY = clientY
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  const clientX = 'changedTouches' in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX
  const dx = clientX - swipeStartX
  const dy = Math.abs(('changedTouches' in e ? (e.changedTouches[0]?.clientY ?? 0) : e.clientY) - swipeStartY)

  if (Math.abs(dx) > 60 && dy < 80) {
    resolved = true
    cancelAnimationFrame(raf)
    playTick()
    emit('tap', true)
  }
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
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
  <div ref="containerEl" class="amputate-mission">
    <div class="limb-area">
      <div class="limb">
        <div class="limb-segment upper" />
        <div class="cut-line-marker" :style="{ top: `${cutLineY}%` }">
          <span class="cut-dash" />
          <span class="cut-label">{{ t('절단') }}</span>
        </div>
        <div class="limb-segment lower" />
        <div class="infection-zone" :style="{ height: `${infection}%` }" />
      </div>
    </div>
    <div class="hint">{{ t('스와이프하여 절단하세요') }}</div>
  </div>
</template>

<style scoped>
.amputate-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 200px;
  touch-action: none;
}

.limb-area {
  position: relative;
  display: flex;
  justify-content: center;
}

.limb {
  position: relative;
  width: 40px;
  height: 150px;
  border: 2px solid var(--arc-muted);
  background: #1a1a12;
  overflow: hidden;
}

.limb-segment {
  width: 100%;
  height: 50%;
}

.infection-zone {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--arc-danger);
  opacity: 0.6;
  box-shadow: 0 0 12px var(--arc-danger-glow);
  transition: height 0.1s linear;
}

.cut-line-marker {
  position: absolute;
  left: -20px;
  right: -20px;
  height: 0;
  display: flex;
  align-items: center;
  z-index: 2;
}

.cut-dash {
  flex: 1;
  height: 0;
  border-top: 2px dashed var(--px-green-bright);
}

.cut-label {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
  padding: 0 2px;
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}
</style>

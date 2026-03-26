<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    igniteSwipes?: number
  }>(),
  { igniteSwipes: 5 }
)

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)
const swipeCount = ref(0)
let resolved = false
let touchStartY = 0

const fillPercent = computed(() =>
  Math.min(100, (swipeCount.value / props.igniteSwipes) * 100)
)

function onTouchStart(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved || touchStartY === 0) return

  const endY = e.changedTouches[0].clientY
  const deltaY = touchStartY - endY // positive = upward swipe

  if (deltaY > 30) {
    swipeCount.value++
    playTick()

    if (swipeCount.value >= props.igniteSwipes) {
      resolved = true
      emit('tap', true)
    }
  }
  touchStartY = 0
}

// Mouse fallback for desktop
let mouseStartY = 0

function onMouseDown(e: MouseEvent) {
  e.stopPropagation()
  if (resolved) return
  mouseStartY = e.clientY
}

function onMouseUp(e: MouseEvent) {
  e.stopPropagation()
  if (resolved || mouseStartY === 0) return

  const deltaY = mouseStartY - e.clientY
  if (deltaY > 30) {
    swipeCount.value++
    playTick()

    if (swipeCount.value >= props.igniteSwipes) {
      resolved = true
      emit('tap', true)
    }
  }
  mouseStartY = 0
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchend', onTouchEnd, { passive: false })
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchend', onTouchEnd)
  el.removeEventListener('mousedown', onMouseDown)
  el.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div ref="containerEl" class="ignite-mission">
    <div class="ignite-icon" :class="{ lit: swipeCount > 0 }">
      {{ swipeCount >= igniteSwipes ? '🔥' : '🪵' }}
    </div>

    <div class="ignite-gauge">
      <div class="ignite-gauge-fill" :style="{ height: fillPercent + '%' }" />
      <div class="ignite-gauge-label">
        {{ swipeCount }}/{{ igniteSwipes }}
      </div>
    </div>

    <div class="ignite-hint">{{ t('↑ 위로 스와이프') }}</div>
  </div>
</template>

<style scoped>
.ignite-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  min-height: 200px;
  cursor: grab;
}

.ignite-icon {
  font-size: 48px;
  text-align: center;
  transition: transform 0.15s;
}

.ignite-icon.lit {
  animation: ignite-shake 0.15s ease-in-out;
}

@keyframes ignite-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.ignite-gauge {
  position: relative;
  width: 40px;
  height: 100px;
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  overflow: hidden;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.ignite-gauge-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
  transition: height 0.15s ease-out;
}

.ignite-gauge-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.ignite-hint {
  font-size: 14px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
  animation: ignite-hint-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes ignite-hint-pulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>

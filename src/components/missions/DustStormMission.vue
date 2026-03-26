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
const textX = ref(50)
const textY = ref(50)
let resolved = false

onMounted(() => {
  textX.value = 15 + Math.random() * 70
  textY.value = 20 + Math.random() * 60
})

function handleTap(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  if (!containerEl.value) return

  const rect = containerEl.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
  const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY
  const tapX = ((clientX - rect.left) / rect.width) * 100
  const tapY = ((clientY - rect.top) / rect.height) * 100

  const dx = tapX - textX.value
  const dy = tapY - textY.value
  const dist = Math.sqrt(dx * dx + dy * dy)

  resolved = true
  playTick()
  emit('tap', dist < 20)
}

onMounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', handleTap, { passive: false })
  el.addEventListener('mousedown', handleTap)
})

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', handleTap)
  el.removeEventListener('mousedown', handleTap)
})
</script>

<template>
  <div ref="containerEl" class="dust-storm-mission">
    <div class="dust-overlay" />
    <div class="dust-overlay dust-overlay-2" />
    <div
      class="hidden-text"
      :style="{ left: `${textX}%`, top: `${textY}%` }"
    >
      {{ t('대피소') }}
    </div>
    <div class="hint-label">{{ t('신호를 찾으세요') }}</div>
  </div>
</template>

<style scoped>
.dust-storm-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  touch-action: none;
  background: var(--px-green-bg);
}

.dust-overlay {
  position: absolute;
  inset: -50%;
  width: 300%;
  height: 300%;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      rgba(180, 120, 40, 0.06) 1px,
      transparent 2px,
      transparent 4px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      rgba(160, 100, 30, 0.05) 1px,
      transparent 2px,
      transparent 3px
    ),
    repeating-linear-gradient(
      45deg,
      transparent 0px,
      rgba(200, 140, 50, 0.08) 2px,
      transparent 4px,
      transparent 8px
    );
  animation: dust-drift 1.5s linear infinite;
  pointer-events: none;
  z-index: 2;
}

.dust-overlay-2 {
  animation: dust-drift-2 2.2s linear infinite reverse;
  opacity: 0.8;
  background:
    repeating-linear-gradient(
      -30deg,
      transparent 0px,
      rgba(180, 130, 50, 0.1) 1px,
      transparent 3px,
      transparent 6px
    ),
    repeating-linear-gradient(
      60deg,
      transparent 0px,
      rgba(140, 90, 20, 0.07) 2px,
      transparent 4px,
      transparent 7px
    );
}

.hidden-text {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: bold;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 6px;
  opacity: 0.15;
  animation: text-flicker 3s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
  user-select: none;
}

.hint-label {
  position: absolute;
  bottom: 8px;
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
  z-index: 3;
  pointer-events: none;
}

@keyframes dust-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-33%, -10%); }
}

@keyframes dust-drift-2 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-20%, -33%); }
}

@keyframes text-flicker {
  0%, 100% { opacity: 0.08; }
  30% { opacity: 0.12; }
  50% { opacity: 0.28; }
  55% { opacity: 0.05; }
  70% { opacity: 0.22; }
  85% { opacity: 0.1; }
}
</style>

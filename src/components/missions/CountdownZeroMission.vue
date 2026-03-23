<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentNumber = ref(9)
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentNumber.value--
  }, 280)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function handleTap(e: Event) {
  e.stopPropagation()
  playTick()
  emit('tap', currentNumber.value === 0)
}
</script>

<template>
  <div class="countdown-zero-mission" @pointerdown="handleTap">
    <div class="countdown-label">{{ t('제로에서 탭하세요') }}</div>
    <div
      class="countdown-number"
      :class="{ zero: currentNumber === 0, negative: currentNumber < 0 }"
    >
      {{ currentNumber }}
    </div>
  </div>
</template>

<style scoped>
.countdown-zero-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  cursor: pointer;
  min-height: 160px;
}

.countdown-label {
  font-size: 14px;
  font-weight: 700;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.countdown-number {
  font-size: 72px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 24px var(--px-green-glow);
  transition: color 0.08s, text-shadow 0.08s;
  line-height: 1;
}

.countdown-number.zero {
  color: var(--px-green-bright);
  text-shadow: 0 0 32px var(--px-green-glow), 0 0 64px var(--px-green-glow);
  animation: zero-pulse 0.28s ease-in-out;
}

.countdown-number.negative {
  color: var(--arc-danger);
  text-shadow: 0 0 16px var(--arc-danger-glow);
}

@keyframes zero-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>

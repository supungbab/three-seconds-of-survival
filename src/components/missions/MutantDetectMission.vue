<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  mutantCount: number
  mutantIndex: number
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

function handleTap(e: Event, index: number) {
  e.stopPropagation()
  playTick()
  emit('tap', index === props.mutantIndex)
}
</script>

<template>
  <div class="mutant-detect-mission">
    <div class="mutant-header">{{ t('대상 스캔') }}</div>
    <div class="mutant-row">
      <button
        v-for="i in mutantCount"
        :key="i"
        class="subject"
        :class="{ mutant: (i - 1) === mutantIndex }"
        @pointerdown="(e) => handleTap(e, i - 1)"
      >
        <span class="subject-icon">♦</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mutant-detect-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.mutant-header {
  font-size: 16px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.mutant-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.subject {
  background: transparent;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  padding: 10px;
  cursor: pointer;
  transition: all 0.1s;
}

.subject-icon {
  font-size: 32px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  display: block;
}

.subject.mutant .subject-icon {
  animation: mutant-jitter 0.12s infinite alternate;
}

.subject:active {
  transform: scale(0.9);
  background: rgba(140, 200, 144, 0.1);
}

@keyframes mutant-jitter {
  0% {
    transform: translate(-1px, 0.5px);
  }
  25% {
    transform: translate(1px, -0.5px);
  }
  50% {
    transform: translate(-0.5px, -1px);
  }
  75% {
    transform: translate(0.5px, 1px);
  }
  100% {
    transform: translate(1px, -0.5px);
  }
}
</style>

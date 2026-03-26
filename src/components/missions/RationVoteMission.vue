<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const survivorCount = ref(3)
const correctAnswer = ref<'yes' | 'no'>('yes')
let resolved = false

onMounted(() => {
  const isShare = Math.random() < 0.5
  if (isShare) {
    survivorCount.value = 3
    correctAnswer.value = 'yes'
  } else {
    survivorCount.value = 1
    correctAnswer.value = 'no'
  }
})

function handleVote(choice: 'yes' | 'no', e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', choice === correctAnswer.value)
}
</script>

<template>
  <div class="ration-vote-mission">
    <div class="scenario-text">{{ t('보급품 공유?') }}</div>
    <div class="survivor-info">{{ t('생존자') }} {{ survivorCount }}{{ t('명') }}</div>
    <div class="vote-buttons">
      <button
        class="vote-btn yes-btn"
        @pointerdown="handleVote('yes', $event)"
      >
        {{ t('예') }} ✓
      </button>
      <button
        class="vote-btn no-btn"
        @pointerdown="handleVote('no', $event)"
      >
        {{ t('아니오') }} ✗
      </button>
    </div>
  </div>
</template>

<style scoped>
.ration-vote-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.scenario-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 2px;
}

.survivor-info {
  font-size: 14px;
  color: var(--arc-muted);
  letter-spacing: 3px;
  border: 1px solid var(--arc-muted);
  padding: 4px 12px;
  border-radius: 0;
}

.vote-buttons {
  display: flex;
  gap: 16px;
}

.vote-btn {
  width: 100px;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 0;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.1s;
}

.yes-btn {
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  color: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.yes-btn:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px var(--px-green-glow);
  background: rgba(140, 200, 144, 0.15);
}

.no-btn {
  background: var(--px-green-bg);
  border: 3px solid var(--arc-danger);
  color: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.no-btn:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px var(--arc-danger-glow);
  background: rgba(255, 59, 92, 0.1);
}
</style>

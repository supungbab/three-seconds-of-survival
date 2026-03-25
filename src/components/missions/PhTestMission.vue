<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

type PhCategory = 'ACID' | 'NEUTRAL' | 'ALKALI'

const stripColor = ref('#33cc33')
const correctAnswer = ref<PhCategory>('NEUTRAL')
const answered = ref(false)

function randomPh(): { color: string; category: PhCategory } {
  const roll = Math.random()
  if (roll < 0.33) {
    const colors = ['#ff2222', '#ff5500', '#ff8800', '#cc3300']
    return { color: pickRandom(colors), category: 'ACID' }
  } else if (roll < 0.66) {
    const colors = ['#33cc33', '#66dd44', '#88cc22', '#44bb44']
    return { color: pickRandom(colors), category: 'NEUTRAL' }
  } else {
    const colors = ['#2244ff', '#4466ee', '#6633cc', '#8844dd']
    return { color: pickRandom(colors), category: 'ALKALI' }
  }
}

onMounted(() => {
  const result = randomPh()
  stripColor.value = result.color
  correctAnswer.value = result.category
})

function handleChoice(choice: PhCategory, e: Event) {
  e.stopPropagation()
  if (answered.value) return
  answered.value = true
  playTick()
  emit('tap', choice === correctAnswer.value)
}
</script>

<template>
  <div class="ph-test-mission">
    <div class="label">{{ t('시료 분류') }}</div>
    <div class="strip-container">
      <div class="strip" :style="{ background: stripColor }"></div>
      <div class="strip-label">pH {{ t('시험지') }}</div>
    </div>
    <div class="btn-row">
      <button
        class="ph-btn acid"
        @pointerdown="(e) => handleChoice('ACID', e)"
      >{{ t('산성') }}</button>
      <button
        class="ph-btn neutral"
        @pointerdown="(e) => handleChoice('NEUTRAL', e)"
      >{{ t('중성') }}</button>
      <button
        class="ph-btn alkali"
        @pointerdown="(e) => handleChoice('ALKALI', e)"
      >{{ t('알칼리') }}</button>
    </div>
  </div>
</template>

<style scoped>
.ph-test-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.label {
  font-family: monospace;
  font-size: 14px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.strip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.strip {
  width: 120px;
  height: 40px;
  border: 3px solid var(--px-green-bright);
  box-shadow:
    0 0 12px var(--px-green-glow),
    inset 0 0 20px rgba(0, 0, 0, 0.4);
  transition: background 0.3s;
}

.strip-label {
  font-family: monospace;
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.btn-row {
  display: flex;
  gap: 10px;
}

.ph-btn {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  border: 2px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.ph-btn:active {
  transform: scale(0.92);
}

.ph-btn.acid {
  border-color: var(--arc-danger);
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.ph-btn.neutral {
  border-color: var(--px-green-bright);
  color: var(--px-green-bright);
}

.ph-btn.alkali {
  border-color: #6688ff;
  color: #6688ff;
  text-shadow: 0 0 8px #4466cc;
  box-shadow: 0 0 8px #4466cc44;
}
</style>

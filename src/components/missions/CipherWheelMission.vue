<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const encryptedLetter = ref('')
const targetLetter = ref('')
const correctShift = ref(0)
const choices = ref<number[]>([])

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

onMounted(() => {
  const shift = randomInt(1, 5)
  correctShift.value = shift
  const baseCode = randomInt(0, 25)
  const encCode = (baseCode + shift) % 26
  targetLetter.value = String.fromCharCode(65 + baseCode)
  encryptedLetter.value = String.fromCharCode(65 + encCode)

  const choiceSet = new Set<number>([shift])
  while (choiceSet.size < 4) {
    const r = randomInt(1, 5)
    choiceSet.add(r)
  }
  choices.value = [...choiceSet].sort((a, b) => a - b)
})

function handleChoice(n: number, e: Event) {
  e.stopPropagation()
  playTick()
  emit('tap', n === correctShift.value)
}
</script>

<template>
  <div class="cipher-wheel-mission">
    <div class="cipher-display">
      <div class="cipher-col">
        <span class="cipher-label">{{ t('암호') }}</span>
        <span class="cipher-letter bright">{{ encryptedLetter }}</span>
      </div>
      <span class="cipher-arrow">→</span>
      <div class="cipher-col">
        <span class="cipher-label">{{ t('해독') }}</span>
        <span class="cipher-letter dim">{{ targetLetter }}</span>
      </div>
    </div>

    <div class="cipher-hint">{{ t('시프트') }} = ?</div>

    <div class="cipher-choices">
      <button
        v-for="n in choices"
        :key="n"
        class="cipher-btn"
        @pointerdown="handleChoice(n, $event)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cipher-wheel-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.cipher-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cipher-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cipher-label {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.cipher-letter {
  font-size: 48px;
  font-family: monospace;
  font-weight: 700;
}

.cipher-letter.bright {
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
}

.cipher-letter.dim {
  color: var(--px-green-bright);
  opacity: 0.35;
  text-shadow: 0 0 8px var(--px-green-glow);
}

.cipher-arrow {
  font-size: 24px;
  font-family: monospace;
  color: var(--arc-muted);
  margin-top: 16px;
}

.cipher-hint {
  font-size: 14px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 3px;
}

.cipher-choices {
  display: flex;
  gap: 12px;
}

.cipher-btn {
  width: 56px;
  height: 56px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 24px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.cipher-btn:active {
  transform: scale(0.9);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 16px var(--px-green-glow);
}
</style>

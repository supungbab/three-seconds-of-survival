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

type DiffType = 'size' | 'spacing' | 'letter'

const WORDS = ['AMMO', 'FUEL', 'FOOD', 'MEDS', 'WIRE']
const LETTER_SWAPS: Record<string, string> = {
  AMMO: 'AMM0',
  FUEL: 'FVEL',
  FOOD: 'FO0D',
  MEDS: 'MED5',
  WIRE: 'W1RE',
}

const mimicIndex = ref(0)
const diffType = ref<DiffType>('letter')
const word = ref('AMMO')
const mimicWord = ref('AMM0')
let resolved = false

function getStyle(index: number): Record<string, string> {
  if (index !== mimicIndex.value) return {}

  switch (diffType.value) {
    case 'size':
      return { fontSize: '15px' }
    case 'spacing':
      return { letterSpacing: '4px' }
    default:
      return {}
  }
}

function getLabel(index: number): string {
  if (index === mimicIndex.value && diffType.value === 'letter') {
    return mimicWord.value
  }
  return word.value
}

onMounted(() => {
  mimicIndex.value = Math.floor(Math.random() * 4)

  const types: DiffType[] = ['size', 'spacing', 'letter']
  diffType.value = pickRandom(types)

  const w = pickRandom(WORDS)
  word.value = w
  mimicWord.value = LETTER_SWAPS[w] || w
})

function handleTap(index: number, e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', index === mimicIndex.value)
}
</script>

<template>
  <div class="mimic-mission">
    <div class="mimic-label">{{ t('진짜를 찾으세요') }}</div>
    <div class="item-grid">
      <button
        v-for="i in 4"
        :key="i"
        class="item-btn"
        :style="getStyle(i - 1)"
        @pointerdown="handleTap(i - 1, $event)"
      >
        {{ getLabel(i - 1) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mimic-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.mimic-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.item-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.item-btn {
  width: 100px;
  height: 64px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 18px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 2px;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.item-btn:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px var(--px-green-glow);
  background: rgba(140, 200, 144, 0.12);
}
</style>

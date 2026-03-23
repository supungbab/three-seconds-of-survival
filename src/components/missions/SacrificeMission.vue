<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface OptionData {
  item: string
  icon: string
  cost: number
}

const ITEMS = [
  { item: 'AMMO', icon: '⁍' },
  { item: 'MEDKIT', icon: '+' },
  { item: 'FOOD', icon: '◈' },
  { item: 'FUEL', icon: '▲' },
  { item: 'WATER', icon: '◇' },
  { item: 'PARTS', icon: '⊞' },
]

const optionA = ref<OptionData>({ item: 'AMMO', icon: '⁍', cost: 2 })
const optionB = ref<OptionData>({ item: 'MEDKIT', icon: '+', cost: 3 })
const correctIndex = ref(0)
const resolved = ref(false)

onMounted(() => {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5)
  const itemA = shuffled[0]
  const itemB = shuffled[1]

  const costLow = 1 + Math.floor(Math.random() * 2)
  const costHigh = costLow + 1 + Math.floor(Math.random() * 2)

  if (Math.random() < 0.5) {
    optionA.value = { ...itemA, cost: costLow }
    optionB.value = { ...itemB, cost: costHigh }
    correctIndex.value = 0
  } else {
    optionA.value = { ...itemA, cost: costHigh }
    optionB.value = { ...itemB, cost: costLow }
    correctIndex.value = 1
  }
})

function handlePick(index: number, e: Event) {
  e.stopPropagation()
  if (resolved.value) return
  resolved.value = true
  playTick()
  emit('tap', index === correctIndex.value)
}
</script>

<template>
  <div class="sacrifice-mission">
    <div class="sacrifice-label">{{ t('손실을 선택하세요') }}</div>
    <div class="options-row">
      <button class="option-card" @pointerdown="handlePick(0, $event)">
        <div class="option-icon">{{ optionA.icon }}</div>
        <div class="option-item">{{ optionA.item }}</div>
        <div class="option-cost">-{{ optionA.cost }}</div>
      </button>
      <div class="vs-divider">{{ t('또는') }}</div>
      <button class="option-card" @pointerdown="handlePick(1, $event)">
        <div class="option-icon">{{ optionB.icon }}</div>
        <div class="option-item">{{ optionB.item }}</div>
        <div class="option-cost">-{{ optionB.cost }}</div>
      </button>
    </div>
    <div class="sacrifice-hint">{{ t('낮은 비용을 선택하세요') }}</div>
  </div>
</template>

<style scoped>
.sacrifice-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.sacrifice-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.options-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-card {
  width: 110px;
  height: 120px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  transition: all 0.1s;
  box-shadow: 0 0 8px var(--px-green-glow);
}

.option-card:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px var(--px-green-glow);
  background: rgba(140, 200, 144, 0.12);
}

.option-icon {
  font-size: 28px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.option-item {
  font-size: 12px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  letter-spacing: 1px;
}

.option-cost {
  font-size: 24px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.vs-divider {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.sacrifice-hint {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}
</style>

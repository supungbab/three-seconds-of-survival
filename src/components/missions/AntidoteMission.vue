<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle, pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface PoisonEntry {
  name: string
  color: string
  antidoteName: string
  antidoteColor: string
}

const POISON_MAP: PoisonEntry[] = [
  { name: '빨강', color: '#ff3b5c', antidoteName: '초록', antidoteColor: '#39e75f' },
  { name: '파랑', color: '#4a9eff', antidoteName: '노랑', antidoteColor: '#ffd644' },
  { name: '초록', color: '#39e75f', antidoteName: '빨강', antidoteColor: '#ff3b5c' },
  { name: '보라', color: '#b44aff', antidoteName: '노랑', antidoteColor: '#ffd644' },
]

interface Vial {
  name: string
  color: string
  isCorrect: boolean
}

const poison = ref<PoisonEntry>(POISON_MAP[0])
const antidotes = ref<Vial[]>([])

onMounted(() => {
  poison.value = pickRandom(POISON_MAP)

  const correctVial: Vial = {
    name: poison.value.antidoteName,
    color: poison.value.antidoteColor,
    isCorrect: true,
  }

  // Build wrong options from other antidote colors (excluding duplicates)
  const allColors = [
    { name: '빨강', color: '#ff3b5c' },
    { name: '파랑', color: '#4a9eff' },
    { name: '초록', color: '#39e75f' },
    { name: '노랑', color: '#ffd644' },
    { name: '보라', color: '#b44aff' },
  ]

  const wrongOptions = allColors
    .filter((c) => c.name !== correctVial.name)
    .map((c) => ({ name: c.name, color: c.color, isCorrect: false }))

  const picked = shuffle(wrongOptions).slice(0, 2 + Math.floor(Math.random() * 2))
  antidotes.value = shuffle([correctVial, ...picked])
})

function handleTap(e: Event, vial: Vial) {
  e.stopPropagation()
  playTick()
  emit('tap', vial.isCorrect)
}
</script>

<template>
  <div class="antidote-mission">
    <div class="antidote-header">{{ t('[ 해독제 선택 ]') }}</div>

    <div class="poison-display">
      <div class="vial-icon poison" :style="{ '--vial-color': poison.color }">
        <div class="vial-body" />
        <div class="vial-cap" />
      </div>
      <div class="poison-label">
        {{ t('독: ') }}<span :style="{ color: poison.color }">{{ poison.name }}</span>
      </div>
    </div>

    <div class="antidote-options">
      <button
        v-for="(vial, i) in antidotes"
        :key="i"
        class="antidote-btn"
        :style="{ '--vial-color': vial.color }"
        @pointerdown="(e) => handleTap(e, vial)"
      >
        <div class="vial-icon small">
          <div class="vial-body" />
          <div class="vial-cap" />
        </div>
        <span class="antidote-label">{{ vial.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.antidote-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.antidote-header {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.poison-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.poison-label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}

.poison-label span {
  font-weight: 700;
  text-shadow: 0 0 8px currentColor;
}

.vial-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vial-icon.poison .vial-body {
  width: 28px;
  height: 40px;
  background: var(--vial-color);
  border: 2px solid var(--vial-color);
  border-radius: 0;
  box-shadow: 0 0 12px var(--vial-color);
  opacity: 0.85;
}

.vial-icon.poison .vial-cap {
  width: 16px;
  height: 8px;
  background: #555;
  border: 1px solid #777;
  border-radius: 0;
  margin-top: -1px;
  order: -1;
}

.vial-icon.small .vial-body {
  width: 20px;
  height: 28px;
  background: var(--vial-color);
  border: 2px solid var(--vial-color);
  border-radius: 0;
  box-shadow: 0 0 8px var(--vial-color);
  opacity: 0.85;
}

.vial-icon.small .vial-cap {
  width: 12px;
  height: 6px;
  background: #555;
  border: 1px solid #777;
  border-radius: 0;
  margin-top: -1px;
  order: -1;
}

.antidote-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.antidote-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--px-green-bg);
  border: 2px solid #333;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s;
}

.antidote-btn:active {
  transform: scale(0.92);
  border-color: var(--vial-color);
}

.antidote-label {
  font-family: monospace;
  font-size: 10px;
  color: var(--vial-color);
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 6px var(--vial-color);
}
</style>

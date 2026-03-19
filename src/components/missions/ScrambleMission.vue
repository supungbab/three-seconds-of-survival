<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const props = defineProps<{
  scrambleWord: string
  scrambleLetters: string[]
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const currentIndex = ref(0)
const usedIndices = ref<Set<number>>(new Set())
let resolved = false

const revealedWord = computed(() =>
  props.scrambleWord
    .split('')
    .map((ch, i) => (i < currentIndex.value ? ch : '▒'))
    .join('')
)

function handleTap(letter: string, idx: number, e: Event) {
  e.stopPropagation()
  if (resolved || usedIndices.value.has(idx)) return

  const expected = props.scrambleWord[currentIndex.value]
  if (letter === expected) {
    playTick()
    usedIndices.value.add(idx)
    currentIndex.value++
    if (currentIndex.value >= props.scrambleWord.length) {
      resolved = true
      emit('tap', true)
    }
  } else {
    resolved = true
    emit('tap', false)
  }
}
</script>

<template>
  <div class="scramble-mission">
    <div class="scramble-target">
      <span
        v-for="(ch, i) in revealedWord.split('')"
        :key="i"
        class="scramble-char"
        :class="{ revealed: i < currentIndex }"
      >{{ ch }}</span>
    </div>

    <div class="scramble-letters">
      <button
        v-for="(letter, idx) in scrambleLetters"
        :key="idx"
        class="scramble-btn"
        :class="{ used: usedIndices.has(idx) }"
        :disabled="usedIndices.has(idx)"
        @pointerdown="(e) => handleTap(letter, idx, e)"
      >
        {{ letter }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scramble-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.scramble-target {
  display: flex;
  gap: 4px;
  font-size: 28px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 4px;
}

.scramble-char {
  color: var(--arc-muted);
  text-shadow: none;
  min-width: 24px;
  text-align: center;
}

.scramble-char.revealed {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.scramble-letters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.scramble-btn {
  width: 44px;
  height: 44px;
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 20px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow:
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.scramble-btn:active {
  transform: scale(0.9);
}

.scramble-btn.used {
  opacity: 0.2;
  border-color: var(--arc-muted);
  color: var(--arc-muted);
  text-shadow: none;
  cursor: default;
}
</style>

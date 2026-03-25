<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  knockPattern: number[]
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const phase = ref<'playing' | 'choosing'>('playing')
const flashActive = ref(false)
const correctOptionIndex = ref(0)
const options = ref<number[][]>([])
const timers: ReturnType<typeof setTimeout>[] = []

function shufflePattern(pattern: number[]): number[] {
  const shuffled = shuffle(pattern)
  // Make sure it's actually different
  if (shuffled.every((v, idx) => v === pattern[idx])) {
    shuffled.reverse()
  }
  return shuffled
}

onMounted(() => {
  // Play the knock pattern
  let elapsed = 0
  props.knockPattern.forEach((interval, i) => {
    elapsed += i === 0 ? 300 : interval
    const t = setTimeout(() => {
      flashActive.value = true
      playTick()
      const t2 = setTimeout(() => {
        flashActive.value = false
      }, 100)
      timers.push(t2)
    }, elapsed)
    timers.push(t)
  })

  // After pattern plays, show choices
  const totalTime = props.knockPattern.reduce((a, b) => a + b, 300)
  const t = setTimeout(() => {
    phase.value = 'choosing'
    const wrong = shufflePattern(props.knockPattern)
    correctOptionIndex.value = Math.random() < 0.5 ? 0 : 1
    if (correctOptionIndex.value === 0) {
      options.value = [props.knockPattern, wrong]
    } else {
      options.value = [wrong, props.knockPattern]
    }
  }, totalTime + 400)
  timers.push(t)
})

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t))
})

function handleChoice(e: Event, index: number) {
  e.stopPropagation()
  playTick()
  emit('tap', index === correctOptionIndex.value)
}

function patternToDots(pattern: number[]): string[] {
  const min = Math.min(...pattern)
  return pattern.map(v => v <= min * 1.3 ? '·' : '—')
}
</script>

<template>
  <div class="trust-knock-mission">
    <div v-if="phase === 'playing'" class="knock-phase">
      <div class="knock-label">{{ t('듣는 중...') }}</div>
      <div class="knock-flash" :class="{ active: flashActive }">◈</div>
    </div>
    <div v-else class="choose-phase">
      <div class="choose-label">{{ t('어떤 패턴?') }}</div>
      <div class="options-row">
        <button
          v-for="(opt, i) in options"
          :key="i"
          class="pattern-option"
          @pointerdown="(e) => handleChoice(e, i)"
        >
          <span v-for="(dot, j) in patternToDots(opt)" :key="j" class="dot">{{ dot }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trust-knock-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.knock-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.knock-label,
.choose-label {
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.knock-flash {
  font-size: 48px;
  font-family: monospace;
  color: var(--arc-muted);
  transition: all 0.05s;
}

.knock-flash.active {
  color: var(--px-green-bright);
  text-shadow: 0 0 24px var(--px-green-glow);
}

.choose-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.options-row {
  display: flex;
  gap: 20px;
}

.pattern-option {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  cursor: pointer;
  box-shadow: 0 0 8px var(--px-green-glow);
  transition: all 0.1s;
}

.pattern-option:active {
  transform: scale(0.92);
  background: rgba(140, 200, 144, 0.15);
}

.dot {
  font-size: 24px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}
</style>

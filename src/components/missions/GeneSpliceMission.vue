<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const containerEl = ref<HTMLElement | null>(null)

type Base = { letter: string; mutant: boolean }
const sequence = ref<Base[]>([])
const mutantStart = ref(0)
const mutantEnd = ref(0)
const swipeStart = ref(-1)
const swipeEnd = ref(-1)
let resolved = false

const BASES = ['A', 'C', 'G', 'T']

onMounted(() => {
  const len = 9
  const mStart = 2 + Math.floor(Math.random() * 4)
  const mLen = 2 + Math.floor(Math.random() * 2)
  mutantStart.value = mStart
  mutantEnd.value = mStart + mLen - 1

  const seq: Base[] = []
  for (let i = 0; i < len; i++) {
    seq.push({
      letter: pickRandom(BASES),
      mutant: i >= mStart && i <= mStart + mLen - 1,
    })
  }
  sequence.value = seq

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd, { passive: false })
  el.addEventListener('mousedown', onStart)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseup', onEnd)
})

function getBaseIndex(e: TouchEvent | MouseEvent): number {
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const el = containerEl.value
  if (!el) return -1
  const bases = el.querySelectorAll('.base')
  for (let i = 0; i < bases.length; i++) {
    const rect = bases[i].getBoundingClientRect()
    if (clientX >= rect.left && clientX <= rect.right) return i
  }
  return -1
}

function onStart(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  swipeStart.value = getBaseIndex(e)
  swipeEnd.value = swipeStart.value
}

function onMove(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved || swipeStart.value < 0) return
  swipeEnd.value = getBaseIndex(e)
}

function onEnd(e: TouchEvent | MouseEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved || swipeStart.value < 0) return
  resolved = true

  const sMin = Math.min(swipeStart.value, swipeEnd.value)
  const sMax = Math.max(swipeStart.value, swipeEnd.value)

  if (sMin === mutantStart.value && sMax === mutantEnd.value) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onUnmounted(() => {
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onStart)
  el.removeEventListener('touchmove', onMove)
  el.removeEventListener('touchend', onEnd)
  el.removeEventListener('mousedown', onStart)
  el.removeEventListener('mousemove', onMove)
  el.removeEventListener('mouseup', onEnd)
})
</script>

<template>
  <div ref="containerEl" class="gene-mission">
    <div class="label">{{ t('변이 구간을 잘라내세요') }}</div>
    <div class="dna-strip">
      <div
        v-for="(base, i) in sequence"
        :key="i"
        class="base"
        :class="{
          mutant: base.mutant,
          swiped: swipeStart >= 0 && i >= Math.min(swipeStart, swipeEnd) && i <= Math.max(swipeStart, swipeEnd),
        }"
      >
        {{ base.letter }}
      </div>
    </div>
    <div class="hint">{{ t('강조된 염기를 스와이프하세요') }}</div>
  </div>
</template>

<style scoped>
.gene-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 24px;
  gap: 14px;
  min-height: 180px;
  touch-action: none;
}

.label {
  font-size: 14px;
  color: var(--arc-muted);
}

.dna-strip {
  display: flex;
  gap: 2px;
}

.base {
  width: 30px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--px-green-bright);
  background: #0c140c;
  border: 2px solid var(--px-green-bg);
  user-select: none;
  border-radius: 0;
}

.base.mutant {
  color: var(--arc-danger);
  border-color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  background: rgba(255, 59, 92, 0.08);
}

.base.swiped {
  background: rgba(140, 200, 144, 0.2);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 13px;
  color: var(--arc-muted);
}
</style>

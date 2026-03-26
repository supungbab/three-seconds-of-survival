<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface BootLine {
  text: string
  isError: boolean
}

const ALL_LINES: BootLine[] = [
  { text: 'MEM ........ OK', isError: false },
  { text: 'CPU ........ OK', isError: false },
  { text: 'DISK ....... OK', isError: false },
  { text: 'GPU ........ OK', isError: false },
  { text: 'USB ........ OK', isError: false },
  { text: 'NET ........ ERROR', isError: true },
  { text: 'BIOS ....... OK', isError: false },
  { text: 'CACHE ...... OK', isError: false },
  { text: 'I/O ........ OK', isError: false },
  { text: 'SND ........ OK', isError: false },
]

const visibleLines = ref<BootLine[]>([])
const currentIndex = ref(0)
const shuffled = ref<BootLine[]>([])
let timer: ReturnType<typeof setInterval> | null = null
let resolved = false

onMounted(() => {
  shuffled.value = shuffle(ALL_LINES).slice(0, 8)
  // Ensure at least one error exists
  if (!shuffled.value.some((l) => l.isError)) {
    const idx = Math.floor(Math.random() * shuffled.value.length)
    shuffled.value[idx] = { text: 'NET ........ ERROR', isError: true }
  }
  timer = setInterval(() => {
    if (currentIndex.value < shuffled.value.length) {
      visibleLines.value.push(shuffled.value[currentIndex.value])
      currentIndex.value++
    } else if (timer) {
      clearInterval(timer)
    }
  }, 200)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function handleTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  const lastLine = visibleLines.value[visibleLines.value.length - 1]
  emit('tap', lastLine?.isError === true)
}
</script>

<template>
  <div class="boot-sequence-mission" @pointerdown="handleTap">
    <div class="boot-header">{{ t('[ 시스템 POST ]') }}</div>
    <div class="boot-log">
      <div
        v-for="(line, i) in visibleLines"
        :key="i"
        class="boot-line"
        :class="{ error: line.isError }"
      >
        {{ line.text }}
      </div>
      <span class="cursor-blink">_</span>
    </div>
    <div class="boot-hint">{{ t('오류 발생 시 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.boot-sequence-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  cursor: pointer;
}

.boot-header {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.boot-log {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-width: 260px;
  min-height: 120px;
  padding: 8px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
}

.boot-line {
  font-size: 12px;
  color: var(--px-green-bright);
  text-shadow: 0 0 4px var(--px-green-glow);
  animation: line-appear 0.1s ease-out;
  white-space: nowrap;
}

.boot-line.error {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  font-weight: 700;
}

.cursor-blink {
  font-size: 14px;
  color: var(--px-green-bright);
  animation: blink 0.5s step-end infinite;
}

.boot-hint {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}

@keyframes line-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>

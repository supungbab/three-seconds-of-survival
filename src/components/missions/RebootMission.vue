<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const line1 = ref('')
const line2 = ref('')
const showButtons = ref(false)
let resolved = false
let timer1: ReturnType<typeof setTimeout> | null = null
let timer2: ReturnType<typeof setTimeout> | null = null
const timers: ReturnType<typeof setTimeout>[] = []

const TEXT1 = t('시스템 장애')
const TEXT2 = t('재부팅? [Y/N]')

function typewrite(text: string, target: typeof line1, delay: number): Promise<void> {
  return new Promise((resolve) => {
    let i = 0
    function next() {
      if (i < text.length) {
        target.value += text[i]
        i++
        const t = setTimeout(next, 40)
        timers.push(t)
      } else {
        const t = setTimeout(resolve, delay)
        timers.push(t)
      }
    }
    next()
  })
}

onMounted(async () => {
  await typewrite(TEXT1, line1, 200)
  await typewrite(TEXT2, line2, 0)
  showButtons.value = true
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
  if (timer1) clearTimeout(timer1)
  if (timer2) clearTimeout(timer2)
})

function handleChoice(choice: 'Y' | 'N', e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', choice === 'Y')
}
</script>

<template>
  <div class="reboot-mission">
    <div class="reboot-terminal">
      <div class="reboot-line fail">{{ line1 }}<span class="cursor" v-if="!line2">█</span></div>
      <div class="reboot-line prompt" v-if="line2">{{ line2 }}<span class="cursor" v-if="!showButtons">█</span></div>
    </div>

    <div v-if="showButtons" class="reboot-buttons">
      <button class="reboot-btn yes" @pointerdown="(e) => handleChoice('Y', e)">Y</button>
      <button class="reboot-btn no" @pointerdown="(e) => handleChoice('N', e)">N</button>
    </div>
  </div>
</template>

<style scoped>
.reboot-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.reboot-terminal {
  font-family: monospace;
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  min-width: 200px;
}

.reboot-line.fail {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
  font-weight: 700;
}

.reboot-line.prompt {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.cursor {
  animation: blink-cursor 0.6s step-end infinite;
  color: var(--px-green-bright);
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.reboot-buttons {
  display: flex;
  gap: 16px;
}

.reboot-btn {
  width: 56px;
  height: 56px;
  font-size: 28px;
  font-family: monospace;
  font-weight: 700;
  border-radius: 0;
  cursor: pointer;
  background: var(--px-green-bg);
  box-shadow:
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.reboot-btn.yes {
  color: var(--px-green-bright);
  border: 2px solid var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.reboot-btn.no {
  color: var(--arc-danger);
  border: 2px solid var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.reboot-btn:active {
  transform: scale(0.9);
}
</style>

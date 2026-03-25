<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle, pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false
let glitchInterval: ReturnType<typeof setInterval> | null = null

const GLITCH_CHARS = '!@#$%^&*<>?/\\|[]{}~`_=+-'
const FAKE_LABELS = ['OPEN', 'SEND', 'EXEC', 'LINK', 'SCAN', 'DUMP', 'HALT', 'BOOT']

interface ButtonData {
  id: number
  isReal: boolean
  label: string
  glitchLabel: string
  offsetX: number
  offsetY: number
}

const buttons = ref<ButtonData[]>([])

function randomGlitch(len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
  }
  return s
}

onMounted(() => {
  const count = 5
  const realIndex = Math.floor(Math.random() * count)
  const shuffled = shuffle([...FAKE_LABELS])

  const generated: ButtonData[] = []
  for (let i = 0; i < count; i++) {
    generated.push({
      id: i,
      isReal: i === realIndex,
      label: i === realIndex ? 'REAL' : shuffled[i % shuffled.length],
      glitchLabel: randomGlitch(4),
      offsetX: 0,
      offsetY: 0,
    })
  }
  buttons.value = generated

  glitchInterval = setInterval(() => {
    for (const btn of buttons.value) {
      if (!btn.isReal) {
        btn.glitchLabel = randomGlitch(4)
        btn.label = Math.random() > 0.3
          ? randomGlitch(4)
          : pickRandom(FAKE_LABELS)
        btn.offsetX = (Math.random() - 0.5) * 6
        btn.offsetY = (Math.random() - 0.5) * 4
      } else {
        btn.offsetX = (Math.random() - 0.5) * 1
        btn.offsetY = (Math.random() - 0.5) * 1
      }
    }
  }, 120)
})

function onButtonTap(e: TouchEvent | MouseEvent, btn: ButtonData) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  if (resolved) return
  resolved = true

  if (glitchInterval) {
    clearInterval(glitchInterval)
    glitchInterval = null
  }

  if (btn.isReal) {
    playTick()
  }
  emit('tap', btn.isReal)
}

onUnmounted(() => {
  if (glitchInterval) {
    clearInterval(glitchInterval)
    glitchInterval = null
  }
})
</script>

<template>
  <div class="noise-jam-mission">
    <div class="noise-label">{{ t('신호 찾기') }}</div>
    <div class="noise-grid">
      <div
        v-for="btn in buttons"
        :key="btn.id"
        class="noise-btn"
        :class="{ real: btn.isReal }"
        :style="{
          transform: `translate(${btn.offsetX}px, ${btn.offsetY}px)`,
        }"
        @touchstart.stop.prevent="onButtonTap($event, btn)"
        @mousedown.stop.prevent="onButtonTap($event, btn)"
      >
        <span class="btn-label">{{ btn.label }}</span>
        <span v-if="!btn.isReal" class="btn-glitch">{{ btn.glitchLabel }}</span>
      </div>
    </div>
    <div class="noise-hint">{{ t('진짜 신호를 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.noise-jam-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
}

.noise-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.noise-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 300px;
}

.noise-btn {
  position: relative;
  padding: 10px 18px;
  background: #0c140c;
  border: 2px solid var(--arc-danger);
  font-family: monospace;
  font-size: 14px;
  color: var(--arc-danger);
  cursor: pointer;
  min-width: 80px;
  text-align: center;
  overflow: hidden;
  animation: btn-flicker 0.15s infinite alternate;
  text-shadow: 0 0 6px var(--arc-danger-glow);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.noise-btn.real {
  border-color: var(--px-green-bright);
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
  box-shadow: 0 0 4px var(--px-green-glow);
  animation: btn-stable 2s ease-in-out infinite alternate;
}

.btn-label {
  position: relative;
  z-index: 1;
}

.btn-glitch {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 14px;
  color: var(--arc-danger);
  opacity: 0.4;
  mix-blend-mode: screen;
  pointer-events: none;
}

.noise-hint {
  font-size: 12px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

@keyframes btn-flicker {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

@keyframes btn-stable {
  from { opacity: 0.85; }
  to { opacity: 1; }
}
</style>

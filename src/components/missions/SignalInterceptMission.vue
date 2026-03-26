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

const KEYWORDS = ['SOS', 'EVAC', 'HELP', 'SAFE']
const keyword = pickRandom(KEYWORDS)

const tickerEl = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
let animFrame = 0
let resolved = false

// Build ticker text: random chars with keyword embedded
function buildTicker(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*'
  let text = ''
  for (let i = 0; i < 8; i++) {
    text += chars[Math.floor(Math.random() * chars.length)]
  }
  text += keyword
  for (let i = 0; i < 20; i++) {
    text += chars[Math.floor(Math.random() * chars.length)]
  }
  return text
}

const tickerText = buildTicker()
const SPEED = 150 // px per second
let lastTime = 0

function animate(time: number) {
  if (lastTime === 0) lastTime = time
  const dt = (time - lastTime) / 1000
  lastTime = time
  scrollOffset.value += SPEED * dt
  animFrame = requestAnimationFrame(animate)
}

function handleTap(e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()

  // Check if keyword is visible in viewport using scroll offset
  // Each char ≈ charWidth px (monospace 24px + 3px letter-spacing)
  const charWidth = 17.4
  const viewportWidth = 200
  const keywordStart = 8 * charWidth
  const keywordEnd = (8 + keyword.length) * charWidth
  const visibleLeft = scrollOffset.value - 200 // text starts at translateX(200)
  const visibleRight = visibleLeft + viewportWidth

  const keywordVisible = keywordEnd > visibleLeft && keywordStart < visibleRight
  emit('tap', keywordVisible)
}

onMounted(() => {
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="signal-intercept-mission" @pointerdown="handleTap">
    <div class="signal-label">{{ t('신호 가로채기') }}</div>
    <div class="ticker-viewport">
      <div
        ref="tickerEl"
        class="ticker-content"
        :style="{ transform: `translateX(${200 - scrollOffset}px)` }"
      >
        <span class="ticker-char">{{ tickerText }}</span>
      </div>
    </div>
    <div class="signal-hint">{{ t(`「${keyword}」이 보일 때 탭하세요`) }}</div>
  </div>
</template>

<style scoped>
.signal-intercept-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  touch-action: none;
  cursor: pointer;
}

.signal-label {
  font-size: 14px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.ticker-viewport {
  width: 200px;
  height: 40px;
  overflow: hidden;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  background: var(--px-green-bg);
  display: flex;
  align-items: center;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.ticker-content {
  white-space: nowrap;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 3px;
}

.ticker-char {
  color: var(--px-green-bright);
  text-shadow: 0 0 4px var(--px-green-glow);
}

.signal-hint {
  font-size: 12px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 1px;
}
</style>

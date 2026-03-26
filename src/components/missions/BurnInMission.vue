<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface ButtonInfo {
  label: string
  x: number
  y: number
  isReal: boolean
}

const buttons = ref<ButtonInfo[]>([])

const ghostLabels = ['OK', 'ENTER', 'RUN', 'EXIT']
const realLabel = 'EXEC'

onMounted(() => {
  const positions: { x: number; y: number }[] = []

  function genPos(): { x: number; y: number } {
    let attempts = 0
    while (attempts < 50) {
      const x = 10 + Math.random() * 65
      const y = 10 + Math.random() * 60
      const tooClose = positions.some(
        (p) => Math.abs(p.x - x) < 22 && Math.abs(p.y - y) < 22
      )
      if (!tooClose) {
        positions.push({ x, y })
        return { x, y }
      }
      attempts++
    }
    const fallback = { x: 10 + Math.random() * 65, y: 10 + Math.random() * 60 }
    positions.push(fallback)
    return fallback
  }

  const realIdx = Math.floor(Math.random() * 5)
  const allBtns: ButtonInfo[] = []

  for (let i = 0; i < 5; i++) {
    const pos = genPos()
    if (i === realIdx) {
      allBtns.push({ label: realLabel, ...pos, isReal: true })
    } else {
      const gLabel = ghostLabels[i < realIdx ? i : i - 1] ?? ghostLabels[0]
      allBtns.push({ label: gLabel, ...pos, isReal: false })
    }
  }

  buttons.value = allBtns
})

function handleTap(e: Event, btn: ButtonInfo) {
  e.stopPropagation()
  playTick()
  emit('tap', btn.isReal)
}
</script>

<template>
  <div class="burn-in-mission">
    <div class="hint-label">{{ t('진짜 버튼을 탭하세요') }}</div>
    <div class="burn-screen">
      <button
        v-for="(btn, i) in buttons"
        :key="i"
        class="screen-btn"
        :class="{ ghost: !btn.isReal, real: btn.isReal }"
        :style="{ left: `${btn.x}%`, top: `${btn.y}%` }"
        @pointerdown.stop="(e: Event) => handleTap(e, btn)"
      >
        {{ btn.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.burn-in-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.hint-label {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.burn-screen {
  position: relative;
  width: 240px;
  height: 160px;
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  overflow: hidden;
}

.screen-btn {
  position: absolute;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 0;
  cursor: pointer;
  border: 2px solid;
  white-space: nowrap;
}

.screen-btn:active {
  transform: scale(0.9);
}

.screen-btn.ghost {
  color: rgba(200, 190, 120, 0.25);
  border-color: rgba(200, 190, 120, 0.15);
  background: transparent;
  text-shadow: none;
  animation: ghost-flicker 4s ease-in-out infinite;
}

.screen-btn.ghost:nth-child(2) { animation-delay: -0.8s; }
.screen-btn.ghost:nth-child(3) { animation-delay: -1.6s; }
.screen-btn.ghost:nth-child(4) { animation-delay: -2.4s; }

.screen-btn.real {
  color: var(--px-green-bright);
  border-color: var(--px-green-bright);
  background: var(--px-green-bg);
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 12px var(--px-green-glow);
}

@keyframes ghost-flicker {
  0%, 100% { opacity: 0.25; }
  20% { opacity: 0.3; }
  40% { opacity: 0.15; }
  60% { opacity: 0.28; }
  80% { opacity: 0.12; }
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const flashCount = ref(0)
const beaconOn = ref(false)
const showButtons = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

onMounted(() => {
  const count = randomInt(2, 5)
  flashCount.value = count

  const ON_MS = 300
  const OFF_MS = 300
  const CYCLE = ON_MS + OFF_MS

  for (let i = 0; i < count; i++) {
    timers.push(setTimeout(() => {
      beaconOn.value = true
    }, i * CYCLE))
    timers.push(setTimeout(() => {
      beaconOn.value = false
    }, i * CYCLE + ON_MS))
  }

  timers.push(setTimeout(() => {
    showButtons.value = true
  }, count * CYCLE + 200))
})

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t))
})

function handleChoice(n: number, e: Event) {
  e.stopPropagation()
  playTick()
  emit('tap', n === flashCount.value)
}
</script>

<template>
  <div class="beacon-mission">
    <div class="beacon-label">{{ t('점멸 횟수를 세세요') }}</div>

    <div class="beacon-light" :class="{ on: beaconOn }">
      <span class="beacon-core">●</span>
    </div>

    <div v-if="showButtons" class="beacon-choices">
      <button
        v-for="n in [2, 3, 4, 5]"
        :key="n"
        class="beacon-btn"
        @pointerdown="handleChoice(n, $event)"
      >
        {{ n }}
      </button>
    </div>
    <div v-else class="beacon-wait">{{ t('관측 중...') }}</div>
  </div>
</template>

<style scoped>
.beacon-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.beacon-label {
  font-size: 13px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.beacon-light {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  background: var(--px-green-bg);
  transition: all 0.08s;
}

.beacon-core {
  font-size: 40px;
  font-family: monospace;
  color: #1a2a1a;
  transition: all 0.08s;
}

.beacon-light.on {
  background: rgba(140, 200, 144, 0.25);
  box-shadow: 0 0 32px var(--px-green-glow), 0 0 64px var(--px-green-glow);
}

.beacon-light.on .beacon-core {
  color: var(--px-green-bright);
  text-shadow: 0 0 20px var(--px-green-glow), 0 0 40px var(--px-green-glow);
}

.beacon-wait {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: blink-wait 0.8s infinite;
}

@keyframes blink-wait {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.beacon-choices {
  display: flex;
  gap: 12px;
}

.beacon-btn {
  width: 56px;
  height: 56px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 24px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.beacon-btn:active {
  transform: scale(0.9);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 16px var(--px-green-glow);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  semaphoreLeft: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  semaphoreRight: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const ARROWS: Record<string, string> = {
  UP: '▲',
  DOWN: '▼',
  LEFT: '◄',
  RIGHT: '►',
}

const phase = ref<'left' | 'right'>('left')
const leftDone = ref(false)

function handleDirection(dir: string, e: Event) {
  e.stopPropagation()
  playTick()

  if (phase.value === 'left') {
    if (dir === props.semaphoreLeft) {
      leftDone.value = true
      phase.value = 'right'
    } else {
      emit('tap', false)
    }
  } else {
    if (dir === props.semaphoreRight) {
      emit('tap', true)
    } else {
      emit('tap', false)
    }
  }
}
</script>

<template>
  <div class="semaphore-mission">
    <div class="signal-display">
      <div class="flag-group">
        <span class="flag-label">{{ t('좌') }}</span>
        <span class="flag-arrow" :class="{ done: leftDone }">{{ ARROWS[semaphoreLeft] }}</span>
      </div>
      <div class="flag-divider">┃</div>
      <div class="flag-group">
        <span class="flag-label">{{ t('우') }}</span>
        <span class="flag-arrow dim">{{ ARROWS[semaphoreRight] }}</span>
      </div>
    </div>

    <div class="phase-label">
      {{ phase === 'left' ? `◄ ${t('왼손')}` : `${t('오른손')} ►` }}
    </div>

    <div class="direction-grid">
      <button
        v-for="dir in ['UP', 'DOWN', 'LEFT', 'RIGHT']"
        :key="dir"
        class="dir-btn"
        @pointerdown="handleDirection(dir, $event)"
      >
        {{ ARROWS[dir] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.semaphore-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.signal-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.flag-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.flag-label {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.flag-arrow {
  font-size: 36px;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.flag-arrow.done {
  opacity: 0.3;
}

.flag-arrow.dim {
  opacity: 0.4;
}

.flag-divider {
  font-size: 28px;
  color: var(--arc-muted);
}

.phase-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.direction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.dir-btn {
  width: 64px;
  height: 64px;
  background: var(--px-green-bg);
  border: 3px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.dir-btn:active {
  transform: scale(0.9);
  background: rgba(140, 200, 144, 0.15);
  box-shadow: 0 0 16px var(--px-green-glow);
}
</style>

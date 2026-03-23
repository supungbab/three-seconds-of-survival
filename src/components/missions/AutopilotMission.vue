<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'

const drift = ref<Direction>('LEFT')
const correctDir = ref<Direction>('RIGHT')
const answered = ref(false)

const driftMap: Record<Direction, Direction> = {
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  UP: 'DOWN',
  DOWN: 'UP',
}

const driftOffsets: Record<Direction, { x: number; y: number }> = {
  LEFT: { x: -30, y: 0 },
  RIGHT: { x: 30, y: 0 },
  UP: { x: 0, y: -30 },
  DOWN: { x: 0, y: 30 },
}

onMounted(() => {
  const dirs: Direction[] = ['LEFT', 'RIGHT', 'UP', 'DOWN']
  drift.value = dirs[Math.floor(Math.random() * dirs.length)]
  correctDir.value = driftMap[drift.value]
})

function handleDir(dir: Direction, e: Event) {
  e.stopPropagation()
  if (answered.value) return
  answered.value = true
  playTick()
  emit('tap', dir === correctDir.value)
}
</script>

<template>
  <div class="autopilot-mission">
    <div class="label">{{ t('항로 수정') }}</div>
    <div class="compass">
      <div class="target-arrow">▲</div>
      <div
        class="current-arrow"
        :style="{
          transform: `translate(${driftOffsets[drift].x}px, ${driftOffsets[drift].y}px)`
        }"
      >▲</div>
    </div>
    <div class="dir-btns">
      <div class="dir-row">
        <button class="dir-btn" @pointerdown="(e) => handleDir('UP', e)">↑</button>
      </div>
      <div class="dir-row">
        <button class="dir-btn" @pointerdown="(e) => handleDir('LEFT', e)">←</button>
        <div class="dir-spacer"></div>
        <button class="dir-btn" @pointerdown="(e) => handleDir('RIGHT', e)">→</button>
      </div>
      <div class="dir-row">
        <button class="dir-btn" @pointerdown="(e) => handleDir('DOWN', e)">↓</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.autopilot-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.label {
  font-family: monospace;
  font-size: 13px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.compass {
  width: 100px;
  height: 100px;
  border: 3px solid var(--px-green-bright);
  background: var(--px-green-bg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px var(--px-green-glow);
}

.target-arrow {
  font-family: monospace;
  font-size: 28px;
  color: var(--arc-muted);
  opacity: 0.3;
  position: absolute;
}

.current-arrow {
  font-family: monospace;
  font-size: 28px;
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
  position: absolute;
  transition: transform 0.3s;
}

.dir-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dir-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dir-spacer {
  width: 48px;
  height: 48px;
}

.dir-btn {
  width: 48px;
  height: 48px;
  font-family: monospace;
  font-size: 22px;
  font-weight: 700;
  border: 2px solid var(--px-green-bright);
  background: var(--px-green-bg);
  color: var(--px-green-bright);
  cursor: pointer;
  text-shadow: 0 0 8px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dir-btn:active {
  transform: scale(0.9);
}
</style>

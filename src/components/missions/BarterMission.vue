<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  barterLeft: number
  barterRight: number
  barterFair: boolean
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false

function handleChoice(isFair: boolean, e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', isFair === props.barterFair)
}
</script>

<template>
  <div class="barter-mission">
    <div class="barter-label">{{ t('공정한가?') }}</div>

    <div class="barter-sides">
      <div class="barter-side">
        <span v-for="i in barterLeft" :key="'l' + i" class="barter-item">■</span>
      </div>
      <div class="barter-divider">⇄</div>
      <div class="barter-side">
        <span v-for="i in barterRight" :key="'r' + i" class="barter-item">■</span>
      </div>
    </div>

    <div class="barter-buttons">
      <button class="barter-btn fair" @pointerdown="(e) => handleChoice(true, e)">✓</button>
      <button class="barter-btn unfair" @pointerdown="(e) => handleChoice(false, e)">✗</button>
    </div>
  </div>
</template>

<style scoped>
.barter-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.barter-label {
  font-size: 22px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
  letter-spacing: 6px;
}

.barter-sides {
  display: flex;
  align-items: center;
  gap: 16px;
}

.barter-side {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  min-width: 60px;
}

.barter-item {
  font-size: 20px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.barter-divider {
  font-size: 24px;
  font-family: monospace;
  color: var(--arc-muted);
}

.barter-buttons {
  display: flex;
  gap: 16px;
}

.barter-btn {
  width: 56px;
  height: 56px;
  border-radius: 0;
  font-size: 28px;
  font-family: monospace;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid;
  background: var(--px-green-bg);
  box-shadow:
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.barter-btn.fair {
  color: var(--px-green-bright);
  border-color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.barter-btn.unfair {
  color: var(--arc-danger);
  border-color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

.barter-btn:active {
  transform: scale(0.9);
}
</style>

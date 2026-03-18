<script setup lang="ts">
import { usePressable } from '@/composables/usePressable'

defineProps<{
  score: number
  bestScore: number
}>()

const emit = defineEmits<{
  restart: []
  home: []
}>()

const restart = usePressable(() => emit('restart'))
const home = usePressable(() => emit('home'))
</script>

<template>
  <div class="result-overlay" :class="{ show: true }">
    <div class="result-card fade-in">
      <div class="result-label">GAME OVER</div>
      <div class="result-score">{{ score }}</div>
      <div class="result-best">
        최고 기록: <span class="best-value">{{ bestScore }}</span>
      </div>
      <div v-if="score >= bestScore && score > 0" class="new-record">
        NEW RECORD!
      </div>
      <div class="result-actions">
        <button class="arc-btn arc-btn--primary" @click="restart.onClick">
          다시 하기
        </button>
        <button class="arc-btn arc-btn--ghost" @click="home.onClick">
          홈으로
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 15, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.result-overlay.show {
  pointer-events: all;
  opacity: 1;
}

.result-card {
  background: var(--arc-surface);
  border: 2px solid var(--arc-surface-light);
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
  width: 100%;
  max-width: 320px;
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.result-label {
  font-size: 16px;
  color: var(--arc-muted);
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.result-score {
  font-size: 72px;
  font-weight: 900;
  color: var(--arc-amber);
  line-height: 1;
  margin-bottom: 12px;
  text-shadow:
    0 0 24px var(--arc-amber-glow),
    0 0 60px rgba(255, 184, 0, 0.15);
}

.result-best {
  font-size: 14px;
  color: var(--arc-muted);
  margin-bottom: 8px;
}

.best-value {
  color: var(--arc-green);
  font-weight: 700;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.3);
}

.new-record {
  font-size: 18px;
  font-weight: 900;
  color: var(--arc-amber);
  text-shadow:
    0 0 12px var(--arc-amber-glow),
    0 0 30px rgba(255, 184, 0, 0.2);
  margin-bottom: 16px;
  animation: pulse 0.6s ease-in-out infinite;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.arc-btn {
  padding: 14px 24px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Galmuri11', monospace;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.arc-btn:active {
  transform: scale(0.95);
}

.arc-btn--primary {
  background: rgba(57, 255, 20, 0.08);
  color: var(--arc-green);
  border: 2px solid var(--arc-green);
  box-shadow:
    0 0 12px rgba(57, 255, 20, 0.15),
    inset 0 0 12px rgba(57, 255, 20, 0.05);
}

.arc-btn--primary:hover {
  background: rgba(57, 255, 20, 0.15);
  box-shadow:
    0 0 20px rgba(57, 255, 20, 0.25),
    inset 0 0 16px rgba(57, 255, 20, 0.08);
}

.arc-btn--ghost {
  background: transparent;
  color: var(--arc-muted);
  border: 1px solid var(--arc-surface-light);
}

.arc-btn--ghost:hover {
  color: var(--arc-text);
  border-color: var(--arc-muted);
}
</style>

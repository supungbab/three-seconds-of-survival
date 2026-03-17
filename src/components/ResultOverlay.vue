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
      <div class="result-label">게임 오버</div>
      <div class="result-score">{{ score }}</div>
      <div class="result-best">
        최고 기록: <span class="best-value">{{ bestScore }}</span>
      </div>
      <div v-if="score >= bestScore && score > 0" class="new-record">
        NEW RECORD!
      </div>
      <div class="result-actions">
        <button class="btn btn-primary" @click="restart.onClick">
          다시 하기
        </button>
        <button class="btn btn-secondary" @click="home.onClick">
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
  background: rgba(0, 0, 0, 0.85);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: 40px 32px;
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.result-label {
  font-size: 20px;
  color: var(--muted);
  margin-bottom: 8px;
}

.result-score {
  font-size: 72px;
  font-weight: 900;
  color: var(--text);
  line-height: 1;
  margin-bottom: 12px;
}

.result-best {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 8px;
}

.best-value {
  color: var(--accent);
  font-weight: 700;
}

.new-record {
  font-size: 18px;
  font-weight: 900;
  color: var(--warning);
  text-shadow: 0 0 20px rgba(255, 171, 0, 0.5);
  margin-bottom: 16px;
  animation: pulse 0.6s ease-in-out infinite;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 18px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.1s;
}

.btn:active,
.btn.active {
  opacity: 0.85;
  transform: scale(0.95);
}

.btn-primary {
  background: var(--accent);
  color: #000;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
}
</style>

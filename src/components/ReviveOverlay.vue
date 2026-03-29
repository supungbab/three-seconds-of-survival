<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePressable } from '@/composables/usePressable'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

defineProps<{
  cost: number
  voltBalance: number
}>()

const emit = defineEmits<{
  revive: []
  skip: []
}>()

const countdown = ref(5)
let countdownTimer: number | undefined

const reviveBtn = usePressable(() => {
  clearCountdown()
  emit('revive')
})
const skipBtn = usePressable(() => {
  clearCountdown()
  emit('skip')
})

function clearCountdown() {
  if (countdownTimer !== undefined) {
    clearInterval(countdownTimer)
    countdownTimer = undefined
  }
}

onMounted(() => {
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearCountdown()
      emit('skip')
    }
  }, 1000)
})

onUnmounted(() => {
  clearCountdown()
})
</script>

<template>
  <div class="revive-overlay">
    <div class="revive-card fade-in">
      <div class="card-scanlines" />

      <!-- Header -->
      <div class="revive-header">
        <div class="revive-icon">⚡</div>
        <div class="revive-label">{{ t('부활') }}</div>
      </div>

      <div class="pixel-divider" />

      <!-- Body -->
      <div class="revive-body">
        <div class="revive-message">{{ t('이어서 계속하시겠습니까?') }}</div>
        <div class="revive-cost">
          <span class="cost-amount">{{ cost }} VOLT</span>
        </div>
        <div class="revive-balance">
          {{ t('보유') }}: <span class="balance-value">{{ voltBalance }}</span> VOLT
        </div>
      </div>

      <div class="pixel-divider" />

      <!-- Actions -->
      <div class="revive-actions">
        <button class="arc-btn arc-btn--amber" @click="reviveBtn.onClick">
          <span class="btn-icon">⚡</span> {{ t('부활') }} ({{ cost }} VOLT)
        </button>
        <button class="arc-btn arc-btn--ghost" @click="skipBtn.onClick">
          <span class="btn-icon">✕</span> {{ t('포기') }} ({{ countdown }}s)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.revive-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 2, 6, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.revive-card {
  background: #0a0a0c;
  border: 3px solid #564a28;
  padding: 0;
  text-align: center;
  width: 100%;
  max-width: 300px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 0 3px #060608,
    inset 1px 1px 0 #685838,
    inset -1px -1px 0 #1a1a1c,
    0 0 80px rgba(255, 184, 0, 0.1);
}

.card-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.revive-header {
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.revive-icon {
  font-size: 24px;
}

.revive-label {
  font-size: 18px;
  font-weight: 900;
  color: var(--arc-amber);
  letter-spacing: 6px;
  text-shadow: 0 0 16px var(--arc-amber-glow);
  position: relative;
  z-index: 2;
}

.pixel-divider {
  height: 2px;
  margin: 0 16px;
  background:
    repeating-linear-gradient(
      to right,
      #564a28 0px,
      #564a28 4px,
      transparent 4px,
      transparent 8px
    );
  opacity: 0.6;
}

.revive-body {
  padding: 20px 24px;
  position: relative;
  z-index: 2;
}

.revive-message {
  font-size: 14px;
  color: var(--arc-text);
  opacity: 0.8;
  margin-bottom: 16px;
}

.revive-cost {
  margin-bottom: 8px;
}

.cost-amount {
  font-size: 32px;
  font-weight: 900;
  color: var(--arc-amber);
  text-shadow:
    0 0 16px var(--arc-amber-glow),
    0 0 40px rgba(255, 184, 0, 0.1);
}

.revive-balance {
  font-size: 13px;
  color: #606060;
  letter-spacing: 1px;
}

.balance-value {
  color: #8a8a80;
  font-weight: 700;
}

.revive-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px 20px;
  position: relative;
  z-index: 2;
}

.arc-btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.arc-btn:active {
  transform: scale(0.97);
}

.btn-icon {
  font-size: 12px;
}

.arc-btn--amber {
  background: #141004;
  color: var(--arc-amber);
  border: 2px solid #564a28;
  box-shadow:
    inset 1px 1px 0 #685838,
    inset -1px -1px 0 #322a1a;
}

.arc-btn--amber:hover {
  background: #1c1408;
  border-color: #6a5a36;
  color: #ffd54f;
  box-shadow:
    0 0 12px rgba(255, 184, 0, 0.08),
    inset 1px 1px 0 #7a6a48,
    inset -1px -1px 0 #3a3220;
}

.arc-btn--ghost {
  background: #0c0c0e;
  color: var(--px-neutral-dim);
  border: 2px solid #333330;
  box-shadow:
    inset 1px 1px 0 #2a2a28,
    inset -1px -1px 0 #141416;
}

.arc-btn--ghost:hover {
  color: var(--px-neutral);
  border-color: #4a4a46;
  background: #141416;
}
</style>

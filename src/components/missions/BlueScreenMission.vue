<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

let resolved = false

function randomHex(): string {
  return '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')
}

const targetCode = ref(randomHex())
const choices = ref<{ code: string; correct: boolean }[]>([])

function init() {
  const wrong1 = randomHex()
  const wrong2 = randomHex()
  const items = [
    { code: targetCode.value, correct: true },
    { code: wrong1, correct: false },
    { code: wrong2, correct: false },
  ]
  // shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  choices.value = items
}

init()

function handleTap(e: PointerEvent, choice: { code: string; correct: boolean }) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', choice.correct)
}
</script>

<template>
  <div class="blue-screen-mission">
    <div class="bsod-header">FATAL ERROR</div>
    <div class="bsod-body">
      <div class="error-code">*** STOP: {{ targetCode }}</div>
      <div class="error-desc">IRQL_NOT_LESS_OR_EQUAL</div>
    </div>
    <div class="bsod-prompt">{{ t('에러 코드를 맞추세요:') }}</div>
    <div class="choices">
      <button
        v-for="(c, i) in choices"
        :key="i"
        class="code-btn"
        @pointerdown="(e) => handleTap(e, c)"
      >
        {{ c.code }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.blue-screen-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  background: #000820;
  border: 2px solid #1a3a8a;
  min-height: 180px;
}

.bsod-header {
  font-size: 18px;
  font-weight: 700;
  color: #7ab8ff;
  background: #1a3a8a;
  padding: 2px 12px;
  width: 100%;
  text-align: center;
}

.bsod-body {
  text-align: center;
  color: #8ac4ff;
  font-size: 11px;
  padding: 4px 0;
}

.error-code {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 8px #4a9eff;
  margin-bottom: 4px;
}

.error-desc {
  color: #6a9adf;
  font-size: 10px;
}

.bsod-prompt {
  font-size: 12px;
  color: #aaccff;
}

.choices {
  display: flex;
  gap: 8px;
  width: 100%;
}

.code-btn {
  flex: 1;
  background: #0a1a40;
  border: 1px solid #3a6aaa;
  color: #8ac4ff;
  font-family: monospace;
  font-size: 11px;
  padding: 10px 4px;
  cursor: pointer;
  border-radius: 0;
  text-align: center;
  word-break: break-all;
}

.code-btn:active {
  background: #1a3a8a;
  color: #fff;
}
</style>

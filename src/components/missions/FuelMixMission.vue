<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const hydroLevel = ref(100)
const nitroLevel = ref(0)
const targetLevel = 50
const TRANSFER_AMOUNT = 12
const resolved = ref(false)
const TOLERANCE = 6

function handleValve(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value) return
  playTick()
  const transfer = Math.min(TRANSFER_AMOUNT, hydroLevel.value)
  hydroLevel.value -= transfer
  nitroLevel.value += transfer

  if (Math.abs(nitroLevel.value - targetLevel) <= TOLERANCE) {
    resolved.value = true
    emit('tap', true)
  } else if (nitroLevel.value > targetLevel + TOLERANCE) {
    resolved.value = true
    emit('tap', false)
  }
}
</script>

<template>
  <div class="fuel-mix-mission">
    <div class="tanks">
      <div class="tank">
        <div class="tank-label">HYDRO</div>
        <div class="tank-body">
          <div class="tank-fill hydro" :style="{ height: `${hydroLevel}%` }" />
        </div>
        <div class="tank-val">{{ Math.round(hydroLevel) }}%</div>
      </div>
      <div class="valve-area">
        <button class="valve-btn" @pointerdown="handleValve">
          ⟩⟩<br>{{ t('밸브') }}
        </button>
      </div>
      <div class="tank">
        <div class="tank-label">NITRO</div>
        <div class="tank-body">
          <div class="tank-fill nitro" :style="{ height: `${nitroLevel}%` }" />
          <div class="target-line" :style="{ bottom: `${targetLevel}%` }">
            <span class="target-tag">{{ targetLevel }}%</span>
          </div>
        </div>
        <div class="tank-val">{{ Math.round(nitroLevel) }}%</div>
      </div>
    </div>
    <div class="hint">{{ t('밸브를 탭하여 채우세요') }}</div>
  </div>
</template>

<style scoped>
.fuel-mix-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 200px;
}

.tanks {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tank-label {
  font-size: 12px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.tank-body {
  position: relative;
  width: 44px;
  height: 120px;
  border: 2px solid var(--px-green-bright);
  background: #0c140c;
  overflow: hidden;
  border-radius: 0;
}

.tank-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.2s ease-out;
}

.tank-fill.hydro {
  background: #4a9eff;
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.5);
}

.tank-fill.nitro {
  background: var(--arc-danger);
  box-shadow: 0 0 8px var(--arc-danger-glow);
}

.target-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px dashed var(--px-green-bright);
  z-index: 1;
}

.target-tag {
  position: absolute;
  right: -28px;
  top: -8px;
  font-size: 10px;
  font-family: monospace;
  color: var(--px-green-bright);
}

.tank-val {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-muted);
}

.valve-area {
  display: flex;
  align-items: center;
}

.valve-btn {
  font-size: 14px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  padding: 10px 14px;
  cursor: pointer;
  border-radius: 0;
  text-align: center;
  line-height: 1.3;
  text-shadow: 0 0 6px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.valve-btn:active {
  background: var(--px-green-bright);
  color: #000;
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface BreakPoint {
  x: number
  fixed: boolean
}

const breaks = ref<BreakPoint[]>([])
const resolved = ref(false)

onMounted(() => {
  breaks.value = [
    { x: 30 + Math.random() * 10, fixed: false },
    { x: 60 + Math.random() * 10, fixed: false },
  ]
})

function handleBreakTap(index: number, e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value || breaks.value[index].fixed) return
  playTick()
  breaks.value[index].fixed = true
  if (breaks.value.every(b => b.fixed)) {
    resolved.value = true
    emit('tap', true)
  }
}
</script>

<template>
  <div class="circuit-bridge-mission">
    <div class="board">
      <div class="trace-line">
        <div class="trace-segment left" :class="{ powered: breaks[0]?.fixed }" />
        <div
          v-for="(bp, i) in breaks"
          :key="i"
          class="break-point"
          :class="{ fixed: bp.fixed }"
          :style="{ left: `${bp.x}%` }"
          @pointerdown="(e: PointerEvent) => handleBreakTap(i, e)"
        >
          <span v-if="!bp.fixed" class="break-gap">╳</span>
          <span v-else class="bridge-ok">━</span>
        </div>
        <div class="trace-segment right" :class="{ powered: breaks.every(b => b.fixed) }" />
      </div>
      <div class="components-row">
        <span class="chip">▦</span>
        <span class="resistor">⌇</span>
        <span class="chip">▦</span>
      </div>
      <div class="power-indicator" :class="{ on: breaks.every(b => b.fixed) }">
        {{ breaks.every(b => b.fixed) ? t('회로 정상') : t('회로 끊김') }}
      </div>
    </div>
    <div class="status-dots">
      <span
        v-for="(bp, i) in breaks"
        :key="i"
        class="s-dot"
        :class="{ done: bp.fixed }"
      >{{ bp.fixed ? '●' : '○' }}</span>
    </div>
    <div class="hint">{{ t('끊어진 곳을 탭하여 연결하세요') }}</div>
  </div>
</template>

<style scoped>
.circuit-bridge-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  min-height: 200px;
}

.board {
  position: relative;
  width: 100%;
  padding: 16px;
  border: 2px solid #2a3a28;
  background: #0a120a;
}

.trace-line {
  position: relative;
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
}

.trace-segment {
  flex: 1;
  height: 3px;
  background: #2a3a28;
  transition: all 0.3s;
}

.trace-segment.powered {
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.break-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  cursor: pointer;
  z-index: 2;
  padding: 4px 8px;
}

.break-gap {
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
  animation: blink-break 0.8s ease-in-out infinite alternate;
}

.bridge-ok {
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
  font-weight: 700;
}

.components-row {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  font-size: 18px;
  color: #3a4a38;
}

.power-indicator {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 4px var(--arc-danger-glow);
  transition: all 0.3s;
}

.power-indicator.on {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.status-dots {
  display: flex;
  gap: 10px;
  font-size: 16px;
  font-family: monospace;
  color: var(--arc-muted);
}

.s-dot.done {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}

@keyframes blink-break {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>

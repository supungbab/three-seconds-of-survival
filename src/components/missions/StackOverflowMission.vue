<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const stackHeight = ref(2)
const maxStack = 8
const popsNeeded = 4
const popsDone = ref(0)
const resolved = ref(false)
let growTimer = 0
const GROW_INTERVAL = 600 // ms

function handlePop(e: PointerEvent) {
  e.stopPropagation()
  if (resolved.value) return
  if (stackHeight.value <= 0) return
  playTick()
  stackHeight.value = Math.max(0, stackHeight.value - 1)
  popsDone.value++
  if (popsDone.value >= popsNeeded) {
    resolved.value = true
    clearInterval(growTimer)
    emit('tap', true)
  }
}

function growStack() {
  if (resolved.value) return
  stackHeight.value++
  if (stackHeight.value >= maxStack) {
    resolved.value = true
    clearInterval(growTimer)
    emit('tap', false)
  }
}

onMounted(() => {
  growTimer = window.setInterval(growStack, GROW_INTERVAL)
})

onUnmounted(() => {
  clearInterval(growTimer)
})
</script>

<template>
  <div class="stack-overflow-mission">
    <div class="stack-container">
      <div class="limit-line">
        <span class="limit-label">OVERFLOW</span>
      </div>
      <div class="stack-visual">
        <div
          v-for="i in stackHeight"
          :key="i"
          class="stack-block"
          :class="{ danger: stackHeight >= maxStack - 2 }"
        >
          [{{ i - 1 }}]
        </div>
      </div>
    </div>

    <button class="pop-btn" @pointerdown="handlePop">
      POP
    </button>

    <div class="pop-counter">
      POP {{ popsDone }}/{{ popsNeeded }}
    </div>
    <div class="hint">TAP POP TO CLEAR STACK</div>
  </div>
</template>

<style scoped>
.stack-overflow-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 10px;
  min-height: 200px;
}

.stack-container {
  position: relative;
  width: 100px;
  height: 130px;
  border-left: 2px solid var(--arc-muted);
  border-right: 2px solid var(--arc-muted);
  border-bottom: 2px solid var(--arc-muted);
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  overflow: hidden;
}

.limit-line {
  position: absolute;
  top: 0;
  left: -4px;
  right: -4px;
  border-top: 2px solid var(--arc-danger);
  z-index: 2;
}

.limit-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 4px var(--arc-danger-glow);
  white-space: nowrap;
}

.stack-visual {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  padding: 2px;
}

.stack-block {
  width: 100%;
  height: 14px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-bright);
  font-size: 10px;
  font-family: monospace;
  color: var(--px-green-bright);
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 4px var(--px-green-glow);
  animation: stack-in 0.15s ease-out;
}

.stack-block.danger {
  border-color: var(--arc-danger);
  color: var(--arc-danger);
  text-shadow: 0 0 4px var(--arc-danger-glow);
  background: rgba(255, 59, 92, 0.08);
}

.pop-btn {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  padding: 8px 32px;
  cursor: pointer;
  border-radius: 0;
  text-shadow: 0 0 6px var(--px-green-glow);
  box-shadow: 0 0 8px var(--px-green-glow);
}

.pop-btn:active {
  background: var(--px-green-bright);
  color: #000;
  text-shadow: none;
}

.pop-counter {
  font-size: 13px;
  font-family: monospace;
  color: var(--arc-muted);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
  font-family: monospace;
}

@keyframes stack-in {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}
</style>

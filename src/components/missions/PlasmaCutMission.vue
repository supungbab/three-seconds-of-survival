<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const cutterPos = ref(0) // 0~100 percent along the line
const marks = [25, 55, 80]
const hitMarks = ref<boolean[]>([false, false, false])
let resolved = false
let raf = 0
let startTime = 0
const SPEED = 40 // percent per second
const HIT_TOLERANCE = 8

function animate(now: number) {
  if (resolved) return
  if (!startTime) startTime = now
  const elapsed = (now - startTime) / 1000
  cutterPos.value = (elapsed * SPEED) % 100
  if (elapsed * SPEED > 100 && !resolved) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  playTick()
  const pos = cutterPos.value
  let hit = false
  for (let i = 0; i < marks.length; i++) {
    if (!hitMarks.value[i] && Math.abs(pos - marks[i]) < HIT_TOLERANCE) {
      hitMarks.value[i] = true
      hit = true
      break
    }
  }
  if (!hit) {
    resolved = true
    cancelAnimationFrame(raf)
    emit('tap', false)
    return
  }
  if (hitMarks.value.every(Boolean)) {
    resolved = true
    cancelAnimationFrame(raf)
    emit('tap', true)
  }
}

onMounted(() => {
  raf = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="plasma-cut-mission" @pointerdown="handleTap">
    <div class="cut-track">
      <div class="cut-line" />
      <div
        v-for="(m, i) in marks"
        :key="i"
        class="cut-mark"
        :class="{ hit: hitMarks[i] }"
        :style="{ left: `${m}%` }"
      >
        <span class="mark-x">{{ hitMarks[i] ? '◆' : '✕' }}</span>
      </div>
      <div class="cutter" :style="{ left: `${cutterPos}%` }">
        <span class="cutter-icon">▼</span>
        <span class="plasma-trail" />
      </div>
    </div>
    <div class="progress-dots">
      <span v-for="(h, i) in hitMarks" :key="i" class="dot" :class="{ done: h }">{{ h ? '●' : '○' }}</span>
    </div>
    <div class="hint">{{ t('표시에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.plasma-cut-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 14px;
  min-height: 180px;
  cursor: pointer;
}

.cut-track {
  position: relative;
  width: 85%;
  height: 60px;
}

.cut-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    var(--arc-muted) 0,
    var(--arc-muted) 6px,
    transparent 6px,
    transparent 12px
  );
}

.cut-mark {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: var(--arc-danger);
  text-shadow: 0 0 6px var(--arc-danger-glow);
  transition: all 0.2s;
}

.cut-mark.hit .mark-x {
  color: var(--px-green-bright);
  text-shadow: 0 0 10px var(--px-green-glow);
}

.cutter {
  position: absolute;
  top: 10px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.05s linear;
}

.cutter-icon {
  font-size: 16px;
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.plasma-trail {
  display: block;
  width: 2px;
  height: 14px;
  background: var(--px-green-bright);
  box-shadow: 0 0 8px var(--px-green-glow), 0 0 16px var(--px-green-glow);
}

.progress-dots {
  display: flex;
  gap: 12px;
  font-size: 16px;
  color: var(--arc-muted);
}

.dot.done {
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  color: var(--arc-muted);
}
</style>

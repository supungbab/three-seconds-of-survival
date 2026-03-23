<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const brokenIndex = ref(0)
const tubeOpacities = ref([1, 1, 1, 1])
const resolved = ref(false)

let flickerTimers: ReturnType<typeof setTimeout>[] = []
let animFrame: ReturnType<typeof requestAnimationFrame> | null = null

function normalFlicker(index: number) {
  const base = 0.7 + Math.random() * 0.3
  tubeOpacities.value[index] = base
}

function brokenFlicker(index: number) {
  const r = Math.random()
  if (r < 0.25) {
    tubeOpacities.value[index] = 0.05
  } else if (r < 0.5) {
    tubeOpacities.value[index] = 0.2 + Math.random() * 0.3
  } else {
    tubeOpacities.value[index] = 0.5 + Math.random() * 0.5
  }
}

function runFlicker() {
  if (resolved.value) return
  for (let i = 0; i < 4; i++) {
    if (i === brokenIndex.value) {
      brokenFlicker(i)
    } else {
      normalFlicker(i)
    }
  }
  tubeOpacities.value = [...tubeOpacities.value]
  animFrame = requestAnimationFrame(() => {
    const delay = brokenIndex.value >= 0 ? 60 + Math.random() * 80 : 120
    const t = setTimeout(runFlicker, delay)
    flickerTimers.push(t)
  })
}

onMounted(() => {
  brokenIndex.value = Math.floor(Math.random() * 4)
  runFlicker()
})

onUnmounted(() => {
  flickerTimers.forEach(t => clearTimeout(t))
  if (animFrame) cancelAnimationFrame(animFrame)
})

function handleTubeTap(index: number, e: Event) {
  e.stopPropagation()
  if (resolved.value) return
  resolved.value = true
  playTick()
  emit('tap', index === brokenIndex.value)
}
</script>

<template>
  <div class="tube-replace-mission">
    <div class="tube-label">{{ t('고장난 진공관 교체') }}</div>
    <div class="tubes-row">
      <button
        v-for="(opacity, i) in tubeOpacities"
        :key="i"
        class="tube"
        @pointerdown="handleTubeTap(i, $event)"
      >
        <div class="tube-glass" :style="{ opacity }">
          <div class="tube-filament" />
          <div class="tube-glow" :style="{ opacity: opacity * 0.8 }" />
        </div>
        <div class="tube-base" />
        <div class="tube-id">{{ i + 1 }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tube-replace-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.tube-label {
  font-size: 12px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.tubes-row {
  display: flex;
  gap: 16px;
}

.tube {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.tube:active .tube-glass {
  transform: scale(0.92);
}

.tube-glass {
  width: 36px;
  height: 64px;
  background: rgba(140, 200, 144, 0.08);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  position: relative;
  overflow: hidden;
  transition: transform 0.1s;
}

.tube-filament {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: var(--px-green-bright);
  box-shadow: 0 0 6px var(--px-green-glow);
}

.tube-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, var(--px-green-glow) 0%, transparent 70%);
}

.tube-base {
  width: 28px;
  height: 10px;
  background: var(--arc-muted);
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
}

.tube-id {
  font-size: 11px;
  font-family: monospace;
  color: var(--arc-muted);
  margin-top: 2px;
}
</style>

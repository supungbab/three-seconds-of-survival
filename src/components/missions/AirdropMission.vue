<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const chuteX = ref(50)
const chuteY = ref(0)
const landingLeft = ref(0)
const LANDING_WIDTH = 28
let raf = 0
let startTime = 0
let resolved = false

onMounted(() => {
  landingLeft.value = 20 + Math.random() * 52
  startTime = performance.now()
  raf = requestAnimationFrame(animate)
})

function animate(now: number) {
  if (resolved) return
  const elapsed = (now - startTime) / 1000
  chuteY.value = Math.min(95, elapsed * 28)
  chuteX.value = 50 + Math.sin(elapsed * 2.2) * 30
  if (chuteY.value >= 95) {
    resolved = true
    emit('tap', false)
    return
  }
  raf = requestAnimationFrame(animate)
}

function handleTap(e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  cancelAnimationFrame(raf)
  const inZoneX = chuteX.value >= landingLeft.value && chuteX.value <= landingLeft.value + LANDING_WIDTH
  if (inZoneX) {
    playTick()
    emit('tap', true)
  } else {
    emit('tap', false)
  }
}

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="airdrop-mission" @pointerdown="handleTap">
    <div class="sky">
      <div class="chute" :style="{ left: `${chuteX}%`, top: `${chuteY}%` }">
        <div class="canopy">▼</div>
        <div class="cargo">■</div>
      </div>
      <div
        class="landing-zone"
        :style="{ left: `${landingLeft}%`, width: `${LANDING_WIDTH}%` }"
      >
        <span class="lz-label">LZ</span>
      </div>
    </div>
    <div class="hint">{{ t('착륙 지점 위에서 탭하세요') }}</div>
  </div>
</template>

<style scoped>
.airdrop-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  min-height: 200px;
  cursor: pointer;
}

.sky {
  position: relative;
  width: 100%;
  height: 160px;
  background: #060e06;
  border: 2px solid var(--px-green-bg);
  overflow: hidden;
}

.chute {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.canopy {
  font-size: 22px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.cargo {
  font-size: 14px;
  color: var(--arc-muted);
}

.landing-zone {
  position: absolute;
  bottom: 0;
  height: 20px;
  border: 2px dashed var(--px-green-bright);
  background: rgba(140, 200, 144, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lz-label {
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.hint {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
}
</style>

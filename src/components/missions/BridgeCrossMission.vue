<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const TOTAL_PLANKS = 3
const STABLE_DURATION = 800
const SHAKE_DURATION = 1200
const CYCLE = STABLE_DURATION + SHAKE_DURATION

const currentPlank = ref(0)
const resolved = ref(false)
const failed = ref(false)
const elapsed = ref(0)

let animId: number | null = null
let startTime = 0

const plankOffsets = [0, 400, 900]

function isPlankStable(plankIndex: number): boolean {
  const offset = plankOffsets[plankIndex] || 0
  const phase = (elapsed.value + offset) % CYCLE
  return phase < STABLE_DURATION
}

const planks = computed(() => {
  return Array.from({ length: TOTAL_PLANKS }, (_, i) => ({
    index: i,
    stable: isPlankStable(i),
    crossed: i < currentPlank.value,
    current: i === currentPlank.value,
  }))
})

function tick() {
  if (resolved.value) return
  elapsed.value = Date.now() - startTime
  animId = requestAnimationFrame(tick)
}

function handlePlankTap(e: PointerEvent, index: number) {
  e.stopPropagation()
  if (resolved.value) return
  if (index !== currentPlank.value) return

  if (isPlankStable(index)) {
    playTick()
    currentPlank.value++
    if (currentPlank.value >= TOTAL_PLANKS) {
      resolved.value = true
      emit('tap', true)
    }
  } else {
    resolved.value = true
    failed.value = true
    emit('tap', false)
  }
}

onMounted(() => {
  startTime = Date.now()
  animId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="bridge-cross-mission">
    <div class="bridge-header">
      <span class="header-label">{{ t('다리') }}</span>
      <span class="header-progress">{{ currentPlank }} / {{ TOTAL_PLANKS }}</span>
    </div>

    <div class="bridge-container">
      <div class="rope top" />
      <div class="planks-row">
        <button
          v-for="plank in planks"
          :key="plank.index"
          class="plank"
          :class="{
            stable: plank.stable,
            shaking: !plank.stable && !plank.crossed,
            crossed: plank.crossed,
            current: plank.current && !resolved,
            failed: failed && plank.current,
          }"
          @pointerdown.stop="(e: PointerEvent) => handlePlankTap(e, plank.index)"
        >
          <span class="plank-icon">{{ plank.crossed ? '■' : '▬' }}</span>
          <span v-if="plank.current && !resolved" class="plank-status">
            {{ plank.stable ? t('안정') : t('흔들림') }}
          </span>
        </button>
      </div>
      <div class="rope bottom" />
    </div>

    <div v-if="!resolved" class="hint-text">
      {{ t('널빤지가 안정될 때 탭하세요') }}
    </div>
    <div v-if="resolved && !failed" class="result-text ok">{{ t('건넘') }}</div>
    <div v-if="failed" class="result-text bad">{{ t('추락') }}</div>
  </div>
</template>

<style scoped>
.bridge-cross-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.bridge-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-label {
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 3px;
}

.header-progress {
  font-size: 16px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.bridge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.rope {
  width: 90%;
  height: 2px;
  background: var(--arc-muted);
  opacity: 0.4;
}

.planks-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.plank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;
  background: #0c140c;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  cursor: pointer;
  transition: border-color 0.15s;
  box-shadow: 0 0 0 2px #111311;
  min-width: 70px;
}

.plank.current {
  border-color: var(--px-green-bright);
  box-shadow:
    0 0 0 2px #111311,
    0 0 12px var(--px-green-glow);
}

.plank.current.stable {
  border-color: var(--px-green-bright);
  animation: stable-glow 0.5s ease-in-out infinite alternate;
}

.plank.shaking {
  animation: plank-shake 0.08s linear infinite alternate;
  border-color: var(--arc-danger);
  box-shadow:
    0 0 0 2px #111311,
    0 0 8px var(--arc-danger-glow);
}

.plank.crossed {
  opacity: 0.4;
  border-color: var(--arc-muted);
  cursor: default;
}

.plank.failed {
  border-color: var(--arc-danger);
  box-shadow: 0 0 16px var(--arc-danger-glow);
  animation: none;
}

.plank:active:not(.crossed) {
  transform: scale(0.95);
}

.plank-icon {
  font-size: 24px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.plank.shaking .plank-icon {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
}

.plank.crossed .plank-icon {
  color: var(--arc-muted);
  text-shadow: none;
}

.plank-status {
  font-size: 8px;
  color: var(--arc-muted);
  letter-spacing: 1px;
}

.plank.shaking .plank-status {
  color: var(--arc-danger);
}

.hint-text {
  font-size: 11px;
  color: var(--arc-muted);
  letter-spacing: 2px;
  animation: hint-blink 1s ease-in-out infinite alternate;
}

.result-text {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 3px;
  animation: flash-in 0.2s ease-out;
}

.result-text.ok {
  color: var(--px-green-bright);
  text-shadow: 0 0 12px var(--px-green-glow);
}

.result-text.bad {
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
}

@keyframes plank-shake {
  from { transform: translateX(-3px) rotate(-1deg); }
  to { transform: translateX(3px) rotate(1deg); }
}

@keyframes stable-glow {
  from { box-shadow: 0 0 0 2px #111311, 0 0 8px var(--px-green-glow); }
  to { box-shadow: 0 0 0 2px #111311, 0 0 20px var(--px-green-glow); }
}

@keyframes hint-blink {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

@keyframes flash-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>

<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  infectedCount: number
  infectedIndex: number
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

function handleTap(e: Event, index: number) {
  e.stopPropagation()
  playTick()
  emit('tap', index === props.infectedIndex)
}
</script>

<template>
  <div class="infected-scan-mission">
    <div class="scan-header">{{ t('바이오 스캔') }}</div>
    <div class="scan-row">
      <button
        v-for="i in infectedCount"
        :key="i"
        class="person"
        :class="{ infected: (i - 1) === infectedIndex }"
        @pointerdown="(e) => handleTap(e, i - 1)"
      >
        <span class="person-icon">▓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.infected-scan-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.scan-header {
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.scan-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.person {
  background: transparent;
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  padding: 10px;
  cursor: pointer;
  transition: all 0.1s;
}

.person-icon {
  font-size: 32px;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  display: block;
}

.person.infected {
  border-color: var(--arc-danger);
}

.person.infected .person-icon {
  color: var(--arc-danger);
  text-shadow: 0 0 10px var(--arc-danger-glow);
  animation: infected-shake 0.15s infinite alternate;
}

.person:active {
  transform: scale(0.9);
}

@keyframes infected-shake {
  0% {
    transform: translate(-0.8px, 0.4px);
  }
  50% {
    transform: translate(0.8px, -0.4px);
  }
  100% {
    transform: translate(-0.4px, -0.8px);
  }
}
</style>

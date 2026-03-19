<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const sweeping = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => {
    sweeping.value = false
  }, 1200)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function handleTap(e: Event) {
  e.stopPropagation()
  playTick()
  emit('tap', !sweeping.value)
}
</script>

<template>
  <div class="curfew-mission" @pointerdown="handleTap">
    <div class="searchlight-area">
      <div v-if="sweeping" class="searchlight" />
      <div class="curfew-text">
        {{ sweeping ? 'WAIT...' : 'GO!' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.curfew-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  cursor: pointer;
  min-height: 160px;
}

.searchlight-area {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.searchlight {
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(140, 200, 144, 0.05) 30%,
    rgba(140, 200, 144, 0.2) 50%,
    rgba(140, 200, 144, 0.05) 70%,
    transparent 100%
  );
  animation: sweep 1.2s linear forwards;
  pointer-events: none;
}

.curfew-text {
  font-size: 32px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 16px var(--px-green-glow);
  letter-spacing: 4px;
  z-index: 1;
}

@keyframes sweep {
  0% {
    left: -60%;
  }
  100% {
    left: 100%;
  }
}
</style>

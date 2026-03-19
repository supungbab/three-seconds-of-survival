<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const props = defineProps<{
  fuseCount: number
  brokenIndex: number
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

function handleTap(e: Event, index: number) {
  e.stopPropagation()
  playTick()
  emit('tap', index === props.brokenIndex)
}
</script>

<template>
  <div class="fuse-replace-mission">
    <div class="fuse-header">REPLACE FUSE</div>
    <div class="fuse-row">
      <button
        v-for="i in fuseCount"
        :key="i"
        class="fuse"
        :class="{ broken: (i - 1) === brokenIndex }"
        @pointerdown="(e) => handleTap(e, i - 1)"
      >
        <div class="fuse-body">
          <div class="fuse-cap top" />
          <div class="fuse-glass" />
          <div class="fuse-cap bottom" />
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fuse-replace-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.fuse-header {
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
  letter-spacing: 2px;
}

.fuse-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.fuse {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  transition: all 0.1s;
}

.fuse-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.fuse-cap {
  width: 24px;
  height: 8px;
  background: var(--px-green-bright);
}

.fuse-cap.top {
  border-radius: 0;
}

.fuse-cap.bottom {
  border-radius: 0;
}

.fuse-glass {
  width: 18px;
  height: 48px;
  background: rgba(140, 200, 144, 0.15);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  box-shadow: 0 0 12px var(--px-green-glow), inset 0 0 8px var(--px-green-glow);
}

.fuse.broken .fuse-cap {
  background: var(--arc-muted);
}

.fuse.broken .fuse-glass {
  background: rgba(80, 80, 80, 0.15);
  border-color: var(--arc-muted);
  box-shadow: none;
  opacity: 0.4;
}

.fuse:active {
  transform: scale(0.9);
}
</style>

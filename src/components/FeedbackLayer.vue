<script setup lang="ts">
defineProps<{
  showFlash: boolean
  flashColor: string
  particles: { id: number; x: number; y: number; dx: number; dy: number; color: string }[]
}>()
</script>

<template>
  <div class="feedback-layer">
    <!-- Flash overlay -->
    <div
      v-if="showFlash"
      class="flash-overlay"
      :style="{ backgroundColor: flashColor }"
    />

    <!-- Particles -->
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{
        left: `${p.x}px`,
        top: `${p.y}px`,
        '--dx': `${p.dx}px`,
        '--dy': `${p.dy}px`,
        backgroundColor: p.color,
      }"
    />
  </div>
</template>

<style scoped>
.feedback-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.flash-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  animation: flash-red 0.4s ease-out forwards;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particle-fly 0.5s ease-out forwards;
}
</style>

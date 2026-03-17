<script setup lang="ts">
defineProps<{
  text: string
  showing: boolean
}>()
</script>

<template>
  <div class="mission-text" :class="{ 'mission-enter': showing }">
    {{ text }}
  </div>
</template>

<style scoped>
.mission-text {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  color: var(--text);
  padding: 16px;
  text-shadow: 0 0 30px var(--accent-glow);
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  amount: number
}>()

const emit = defineEmits<{
  done: []
}>()

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
    emit('done')
  }, 800)
})
</script>

<template>
  <div v-if="visible" class="volt-popup">
    +{{ props.amount }} VOLT
  </div>
</template>

<style scoped>
.volt-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: 900;
  color: var(--arc-amber);
  text-shadow:
    0 0 12px var(--arc-amber-glow),
    0 0 40px var(--arc-amber-glow);
  pointer-events: none;
  z-index: 90;
  animation: volt-float 0.8s ease-out forwards;
}

@keyframes volt-float {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -60%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -80%) scale(1);
  }
}
</style>

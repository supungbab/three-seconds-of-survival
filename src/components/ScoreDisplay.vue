<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  score: number
}>()

const isPop = ref(false)

watch(() => props.score, () => {
  if (props.score > 0) {
    isPop.value = true
    setTimeout(() => { isPop.value = false }, 300)
  }
})
</script>

<template>
  <div class="score-display" :class="{ 'score-pop': isPop }">
    {{ score }}
  </div>
</template>

<style scoped>
.score-display {
  font-size: 48px;
  font-weight: 900;
  color: var(--text);
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 20px var(--accent-glow);
}
</style>

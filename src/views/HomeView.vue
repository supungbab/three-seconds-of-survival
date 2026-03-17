<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useScoreStorage } from '@/composables/useScoreStorage'
import StartScreen from '@/components/StartScreen.vue'

const router = useRouter()
const { bestScore } = useScoreStorage()

function handleStart() {
  router.push('/game')
}
</script>

<template>
  <StartScreen :best-score="bestScore" @start="handleStart" />
</template>

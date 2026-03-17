<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useScoreStorage } from '@/composables/useScoreStorage'
import MainScreen from '@/components/MainScreen.vue'

const router = useRouter()
const { bestScore } = useScoreStorage()

function handleStart() {
  router.push('/game')
}
</script>

<template>
  <MainScreen :best-score="bestScore" @start="handleStart" />
</template>

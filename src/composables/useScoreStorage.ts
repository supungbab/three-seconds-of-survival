import { ref, computed } from 'vue'
import type { ScoreRecord } from '@/types/game'

const STORAGE_KEY = 'three_seconds_scores'
const BEST_KEY = 'three_seconds_best'
const MAX_RECORDS = 50

export function useScoreStorage() {
  const scores = ref<ScoreRecord[]>(load())
  const storedBest = ref<number>(loadBest())

  function load(): ScoreRecord[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  function loadBest(): number {
    try {
      const v = localStorage.getItem(BEST_KEY)
      return v !== null ? Number(v) : 0
    } catch {
      return 0
    }
  }

  function saveScore(score: number) {
    try {
      scores.value.push({ score, date: Date.now() })
      scores.value.sort((a, b) => b.score - a.score)
      scores.value = scores.value.slice(0, MAX_RECORDS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.value))

      if (score > storedBest.value) {
        storedBest.value = score
        localStorage.setItem(BEST_KEY, String(score))
      }
    } catch {
      // Silently ignore storage errors (quota exceeded, etc.)
    }
  }

  const bestScore = computed(() => storedBest.value)

  return { scores, saveScore, bestScore }
}

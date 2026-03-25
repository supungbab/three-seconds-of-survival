import { ref, shallowRef } from 'vue'
import type { GamePhase, InputAction } from '@/types/game'
import type { MissionParams } from '@/types/mission'
import { useTimer } from './useTimer'
import { useMissionPool } from './useMissionPool'
import { useScoreStorage } from './useScoreStorage'
import { useAudio } from './useAudio'
import { useFeedback } from './useFeedback'

const SHOWING_DURATION = 500
const ACTING_DURATION = 2500
const SUCCESS_DELAY = 300

export function useGameState() {
  const phase = ref<GamePhase>('IDLE')
  const score = ref(0)
  const mission = shallowRef<MissionParams | null>(null)
  const missionKey = ref(0)

  const timer = useTimer()
  const pool = useMissionPool()
  const storage = useScoreStorage()
  const audio = useAudio()
  const feedback = useFeedback()

  // Color tap / component-validated missions
  // null = component hasn't emitted yet, true/false = component verdict
  let colorTapResult: boolean | null = null

  // Track pending timeouts to prevent ghost timers on restart
  const pendingTimers: number[] = []

  function safeTimeout(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      const idx = pendingTimers.indexOf(id)
      if (idx !== -1) pendingTimers.splice(idx, 1)
      fn()
    }, ms)
    pendingTimers.push(id)
  }

  function clearAllTimers() {
    for (const id of pendingTimers) {
      window.clearTimeout(id)
    }
    pendingTimers.length = 0
  }

  function resetMissionState() {
    colorTapResult = null
  }

  function startGame() {
    clearAllTimers()
    audio.ensureContext()
    score.value = 0
    pool.reset()
    phase.value = 'IDLE'
    nextRound()
  }

  function nextRound() {
    const m = pool.pickMission(score.value)
    mission.value = m
    missionKey.value++
    resetMissionState()
    phase.value = 'SHOWING'

    // After showing delay, enable input
    safeTimeout(() => {
      if (phase.value === 'SHOWING') {
        phase.value = 'ACTING'
        timer.start(ACTING_DURATION, onTimeout)
      }
    }, SHOWING_DURATION)
  }

  function onTimeout() {
    handleFail()
  }

  function handleInput(action: InputAction) {
    if (phase.value !== 'ACTING') return

    const m = mission.value
    if (!m) return

    // All missions: component-validated via @tap emit
    if (action.type === 'TAP') {
      if (colorTapResult === true) {
        handleSuccess()
      } else if (colorTapResult === false) {
        handleFail()
      }
      // colorTapResult === null → component hasn't decided yet, ignore raw tap
    }
  }

  function setColorTapResult(correct: boolean) {
    colorTapResult = correct
  }


  function handleSuccess() {
    timer.stop()
    phase.value = 'SUCCESS'
    score.value++
    audio.playSuccess()
    feedback.successFeedback()

    safeTimeout(() => {
      if (phase.value === 'SUCCESS') {
        nextRound()
      }
    }, SUCCESS_DELAY)
  }

  function handleFail() {
    timer.stop()
    clearAllTimers()
    phase.value = 'FAIL'
    audio.playFail()
    feedback.failFeedback()

    safeTimeout(() => {
      phase.value = 'GAME_OVER'
      storage.saveScore(score.value)
    }, 600)
  }

  function restart() {
    startGame()
  }

  return {
    phase,
    score,
    mission,
    missionKey,
    timer,
    feedback,
    storage,
    startGame,
    handleInput,
    setColorTapResult,
    restart,
    clearAllTimers,
    setForcedMission: pool.setForcedType,
  }
}

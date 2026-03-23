import { ref, shallowRef } from 'vue'
import type { GamePhase, InputAction } from '@/types/game'
import type { MissionParams } from '@/types/mission'
import { useTimer } from './useTimer'
import { useMissionPool } from './useMissionPool'
import { useMissionValidator } from './useMissionValidator'
import { useScoreStorage } from './useScoreStorage'
import { useAudio } from './useAudio'
import { useFeedback } from './useFeedback'

const SHOWING_DURATION = 500
const SUB_SHOWING_DURATION = 200
const ACTING_DURATION = 2500
const SUCCESS_DELAY = 300

export function useGameState() {
  const phase = ref<GamePhase>('IDLE')
  const score = ref(0)
  const mission = shallowRef<MissionParams | null>(null)
  const missionKey = ref(0)

  // 다중 미션 상태
  const roundMissions = shallowRef<MissionParams[]>([])
  const subMissionIndex = ref(0)
  const subMissionCount = ref(1)

  const timer = useTimer()
  const pool = useMissionPool()
  const validator = useMissionValidator()
  const storage = useScoreStorage()
  const audio = useAudio()
  const feedback = useFeedback()

  // Color tap / component-validated missions
  let colorTapCorrect = false

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

  function resetSubMissionState() {
    colorTapCorrect = false
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
    const missions = pool.pickMissions(score.value)
    roundMissions.value = missions
    subMissionIndex.value = 0
    subMissionCount.value = missions.length

    const m = missions[0]
    mission.value = m
    missionKey.value++
    resetSubMissionState()
    phase.value = 'SHOWING'

    // After showing delay, enable input
    safeTimeout(() => {
      if (phase.value === 'SHOWING') {
        phase.value = 'ACTING'
        timer.start(ACTING_DURATION, onTimeout)
      }
    }, SHOWING_DURATION)
  }

  function advanceSubMission() {
    const nextIdx = subMissionIndex.value + 1
    subMissionIndex.value = nextIdx
    const m = roundMissions.value[nextIdx]
    mission.value = m
    missionKey.value++
    resetSubMissionState()
    phase.value = 'SUB_SHOWING'

    // Short showing for sub-missions, timer keeps running
    safeTimeout(() => {
      if (phase.value === 'SUB_SHOWING') {
        phase.value = 'ACTING'
      }
    }, SUB_SHOWING_DURATION)
  }

  function onTimeout() {
    handleFail()
  }

  function handleInput(action: InputAction) {
    if (phase.value !== 'ACTING') return

    const m = mission.value
    if (!m) return

    // Validator-managed missions: raw input goes directly to validator
    if (m.type === 'PARADROP' || m.type === 'COMPASS' || m.type === 'VENT') {
      const isCorrect = validator.validate(m, action)
      if (isCorrect) {
        handleSuccess()
      } else {
        handleFail()
      }
      return
    }

    // WIRE_CUT: component-validated but wrong tap = immediate fail
    if (m.type === 'WIRE_CUT' && action.type === 'TAP') {
      if (colorTapCorrect) {
        handleSuccess()
      } else {
        handleFail()
      }
      return
    }

    // All other missions: component-managed via @tap emit
    // Raw events that bubble here are ignored; only component emits set colorTapCorrect
    if (action.type === 'TAP' && colorTapCorrect) {
      handleSuccess()
    }
    // all other raw inputs → ignore (timeout handles fail)
  }

  function setColorTapResult(correct: boolean) {
    colorTapCorrect = correct
  }


  function handleSuccess() {
    // 남은 서브미션이 있으면 다음 서브미션으로
    if (subMissionIndex.value < subMissionCount.value - 1) {
      advanceSubMission()
      return
    }

    // 라운드 완료
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
    subMissionIndex,
    subMissionCount,
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

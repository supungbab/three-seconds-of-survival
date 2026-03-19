import { MISSION_REGISTRY, type MissionParams, type MissionType } from '@/types/mission'
import type { Difficulty } from '@/types/game'

interface DifficultyBracket {
  maxScore: number
  missionTypes: MissionType[]
  maxDifficulty: Difficulty
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { EASY: 0, NORMAL: 1, HARD: 2 }

const BRACKETS: DifficultyBracket[] = [
  { maxScore: 5, missionTypes: ['COLOR_TAP', 'SWIPE', 'MULTI_TAP'], maxDifficulty: 'EASY' },
  { maxScore: 15, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP'], maxDifficulty: 'NORMAL' },
  { maxScore: 30, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP', 'LONG_PRESS', 'COLOR_TAP_NEGATIVE'], maxDifficulty: 'NORMAL' },
  { maxScore: Infinity, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP', 'LONG_PRESS', 'DUAL_TAP', 'DO_NOTHING', 'SEQUENCE', 'COLOR_TAP_NEGATIVE'], maxDifficulty: 'HARD' },
]

/** 다중 미션 시 제외할 타입 */
const MULTI_MISSION_EXCLUDE: MissionType[] = ['DO_NOTHING', 'LONG_PRESS']
/** 3개 이상 미션 시 추가 제외 */
const TRIPLE_MISSION_EXCLUDE: MissionType[] = ['SEQUENCE']

export function getMissionCount(score: number): number {
  if (score <= 5) return 1
  if (score <= 15) return 2
  if (score <= 30) return 3
  return 4
}

export function useMissionPool() {
  let lastMissionType: MissionType | null = null

  function getAvailableTypes(score: number): MissionType[] {
    const bracket = BRACKETS.find((b) => score <= b.maxScore) ?? BRACKETS[BRACKETS.length - 1]
    return bracket.missionTypes
  }

  function pickMission(score: number): MissionParams {
    const types = getAvailableTypes(score)
    // Filter out last mission type to avoid repetition
    const filtered = types.length > 1
      ? types.filter((t) => t !== lastMissionType)
      : types

    const bracket = BRACKETS.find((b) => score <= b.maxScore) ?? BRACKETS[BRACKETS.length - 1]
    const chosenType = filtered[Math.floor(Math.random() * filtered.length)]
    const matching = MISSION_REGISTRY.filter(
      (d) => d.type === chosenType && DIFFICULTY_ORDER[d.difficulty] <= DIFFICULTY_ORDER[bracket.maxDifficulty],
    )
    const definition = matching.length > 1
      ? matching[Math.floor(Math.random() * matching.length)]
      : matching[0]
    const mission = definition.generate()

    lastMissionType = chosenType
    return mission
  }

  function pickMissions(score: number): MissionParams[] {
    const count = getMissionCount(score)
    if (count === 1) return [pickMission(score)]

    const bracket = BRACKETS.find((b) => score <= b.maxScore) ?? BRACKETS[BRACKETS.length - 1]
    let availableTypes = bracket.missionTypes.filter(
      (t) => !MULTI_MISSION_EXCLUDE.includes(t),
    )
    if (count >= 3) {
      availableTypes = availableTypes.filter(
        (t) => !TRIPLE_MISSION_EXCLUDE.includes(t),
      )
    }

    const missions: MissionParams[] = []
    let prevType: MissionType | null = lastMissionType

    for (let i = 0; i < count; i++) {
      const filtered = availableTypes.length > 1
        ? availableTypes.filter((t) => t !== prevType)
        : availableTypes

      const chosenType = filtered[Math.floor(Math.random() * filtered.length)]
      const matching = MISSION_REGISTRY.filter(
        (d) => d.type === chosenType && DIFFICULTY_ORDER[d.difficulty] <= DIFFICULTY_ORDER[bracket.maxDifficulty],
      )
      const definition = matching.length > 1
        ? matching[Math.floor(Math.random() * matching.length)]
        : matching[0]
      let mission = definition.generate()

      // 다중 미션 시 MULTI_TAP tapCount 축소 (2~3)
      if (mission.type === 'MULTI_TAP' && mission.tapCount && mission.tapCount > 3) {
        const reducedCount = Math.random() < 0.5 ? 2 : 3
        mission = { ...mission, tapCount: reducedCount, text: `${reducedCount}번 탭!` }
      }

      missions.push(mission)
      prevType = chosenType
    }

    lastMissionType = prevType
    return missions
  }

  function reset() {
    lastMissionType = null
  }

  return { pickMission, pickMissions, getAvailableTypes, reset }
}

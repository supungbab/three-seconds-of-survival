import { MISSION_REGISTRY, type MissionParams, type MissionType } from '@/types/mission'

interface DifficultyBracket {
  maxScore: number
  missionTypes: MissionType[]
}

const BRACKETS: DifficultyBracket[] = [
  { maxScore: 5, missionTypes: ['COLOR_TAP', 'SWIPE', 'MULTI_TAP'] },
  { maxScore: 15, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP'] },
  { maxScore: 30, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP', 'LONG_PRESS', 'COLOR_TAP_NEGATIVE'] },
  { maxScore: Infinity, missionTypes: ['COLOR_TAP', 'SWIPE', 'REVERSE_SWIPE', 'MULTI_TAP', 'LONG_PRESS', 'DUAL_TAP', 'DO_NOTHING', 'SEQUENCE', 'COLOR_TAP_NEGATIVE'] },
]

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

    const chosenType = filtered[Math.floor(Math.random() * filtered.length)]
    const matching = MISSION_REGISTRY.filter((d) => d.type === chosenType)
    const definition = matching.length > 1
      ? matching[Math.floor(Math.random() * matching.length)]
      : matching[0]
    const mission = definition.generate()

    lastMissionType = chosenType
    return mission
  }

  function reset() {
    lastMissionType = null
  }

  return { pickMission, getAvailableTypes, reset }
}

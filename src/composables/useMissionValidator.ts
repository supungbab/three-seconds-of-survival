import type { InputAction } from '@/types/game'
import type { MissionParams } from '@/types/mission'

export function useMissionValidator() {
  function validate(mission: MissionParams, action: InputAction): boolean {
    switch (mission.type) {
      case 'WIRE_CUT':
        return action.type === 'TAP' // validation in component via emit

      case 'PARADROP':
        return (
          action.type === 'SWIPE' && action.direction === mission.swipeDirection
        )

      case 'COMPASS':
        return (
          action.type === 'SWIPE' && action.direction === mission.swipeDirection
        )

      case 'VENT':
        return (
          action.type === 'SWIPE' && action.direction === mission.swipeDirection
        )

      default:
        return false
    }
  }

  return { validate }
}

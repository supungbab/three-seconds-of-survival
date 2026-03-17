import type { InputAction } from '@/types/game'
import type { MissionParams } from '@/types/mission'

export function useMissionValidator() {
  function validate(mission: MissionParams, action: InputAction): boolean {
    switch (mission.type) {
      case 'COLOR_TAP':
        // TAP is accepted; actual color validation happens in ColorTapMission component
        return action.type === 'TAP'

      case 'SWIPE':
      case 'REVERSE_SWIPE':
        return (
          action.type === 'SWIPE' && action.direction === mission.swipeDirection
        )

      case 'MULTI_TAP':
        if (action.type === 'TAP') return false // individual taps don't pass
        if (action.type === 'MULTI_TAP') {
          return action.count >= (mission.tapCount ?? 5)
        }
        return false

      case 'LONG_PRESS':
        return action.type === 'LONG_PRESS'

      case 'DUAL_TAP':
        return action.type === 'DUAL_TAP'

      case 'DO_NOTHING':
        return false // any input = fail

      case 'COLOR_TAP_NEGATIVE':
        return action.type === 'TAP'

      case 'SEQUENCE':
        return false // handled directly in useGameState

      default:
        return false
    }
  }

  return { validate }
}

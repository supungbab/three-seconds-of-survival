import { ref, computed } from 'vue'
import { useVolt } from './useVolt'

const REVIVAL_COST = 10

export function useRevival() {
  const volt = useVolt()
  const revivalUsed = ref(false)

  const canRevive = computed(() => !revivalUsed.value && volt.balance.value >= REVIVAL_COST)

  function useRevival(): boolean {
    if (revivalUsed.value) return false
    if (!volt.spendVolt(REVIVAL_COST)) return false
    revivalUsed.value = true
    return true
  }

  function resetForNewGame() {
    revivalUsed.value = false
  }

  return {
    revivalUsed,
    revivalCost: REVIVAL_COST,
    canRevive,
    useRevival,
    resetForNewGame,
  }
}

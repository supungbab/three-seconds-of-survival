import { ref, watch } from 'vue'

const STORAGE_KEY = 'three_seconds_volt'

function load(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    return Math.max(0, Number(JSON.parse(raw)) || 0)
  } catch {
    return 0
  }
}

function save(val: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch {
    // ignore
  }
}

const balance = ref(load())

watch(balance, (v) => save(v))

function addVolt(amount: number) {
  balance.value += amount
}

function spendVolt(amount: number): boolean {
  if (balance.value < amount) return false
  balance.value -= amount
  return true
}

function rollVoltDrop(consecutiveClears: number): { dropped: boolean; amount: number } {
  const chance = consecutiveClears >= 10 ? 0.3 : 0.2
  const roll = Math.random()

  if (roll >= chance) return { dropped: false, amount: 0 }

  const min = consecutiveClears >= 20 ? 2 : 1
  const max = consecutiveClears >= 20 ? 5 : 3
  const amount = min + Math.floor(Math.random() * (max - min + 1))

  return { dropped: true, amount }
}

export function useVolt() {
  return { balance, addVolt, spendVolt, rollVoltDrop }
}

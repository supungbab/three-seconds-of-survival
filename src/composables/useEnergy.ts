import { ref, computed } from 'vue'

const STORAGE_KEY = 'three_seconds_energy'
const MAX_ENERGY = 30
const RECHARGE_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const PLAY_COST = 5

interface EnergyData {
  current: number
  lastRechargeAt: number
}

function load(): EnergyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { current: MAX_ENERGY, lastRechargeAt: Date.now() }
    const data = JSON.parse(raw)
    return {
      current: typeof data.current === 'number' ? data.current : MAX_ENERGY,
      lastRechargeAt: typeof data.lastRechargeAt === 'number' ? data.lastRechargeAt : Date.now(),
    }
  } catch {
    return { current: MAX_ENERGY, lastRechargeAt: Date.now() }
  }
}

function save(current: number, lastRechargeAt: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ current, lastRechargeAt }))
  } catch {
    // ignore
  }
}

const energy = ref(0)
const lastRechargeAt = ref(0)
const timeToNext = ref(0)

let tickInterval: number | undefined

function syncEnergy() {
  const stored = load()

  if (stored.current > MAX_ENERGY) {
    // Over cap (from rewards): no recharge
    energy.value = stored.current
    lastRechargeAt.value = Date.now()
    save(energy.value, lastRechargeAt.value)
    return
  }

  if (stored.current >= MAX_ENERGY) {
    energy.value = MAX_ENERGY
    lastRechargeAt.value = Date.now()
    save(energy.value, lastRechargeAt.value)
    return
  }

  const now = Date.now()
  const elapsed = now - stored.lastRechargeAt
  const recharged = Math.floor(elapsed / RECHARGE_INTERVAL_MS)
  const newEnergy = Math.min(stored.current + recharged, MAX_ENERGY)

  energy.value = newEnergy
  lastRechargeAt.value = stored.lastRechargeAt + recharged * RECHARGE_INTERVAL_MS
  save(energy.value, lastRechargeAt.value)
}

function startTick() {
  if (tickInterval !== undefined) return
  tickInterval = window.setInterval(() => {
    if (energy.value >= MAX_ENERGY) {
      timeToNext.value = 0
      return
    }
    // Over cap: no auto recharge
    if (energy.value > MAX_ENERGY) {
      timeToNext.value = 0
      return
    }

    const now = Date.now()
    const elapsed = now - lastRechargeAt.value
    if (elapsed >= RECHARGE_INTERVAL_MS) {
      const recharged = Math.floor(elapsed / RECHARGE_INTERVAL_MS)
      energy.value = Math.min(energy.value + recharged, MAX_ENERGY)
      lastRechargeAt.value += recharged * RECHARGE_INTERVAL_MS
      save(energy.value, lastRechargeAt.value)
    }
    timeToNext.value = Math.max(0, Math.ceil((RECHARGE_INTERVAL_MS - (Date.now() - lastRechargeAt.value)) / 1000))
  }, 1000)
}

function stopTick() {
  if (tickInterval !== undefined) {
    clearInterval(tickInterval)
    tickInterval = undefined
  }
}

// Sync on visibility change (tab return)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncEnergy()
    }
  })
}

// Initial sync
syncEnergy()

const isFull = computed(() => energy.value >= MAX_ENERGY)
const canPlay = computed(() => energy.value >= PLAY_COST)

function consumeEnergy(amount = PLAY_COST): boolean {
  if (energy.value < amount) return false
  energy.value -= amount
  // If we went from at/over cap to below, set recharge start
  if (energy.value < MAX_ENERGY) {
    lastRechargeAt.value = Date.now()
  }
  save(energy.value, lastRechargeAt.value)
  return true
}

function addEnergy(amount: number) {
  energy.value += amount
  save(energy.value, lastRechargeAt.value)
}

export function useEnergy() {
  return {
    energy,
    maxEnergy: MAX_ENERGY,
    playCost: PLAY_COST,
    timeToNext,
    isFull,
    canPlay,
    consumeEnergy,
    addEnergy,
    startTick,
    stopTick,
    syncEnergy,
  }
}

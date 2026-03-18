import { ref, watch } from 'vue'

const STORAGE_KEY = 'three_seconds_settings'

interface Settings {
  soundEnabled: boolean
  volume: number
}

const defaults: Settings = { soundEnabled: true, volume: 0.7 }

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

const stored = load()
const soundEnabled = ref(stored.soundEnabled)
const volume = ref(stored.volume)

watch([soundEnabled, volume], () => {
  save({ soundEnabled: soundEnabled.value, volume: volume.value })
})

export function useSettings() {
  return { soundEnabled, volume }
}

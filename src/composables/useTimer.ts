import { ref } from 'vue'

export function useTimer() {
  const progress = ref(1)
  const isRunning = ref(false)

  let startTime = 0
  let duration = 0
  let rafId = 0
  let onTimeout: (() => void) | null = null

  function tick() {
    const elapsed = performance.now() - startTime
    const remaining = 1 - elapsed / duration
    if (remaining <= 0) {
      progress.value = 0
      isRunning.value = false
      onTimeout?.()
      return
    }
    progress.value = remaining
    rafId = requestAnimationFrame(tick)
  }

  function start(durationMs: number, onTimeoutCb: () => void) {
    stop()
    duration = durationMs
    startTime = performance.now()
    onTimeout = onTimeoutCb
    isRunning.value = true
    progress.value = 1
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    isRunning.value = false
    onTimeout = null
  }

  function reset() {
    stop()
    progress.value = 1
  }

  return { progress, isRunning, start, stop, reset }
}

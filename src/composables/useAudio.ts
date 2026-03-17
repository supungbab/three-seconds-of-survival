let audioCtx: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = 0.3
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }

  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function useAudio() {
  function playSuccess() {
    playTone(880, 0.15, 'sine')
    setTimeout(() => playTone(1320, 0.2, 'sine'), 80)
  }

  function playFail() {
    playTone(200, 0.3, 'square')
    setTimeout(() => playTone(150, 0.4, 'square'), 150)
  }

  function playTick() {
    playTone(600, 0.05, 'sine')
  }

  function ensureContext() {
    getContext()
  }

  return { playSuccess, playFail, playTick, ensureContext }
}

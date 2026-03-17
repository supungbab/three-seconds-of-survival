import { ref } from 'vue'

export function useFeedback() {
  const isShaking = ref(false)
  const showFlash = ref(false)
  const flashColor = ref('red')
  const particles = ref<{ id: number; x: number; y: number; dx: number; dy: number; color: string }[]>([])

  let particleId = 0
  let shakeTimer: number | undefined
  let flashTimer: number | undefined
  let particleClearTimer: number | undefined

  function triggerShake() {
    isShaking.value = true
    if (shakeTimer !== undefined) clearTimeout(shakeTimer)
    shakeTimer = window.setTimeout(() => {
      isShaking.value = false
      shakeTimer = undefined
    }, 300)
  }

  function triggerFlash(color = 'red') {
    flashColor.value = color
    showFlash.value = true
    if (flashTimer !== undefined) clearTimeout(flashTimer)
    flashTimer = window.setTimeout(() => {
      showFlash.value = false
      flashTimer = undefined
    }, 400)
  }

  function triggerParticles(x: number, y: number, color = '#00e676') {
    const count = 12
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 60 + Math.random() * 80
      newParticles.push({
        id: ++particleId,
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color,
      })
    }
    particles.value = newParticles
    if (particleClearTimer !== undefined) clearTimeout(particleClearTimer)
    particleClearTimer = window.setTimeout(() => {
      particles.value = []
      particleClearTimer = undefined
    }, 600)
  }

  function successFeedback(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    triggerShake()
    triggerFlash('#00e676')
    triggerParticles(x, y, '#00e676')
  }

  function failFeedback() {
    triggerShake()
    triggerFlash('#ff3b5c')
  }

  return {
    isShaking,
    showFlash,
    flashColor,
    particles,
    successFeedback,
    failFeedback,
    triggerShake,
    triggerFlash,
    triggerParticles,
  }
}

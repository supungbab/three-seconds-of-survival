<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const props = defineProps<{
  firewallCount: number
}>()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT']
const DIR_ARROWS: Record<Direction, string> = {
  UP: '↓',    // arrow shows approach direction (coming from top → arrow points down visually)
  DOWN: '↑',
  LEFT: '→',
  RIGHT: '←',
}
const DIR_SWIPE_ARROW: Record<Direction, string> = {
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
}
const DIR_TRANSLATE: Record<Direction, string> = {
  UP: 'translateY(-56px)',
  DOWN: 'translateY(56px)',
  LEFT: 'translateX(-56px)',
  RIGHT: 'translateX(56px)',
}

const containerEl = ref<HTMLElement | null>(null)
const packets = ref<Direction[]>([])
const currentIndex = ref(0)
const blocked = ref<boolean[]>([])
const showShield = ref(false)
let resolved = false
let shieldTimerId: ReturnType<typeof setTimeout> | null = null

// Swipe detection state
let touchStartX = 0
let touchStartY = 0
const MIN_SWIPE = 30

const currentPacket = computed(() =>
  currentIndex.value < packets.value.length ? packets.value[currentIndex.value] : null,
)
const progress = computed(() => `${currentIndex.value}/${props.firewallCount}`)

onMounted(() => {
  const dirs: Direction[] = []
  for (let i = 0; i < props.firewallCount; i++) {
    dirs.push(pickRandom(DIRECTIONS))
  }
  packets.value = dirs
  blocked.value = new Array(props.firewallCount).fill(false)

  if (!containerEl.value) return
  const el = containerEl.value
  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('touchend', onTouchEnd, { passive: false })
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  if (shieldTimerId !== null) clearTimeout(shieldTimerId)
  if (!containerEl.value) return
  const el = containerEl.value
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchmove', onTouchMove)
  el.removeEventListener('touchend', onTouchEnd)
  el.removeEventListener('mousedown', onMouseDown)
  el.removeEventListener('mouseup', onMouseUp)
})

function detectDirection(dx: number, dy: number): Direction | null {
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  if (absDx < MIN_SWIPE && absDy < MIN_SWIPE) return null
  if (absDx > absDy) {
    return dx > 0 ? 'RIGHT' : 'LEFT'
  } else {
    return dy > 0 ? 'DOWN' : 'UP'
  }
}

function handleSwipe(dir: Direction) {
  if (resolved || !currentPacket.value) return
  const expected = currentPacket.value

  if (dir === expected) {
    blocked.value[currentIndex.value] = true
    showShield.value = true
    playTick()
    shieldTimerId = setTimeout(() => { showShield.value = false }, 200)
    currentIndex.value++
    if (currentIndex.value >= props.firewallCount) {
      resolved = true
      emit('tap', true)
    }
  } else {
    resolved = true
    emit('tap', false)
  }
}

// Touch handlers
function onTouchStart(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  const t = e.touches[0]
  touchStartX = t.clientX
  touchStartY = t.clientY
}

function onTouchMove(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
}

function onTouchEnd(e: TouchEvent) {
  e.stopPropagation()
  if (e.cancelable) e.preventDefault()
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStartX
  const dy = t.clientY - touchStartY
  const dir = detectDirection(dx, dy)
  if (dir) handleSwipe(dir)
}

// Mouse handlers
let mouseStartX = 0
let mouseStartY = 0

function onMouseDown(e: MouseEvent) {
  e.stopPropagation()
  mouseStartX = e.clientX
  mouseStartY = e.clientY
}

function onMouseUp(e: MouseEvent) {
  e.stopPropagation()
  const dx = e.clientX - mouseStartX
  const dy = e.clientY - mouseStartY
  const dir = detectDirection(dx, dy)
  if (dir) handleSwipe(dir)
}
</script>

<template>
  <div ref="containerEl" class="firewall-mission">
    <div class="progress-label">{{ progress }}</div>

    <div class="arena">
      <div class="grid-bg" />
      <div class="defense-ring" :class="{ shielded: showShield }" />

      <!-- Server core -->
      <div class="server-core" :class="{ shielded: showShield }">
        <span class="server-icon">⬡</span>
      </div>

      <!-- Approaching packet -->
      <div
        v-if="currentPacket"
        class="virus-packet"
        :key="currentIndex"
        :style="{ transform: DIR_TRANSLATE[currentPacket] }"
      >
        <span class="packet-icon">☠</span>
      </div>
    </div>

    <div class="hint">{{ currentPacket ? DIR_SWIPE_ARROW[currentPacket] : '' }}</div>
  </div>
</template>

<style scoped>
.firewall-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  gap: 12px;
  touch-action: none;
  min-height: 200px;
}

.progress-label {
  font-size: 16px;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.arena {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.grid-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 30%, rgba(140, 200, 144, 0.03) 70%),
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(140, 200, 144, 0.06) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(140, 200, 144, 0.06) 20px);
  border: 1px solid rgba(140, 200, 144, 0.1);
}

.defense-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 1px dashed rgba(140, 200, 144, 0.2);
  transition: all 0.2s;
}

.defense-ring.shielded {
  border-color: var(--px-green-bright);
  box-shadow: 0 0 20px rgba(140, 200, 144, 0.3);
  animation: shield-flash 0.2s ease-out;
}

@keyframes shield-flash {
  from { box-shadow: 0 0 40px rgba(140, 200, 144, 0.6); }
  to { box-shadow: 0 0 20px rgba(140, 200, 144, 0.3); }
}

.server-core {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--px-green-border);
  background: rgba(140, 200, 144, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.2s;
}

.server-core.shielded {
  border-color: var(--px-green-bright);
  background: rgba(140, 200, 144, 0.12);
  box-shadow: 0 0 16px var(--px-green-glow-strong);
}

.server-icon {
  font-size: 20px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.virus-packet {
  position: absolute;
  width: 32px;
  height: 32px;
  border: 2px solid var(--arc-danger);
  border-radius: 50%;
  background: rgba(255, 59, 92, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  animation: packet-approach 0.3s ease-out, packet-pulse 0.4s ease-in-out 0.3s infinite alternate;
}

.packet-icon {
  font-size: 16px;
  color: var(--arc-danger);
  text-shadow: 0 0 8px rgba(255, 59, 92, 0.8);
}

.hint {
  font-size: 24px;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

@keyframes packet-approach {
  from { opacity: 0; scale: 0.5; }
  to { opacity: 1; scale: 1; }
}

@keyframes packet-pulse {
  from { box-shadow: 0 0 6px rgba(255, 59, 92, 0.3); }
  to { box-shadow: 0 0 20px rgba(255, 59, 92, 0.7); }
}
</style>

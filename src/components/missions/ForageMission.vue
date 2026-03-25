<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle, pickRandom } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Mushroom {
  id: number
  safe: boolean
  x: number
  y: number
  color: string
}

const mushrooms = ref<Mushroom[]>([])
let resolved = false


onMounted(() => {
  const count = 3 + Math.floor(Math.random() * 2) // 3 or 4
  const safeIdx = Math.floor(Math.random() * count)
  const poisonColors = ['var(--arc-danger)', '#a855f7']

  const items: Mushroom[] = []
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      safe: i === safeIdx,
      x: 15 + Math.random() * 60,
      y: 10 + Math.random() * 50,
      color: i === safeIdx
        ? 'var(--px-green-bright)'
        : pickRandom(poisonColors),
    })
  }
  mushrooms.value = shuffle(items)
})

function handleTap(m: Mushroom, e: Event) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', m.safe)
}
</script>

<template>
  <div class="forage-mission">
    <div class="forage-label">{{ t('채집: 안전한 것을 탭하세요') }}</div>
    <div class="forage-field">
      <button
        v-for="m in mushrooms"
        :key="m.id"
        class="forage-mushroom"
        :style="{
          left: m.x + '%',
          top: m.y + '%',
          color: m.color,
          textShadow: `0 0 12px ${m.color}`,
        }"
        @pointerdown="(e) => handleTap(m, e)"
      >
        ▲
      </button>
    </div>
  </div>
</template>

<style scoped>
.forage-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.forage-label {
  font-size: 14px;
  font-family: monospace;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.forage-field {
  position: relative;
  width: 220px;
  height: 120px;
  background: var(--px-green-bg);
  border: 2px solid var(--px-green-bright);
  border-radius: 0;
  box-shadow:
    0 0 0 2px var(--px-green-frame),
    inset 1px 1px 0 var(--px-green-bevel-light),
    inset -1px -1px 0 var(--px-green-bevel-dark);
}

.forage-mushroom {
  position: absolute;
  font-size: 32px;
  font-family: monospace;
  font-weight: 700;
  background: none;
  border: none;
  border-radius: 0;
  cursor: pointer;
  padding: 4px;
  transform: translate(-50%, -50%);
}

.forage-mushroom:active {
  transform: translate(-50%, -50%) scale(0.85);
}
</style>

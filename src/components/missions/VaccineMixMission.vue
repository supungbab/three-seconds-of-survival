<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { useI18n } from '@/composables/useI18n'
import { shuffle } from '@/utils/random'

const { playTick } = useAudio()
const { t } = useI18n()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

type Vial = { id: number; color: string; label: string }

const ALL_VIALS: Vial[] = [
  { id: 0, color: '#ff3b5c', label: '빨강' },
  { id: 1, color: '#4a9eff', label: '파랑' },
  { id: 2, color: '#ffd644', label: '노랑' },
  { id: 3, color: '#8cc890', label: '초록' },
]

const vials = ref<Vial[]>([])
const target = ref<[number, number]>([0, 1])
const selected = ref<number[]>([])
const prompt = ref('')
let resolved = false


onMounted(() => {
  vials.value = shuffle([...ALL_VIALS])
  const indices = shuffle([0, 1, 2, 3]).slice(0, 2).sort() as [number, number]
  target.value = indices
  const a = ALL_VIALS[indices[0]]
  const b = ALL_VIALS[indices[1]]
  prompt.value = `${t('혼합')}: ${a.label} + ${b.label}`
})

function handleTap(vial: Vial, e: PointerEvent) {
  e.stopPropagation()
  if (resolved) return
  if (selected.value.includes(vial.id)) return

  if (!target.value.includes(vial.id)) {
    resolved = true
    emit('tap', false)
    return
  }

  selected.value.push(vial.id)
  playTick()

  if (selected.value.length >= 2) {
    resolved = true
    emit('tap', true)
  }
}
</script>

<template>
  <div class="vaccine-mission">
    <div class="prompt">{{ prompt }}</div>
    <div class="vial-row">
      <button
        v-for="vial in vials"
        :key="vial.id"
        class="vial"
        :class="{ selected: selected.includes(vial.id) }"
        :style="{ '--vial-color': vial.color }"
        @pointerdown="handleTap(vial, $event)"
      >
        <div class="liquid" />
        <span class="vial-label">{{ vial.label }}</span>
      </button>
    </div>
    <div class="status">
      {{ selected.length }} / 2 {{ t('선택됨') }}
    </div>
  </div>
</template>

<style scoped>
.vaccine-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 24px;
  gap: 14px;
  min-height: 180px;
}

.prompt {
  font-size: 16px;
  font-weight: 700;
  color: var(--px-green-bright);
  text-shadow: 0 0 8px var(--px-green-glow);
}

.vial-row {
  display: flex;
  gap: 12px;
}

.vial {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 52px;
  height: 80px;
  border: 2px solid var(--arc-muted);
  background: #0c140c;
  cursor: pointer;
  padding: 0;
  position: relative;
  overflow: hidden;
  border-radius: 0;
}

.vial.selected {
  border-color: var(--px-green-bright);
  box-shadow: 0 0 12px var(--px-green-glow);
}

.liquid {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60%;
  background: var(--vial-color);
  opacity: 0.7;
  box-shadow: 0 0 10px var(--vial-color);
}

.vial-label {
  position: relative;
  z-index: 1;
  margin-top: auto;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px #000;
}

.status {
  font-size: 13px;
  color: var(--arc-muted);
}
</style>

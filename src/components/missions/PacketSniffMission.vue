<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

interface Packet {
  id: string
  hex: string
  infected: boolean
}

const packets = ref<Packet[]>([])

function randomHex(): string {
  return '0x' + Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')
}

onMounted(() => {
  const count = 5 + Math.floor(Math.random() * 2)
  const infectedCount = 1 + Math.floor(Math.random() * 2)
  const infectedIndices = new Set<number>()
  while (infectedIndices.size < infectedCount) {
    infectedIndices.add(Math.floor(Math.random() * count))
  }
  const result: Packet[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      id: `PKT_${randomHex()}`,
      hex: randomHex(),
      infected: infectedIndices.has(i),
    })
  }
  packets.value = result
})

function handleTap(e: Event, pkt: Packet) {
  e.stopPropagation()
  playTick()
  emit('tap', pkt.infected)
}
</script>

<template>
  <div class="packet-sniff-mission">
    <div class="terminal-header">[ PACKET MONITOR ]</div>
    <div class="packet-log">
      <button
        v-for="(pkt, i) in packets"
        :key="i"
        class="packet-row"
        :class="{ infected: pkt.infected }"
        :style="{ animationDelay: `${i * 0.15}s` }"
        @pointerdown="(e) => handleTap(e, pkt)"
      >
        <span class="pkt-id">{{ pkt.id }}</span>
        <span class="pkt-status" :class="pkt.infected ? 'status-bad' : 'status-ok'">
          {{ pkt.infected ? 'INFECTED' : 'OK' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.packet-sniff-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.terminal-header {
  font-family: monospace;
  font-size: 12px;
  color: var(--arc-muted);
  letter-spacing: 2px;
}

.packet-log {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 280px;
  overflow: hidden;
}

.packet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--px-green-bg);
  border: 1px solid var(--px-green-bright);
  border-radius: 0;
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
  animation: scroll-in 0.3s ease-out both;
  opacity: 0;
}

.packet-row:active {
  transform: scale(0.96);
  filter: brightness(1.3);
}

.pkt-id {
  font-family: monospace;
}

.pkt-status {
  font-family: monospace;
  font-weight: 700;
  font-size: 11px;
  padding: 2px 6px;
}

.status-ok {
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.status-bad {
  color: var(--arc-danger);
  text-shadow: 0 0 8px var(--arc-danger-glow);
  animation: blink-infected 0.6s ease-in-out infinite;
}

@keyframes scroll-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink-infected {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

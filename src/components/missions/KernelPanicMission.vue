<script setup lang="ts">
import { ref } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { playTick } = useAudio()

const emit = defineEmits<{
  tap: [correct: boolean]
}>()

const commands = ref<{ label: string; correct: boolean }[]>([])
let resolved = false

const ERROR_LINES = [
  'FATAL: unable to handle kernel NULL pointer dereference',
  'EIP: [<c0124f0a>] sched_clock+0x1a/0x30',
  'Process swapper (pid: 0, ti=c076a000)',
  'Stack: c07a3f80 c012ae82 00000046 00099100',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

commands.value = shuffle([
  { label: 'REBOOT SYS', correct: true },
  { label: 'FORMAT ALL', correct: false },
  { label: 'DUMP CORE', correct: false },
])

function handleTap(e: PointerEvent, cmd: { label: string; correct: boolean }) {
  e.stopPropagation()
  if (resolved) return
  resolved = true
  playTick()
  emit('tap', cmd.correct)
}
</script>

<template>
  <div class="kernel-panic-mission">
    <div class="panic-header">KERNEL PANIC</div>
    <div class="error-log">
      <div v-for="(line, i) in ERROR_LINES" :key="i" class="error-line">{{ line }}</div>
    </div>
    <div class="panic-prompt">SELECT RECOVERY COMMAND:</div>
    <div class="commands">
      <button
        v-for="(cmd, i) in commands"
        :key="i"
        class="cmd-btn"
        @pointerdown="(e) => handleTap(e, cmd)"
      >
        &gt; {{ cmd.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kernel-panic-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  font-family: monospace;
  min-height: 180px;
}

.panic-header {
  font-size: 22px;
  font-weight: 700;
  color: var(--arc-danger);
  text-shadow: 0 0 12px var(--arc-danger-glow);
  animation: panic-blink 0.5s steps(2) infinite;
}

.error-log {
  width: 100%;
  background: #0a0a0a;
  border: 1px solid var(--arc-danger);
  padding: 6px 8px;
  font-size: 9px;
  color: var(--arc-muted);
  overflow: hidden;
  max-height: 56px;
  border-radius: 0;
}

.error-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panic-prompt {
  font-size: 12px;
  color: var(--px-green-bright);
  text-shadow: 0 0 6px var(--px-green-glow);
}

.commands {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.cmd-btn {
  background: #0c140c;
  border: 1px solid var(--px-green-bright);
  color: var(--px-green-bright);
  font-family: monospace;
  font-size: 14px;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 0;
  text-shadow: 0 0 6px var(--px-green-glow);
  box-shadow: 0 0 4px var(--px-green-glow);
}

.cmd-btn:active {
  background: var(--px-green-bg);
  filter: brightness(1.3);
}

@keyframes panic-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.3; }
}
</style>

<script setup lang="ts">
import { usePressable } from '@/composables/usePressable'
import { ref, onMounted } from 'vue'

defineProps<{
  bestScore: number
}>()

const emit = defineEmits<{
  start: []
}>()

const start = usePressable(() => emit('start'))
const mounted = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})
</script>

<template>
  <div class="arcade-screen" :class="{ 'is-ready': mounted }">
    <!-- Scanline overlay -->
    <div class="scanlines" />

    <!-- Stars -->
    <div class="stars">
      <span v-for="i in 30" :key="i" class="star" :style="{
        left: `${(i * 37 + i * i * 3) % 100}%`,
        top: `${(i * 23 + i * 7) % 55}%`,
        animationDelay: `${(i * 0.7) % 4}s`,
        animationDuration: `${1.5 + (i % 3) * 0.8}s`
      }" />
    </div>

    <!-- Main content -->
    <div class="arcade-content">
      <!-- Title block -->
      <div class="title-block">
        <div class="title-big">
          <span class="title-num">3</span><span class="title-unit">초</span>
        </div>
        <div class="title-sub">생존 게임</div>
        <div class="title-tagline">미션을 3초 안에 클리어하라!</div>
      </div>

      <!-- Start button -->
      <button class="arcade-btn arcade-btn--primary" @click="start.onClick">
        <span class="arcade-btn__icon">▶</span>
        <span class="arcade-btn__text">
          <span class="arcade-btn__label">게임 시작</span>
          <span class="arcade-btn__sub">START GAME</span>
        </span>
      </button>

      <!-- Best score -->
      <div v-if="bestScore > 0" class="score-badge">
        <span class="score-badge__label">최고 점수</span>
        <span class="score-badge__value">{{ bestScore }}<span class="score-badge__unit">점</span></span>
      </div>

      <div v-else class="first-play">첫 도전을 시작하세요!</div>
    </div>

    <!-- City skyline -->
    <div class="skyline">
      <div class="skyline__layer skyline__layer--back">
        <div class="building" style="--w: 28px; --h: 70px; --x: 3%" />
        <div class="building" style="--w: 22px; --h: 95px; --x: 10%" />
        <div class="building" style="--w: 35px; --h: 55px; --x: 17%" />
        <div class="building" style="--w: 18px; --h: 110px; --x: 26%" />
        <div class="building" style="--w: 40px; --h: 65px; --x: 33%" />
        <div class="building" style="--w: 25px; --h: 85px; --x: 42%" />
        <div class="building" style="--w: 20px; --h: 120px; --x: 50%" />
        <div class="building" style="--w: 32px; --h: 60px; --x: 58%" />
        <div class="building" style="--w: 24px; --h: 100px; --x: 66%" />
        <div class="building" style="--w: 38px; --h: 50px; --x: 74%" />
        <div class="building" style="--w: 20px; --h: 80px; --x: 82%" />
        <div class="building" style="--w: 30px; --h: 70px; --x: 90%" />
      </div>
      <div class="skyline__layer skyline__layer--front">
        <div class="building" style="--w: 34px; --h: 50px; --x: 0%" />
        <div class="building" style="--w: 26px; --h: 75px; --x: 8%" />
        <div class="building" style="--w: 42px; --h: 40px; --x: 15%" />
        <div class="building" style="--w: 20px; --h: 90px; --x: 24%" />
        <div class="building" style="--w: 30px; --h: 55px; --x: 32%" />
        <div class="building" style="--w: 36px; --h: 70px; --x: 40%" />
        <div class="building" style="--w: 22px; --h: 85px; --x: 49%" />
        <div class="building" style="--w: 28px; --h: 45px; --x: 57%" />
        <div class="building" style="--w: 40px; --h: 65px; --x: 64%" />
        <div class="building" style="--w: 18px; --h: 95px; --x: 73%" />
        <div class="building" style="--w: 32px; --h: 55px; --x: 80%" />
        <div class="building" style="--w: 26px; --h: 75px; --x: 88%" />
        <div class="building" style="--w: 30px; --h: 45px; --x: 95%" />
      </div>
      <div class="skyline__ground" />
    </div>

    <!-- Version -->
    <div class="version">ver 1.0</div>
  </div>
</template>

<style scoped>
/* ─── Screen ─── */
.arcade-screen {
  position: relative;
  height: 100dvh;
  background: var(--arc-bg);
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(57, 255, 20, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(255, 184, 0, 0.04) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  font-family: 'Galmuri11', monospace;
  -webkit-user-select: none;
  user-select: none;
}

/* ─── Scanlines ─── */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 10;
}

/* ─── Stars ─── */
.stars {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--arc-text);
  border-radius: 50%;
  opacity: 0;
  animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.9; }
}

/* ─── Content ─── */
.arcade-content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 0 24px;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.is-ready .arcade-content {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Title ─── */
.title-block {
  text-align: center;
  margin-bottom: 8px;
}

.title-big {
  line-height: 1;
  margin-bottom: 4px;
}

.title-num {
  font-size: 96px;
  font-weight: 900;
  color: var(--arc-green);
  text-shadow:
    0 0 20px var(--arc-green-glow),
    0 0 60px var(--arc-green-glow),
    0 0 120px rgba(57, 255, 20, 0.15);
  letter-spacing: -4px;
  display: inline-block;
  animation: num-breathe 3s ease-in-out infinite;
}

@keyframes num-breathe {
  0%, 100% {
    text-shadow:
      0 0 20px var(--arc-green-glow),
      0 0 60px var(--arc-green-glow),
      0 0 120px rgba(57, 255, 20, 0.15);
  }
  50% {
    text-shadow:
      0 0 30px var(--arc-green-glow),
      0 0 80px var(--arc-green-glow),
      0 0 160px rgba(57, 255, 20, 0.25);
  }
}

.title-unit {
  font-size: 48px;
  font-weight: 900;
  color: var(--arc-text);
  margin-left: 2px;
}

.title-sub {
  font-size: 36px;
  font-weight: 700;
  color: var(--arc-text);
  letter-spacing: 8px;
  margin-top: 4px;
}

.title-tagline {
  font-size: 13px;
  color: var(--arc-muted);
  margin-top: 12px;
  letter-spacing: 1px;
}

/* ─── Arcade Button ─── */
.arcade-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 32px;
  border: 2px solid var(--arc-green);
  border-radius: 4px;
  background: rgba(57, 255, 20, 0.06);
  color: var(--arc-green);
  font-family: 'Galmuri11', monospace;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow:
    0 0 12px rgba(57, 255, 20, 0.15),
    inset 0 0 12px rgba(57, 255, 20, 0.05);
}

.arcade-btn:hover {
  background: rgba(57, 255, 20, 0.12);
  box-shadow:
    0 0 24px rgba(57, 255, 20, 0.25),
    inset 0 0 20px rgba(57, 255, 20, 0.08);
  transform: scale(1.02);
}

.arcade-btn:active {
  transform: scale(0.97);
  background: rgba(57, 255, 20, 0.2);
}

.arcade-btn--primary {
  animation: btn-pulse 2.5s ease-in-out infinite;
}

@keyframes btn-pulse {
  0%, 100% {
    box-shadow:
      0 0 12px rgba(57, 255, 20, 0.15),
      inset 0 0 12px rgba(57, 255, 20, 0.05);
  }
  50% {
    box-shadow:
      0 0 20px rgba(57, 255, 20, 0.3),
      inset 0 0 16px rgba(57, 255, 20, 0.08);
  }
}

.arcade-btn__icon {
  font-size: 22px;
  line-height: 1;
}

.arcade-btn__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.arcade-btn__label {
  font-size: 20px;
  font-weight: 700;
}

.arcade-btn__sub {
  font-size: 10px;
  color: var(--arc-green-dim);
  letter-spacing: 2px;
}

/* ─── Score Badge ─── */
.score-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: var(--arc-surface);
  border: 1px solid var(--arc-surface-light);
  border-radius: 4px;
}

.score-badge__label {
  font-size: 13px;
  color: var(--arc-muted);
}

.score-badge__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--arc-amber);
  text-shadow: 0 0 16px rgba(255, 184, 0, 0.3);
}

.score-badge__unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--arc-amber);
  margin-left: 2px;
  opacity: 0.7;
}

.first-play {
  font-size: 14px;
  color: var(--arc-muted);
  opacity: 0.7;
}

/* ─── Skyline ─── */
.skyline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  z-index: 2;
  pointer-events: none;
}

.skyline__layer {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  height: 100%;
}

.building {
  position: absolute;
  bottom: 0;
  left: var(--x);
  width: var(--w);
  height: var(--h);
  border-radius: 2px 2px 0 0;
}

.skyline__layer--back .building {
  background: var(--arc-building-back);
  opacity: 0.7;
}

.skyline__layer--front .building {
  background: var(--arc-building-front);
}

/* Window lights on front buildings */
.skyline__layer--front .building::before {
  content: '';
  position: absolute;
  inset: 6px 4px 8px;
  background-image:
    radial-gradient(circle, rgba(255, 200, 50, 0.5) 1px, transparent 1px);
  background-size: 8px 10px;
  background-position: 0 0;
  opacity: 0.4;
}

.skyline__ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: var(--arc-building-front);
}

/* ─── Version ─── */
.version {
  position: absolute;
  bottom: 14px;
  right: 16px;
  font-size: 10px;
  color: var(--arc-muted);
  opacity: 0.4;
  z-index: 6;
}
</style>

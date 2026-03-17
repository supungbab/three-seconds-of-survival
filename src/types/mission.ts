import type { Difficulty, MissionColor, SequenceStep, SwipeDirection } from './game'

const DIRECTION_ICONS: Record<SwipeDirection, string> = {
  UP: '위',
  DOWN: '아래',
  LEFT: '왼쪽',
  RIGHT: '오른쪽',
}

export type MissionType =
  | 'COLOR_TAP'
  | 'SWIPE'
  | 'REVERSE_SWIPE'
  | 'MULTI_TAP'
  | 'LONG_PRESS'
  | 'DUAL_TAP'
  | 'DO_NOTHING'
  | 'COLOR_TAP_NEGATIVE'
  | 'SEQUENCE'

export interface MissionParams {
  type: MissionType
  text: string
  difficulty: Difficulty
  targetColor?: MissionColor
  colors?: MissionColor[]
  swipeDirection?: SwipeDirection
  tapCount?: number
  negative?: boolean
  sequence?: SequenceStep[]
}

export interface MissionDefinition {
  type: MissionType
  difficulty: Difficulty
  generate: () => MissionParams
}

const COLOR_NAMES: Record<MissionColor, string> = {
  red: '빨간색',
  blue: '파란색',
  yellow: '노란색',
  green: '초록색',
  purple: '보라색',
}

const ALL_COLORS: MissionColor[] = ['red', 'blue', 'yellow', 'green', 'purple']

const DIRECTION_NAMES: Record<SwipeDirection, string> = {
  UP: '위로!',
  DOWN: '아래로!',
  LEFT: '왼쪽으로!',
  RIGHT: '오른쪽으로!',
}

const OPPOSITE: Record<SwipeDirection, SwipeDirection> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateColorChoices(target: MissionColor, count: number): MissionColor[] {
  const others = ALL_COLORS.filter((c) => c !== target)
  const distractors = shuffle(others).slice(0, count - 1)
  return shuffle([target, ...distractors])
}

export const MISSION_REGISTRY: MissionDefinition[] = [
  // COLOR_TAP - EASY
  {
    type: 'COLOR_TAP',
    difficulty: 'EASY',
    generate() {
      const target = pickRandom(ALL_COLORS)
      return {
        type: 'COLOR_TAP',
        difficulty: 'EASY',
        text: `${COLOR_NAMES[target]} 탭!`,
        targetColor: target,
        colors: generateColorChoices(target, 3),
      }
    },
  },
  // SWIPE - EASY
  {
    type: 'SWIPE',
    difficulty: 'EASY',
    generate() {
      const dir = pickRandom<SwipeDirection>(['UP', 'DOWN', 'LEFT', 'RIGHT'])
      return {
        type: 'SWIPE',
        difficulty: 'EASY',
        text: DIRECTION_NAMES[dir],
        swipeDirection: dir,
      }
    },
  },
  // REVERSE_SWIPE - NORMAL
  {
    type: 'REVERSE_SWIPE',
    difficulty: 'NORMAL',
    generate() {
      const dir = pickRandom<SwipeDirection>(['UP', 'DOWN', 'LEFT', 'RIGHT'])
      return {
        type: 'REVERSE_SWIPE',
        difficulty: 'NORMAL',
        text: `반대로! ${DIRECTION_NAMES[dir]}`,
        swipeDirection: OPPOSITE[dir],
      }
    },
  },
  // MULTI_TAP - NORMAL
  {
    type: 'MULTI_TAP',
    difficulty: 'NORMAL',
    generate() {
      const count = pickRandom([5, 7, 10])
      return {
        type: 'MULTI_TAP',
        difficulty: 'NORMAL',
        text: `${count}번 탭!`,
        tapCount: count,
      }
    },
  },
  // LONG_PRESS - NORMAL
  {
    type: 'LONG_PRESS',
    difficulty: 'NORMAL',
    generate() {
      return {
        type: 'LONG_PRESS',
        difficulty: 'NORMAL',
        text: '길게 눌러!',
      }
    },
  },
  // DUAL_TAP - HARD
  {
    type: 'DUAL_TAP',
    difficulty: 'HARD',
    generate() {
      return {
        type: 'DUAL_TAP',
        difficulty: 'HARD',
        text: '둘 다 탭!',
      }
    },
  },
  // DOUBLE_TAP (MULTI_TAP tapCount=2) - EASY
  {
    type: 'MULTI_TAP',
    difficulty: 'EASY',
    generate() {
      return {
        type: 'MULTI_TAP',
        difficulty: 'EASY',
        text: '2번 탭!',
        tapCount: 2,
      }
    },
  },
  // DO_NOTHING - HARD
  {
    type: 'DO_NOTHING',
    difficulty: 'HARD',
    generate() {
      return {
        type: 'DO_NOTHING',
        difficulty: 'HARD',
        text: '누르지 마!',
      }
    },
  },
  // COLOR_TAP_NEGATIVE - HARD
  {
    type: 'COLOR_TAP_NEGATIVE',
    difficulty: 'HARD',
    generate() {
      const target = pickRandom(ALL_COLORS)
      return {
        type: 'COLOR_TAP_NEGATIVE',
        difficulty: 'HARD',
        text: `${COLOR_NAMES[target]} 빼고 탭!`,
        targetColor: target,
        colors: shuffle(ALL_COLORS),
        negative: true,
      }
    },
  },
  // SEQUENCE - HARD
  {
    type: 'SEQUENCE',
    difficulty: 'HARD',
    generate() {
      const actions: SequenceStep[] = []
      const pool: SequenceStep[] = [
        { action: 'TAP' },
        { action: 'SWIPE', direction: 'UP' },
        { action: 'SWIPE', direction: 'DOWN' },
        { action: 'SWIPE', direction: 'LEFT' },
        { action: 'SWIPE', direction: 'RIGHT' },
      ]
      const stepCount = pickRandom([2, 3])
      for (let i = 0; i < stepCount; i++) {
        actions.push(pickRandom(pool))
      }
      const text = actions
        .map((s) => (s.action === 'TAP' ? '탭' : DIRECTION_ICONS[s.direction]))
        .join(' → ')
      return {
        type: 'SEQUENCE',
        difficulty: 'HARD',
        text,
        sequence: actions,
      }
    },
  },
]

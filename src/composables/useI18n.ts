import { computed } from 'vue'
import { useSettings } from './useSettings'
import en from '@/i18n/en'

// Dynamic patterns: Korean template → English template (applied only for 'en' locale)
const dynamicPatterns: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(.+) 수혈$/, (m) => `MATCH ${m[1]}`],
  [/^(\d+)층$/, (m) => `FLOOR ${m[1]}`],
  [/^좌표 (.+)$/, (m) => `GRID ${m[1]}`],
  [/^(\d+)명 × (\d+)개$/, (m) => `${m[1]}人 × ${m[2]}EA`],
  [/^(.+) 해독$/, (m) => `${en[m[1]] ?? m[1]} DETOX`],
  [/^「(.+)」이 보일 때 탭하세요$/, (m) => `TAP WHEN「${m[1]}」VISIBLE`],
]

export function useI18n() {
  const { locale } = useSettings()

  const translate = computed(() => {
    if (locale.value === 'ko') return (key: string) => key
    return (key: string) => {
      if (en[key]) return en[key]
      for (const [regex, replacer] of dynamicPatterns) {
        const match = key.match(regex)
        if (match) return replacer(match)
      }
      return key
    }
  })

  return { t: (key: string) => translate.value(key), locale }
}

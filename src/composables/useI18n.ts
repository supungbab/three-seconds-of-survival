import { computed } from 'vue'
import { useSettings } from './useSettings'
import en from '@/i18n/en'

export function useI18n() {
  const { locale } = useSettings()

  const translate = computed(() => {
    if (locale.value === 'ko') return (key: string) => key
    return (key: string) => en[key] ?? key
  })

  return { t: (key: string) => translate.value(key), locale }
}

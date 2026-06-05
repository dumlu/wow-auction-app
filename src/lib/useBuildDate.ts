import { BUILD_DATE } from './buildDate'

export function useBuildDate(): string {
  return `Build: ${new Date(BUILD_DATE).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}`
}

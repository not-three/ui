import { ref, shallowRef } from 'vue'
import type { CoworkSession } from './session'
import type { CoworkText } from './text'

export const activeCowork = shallowRef<{ session: CoworkSession; text: CoworkText } | null>(null)
export const coworkShareOpen = ref(false)

export function leaveCowork() {
  const active = activeCowork.value
  activeCowork.value = null
  coworkShareOpen.value = false
  active?.text.destroy()
  active?.session.leave()
}

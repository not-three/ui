import { ref, shallowRef } from 'vue'
import type { CoworkSession } from './session'
import type { CoworkText } from './text'
import type { CoworkDraw } from './draw'

export const activeCowork = shallowRef<{ session: CoworkSession; text: CoworkText | null; draw: CoworkDraw | null } | null>(null)
export const coworkShareOpen = ref(false)

export function leaveCowork() {
  const active = activeCowork.value
  activeCowork.value = null
  coworkShareOpen.value = false
  active?.text?.destroy()
  active?.draw?.destroy()
  active?.session.leave()
}

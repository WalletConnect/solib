import { Buffer } from 'buffer'

export function polyfill() {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.Buffer) window.Buffer = Buffer
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.global) window.global = window
    // @ts-expect-error minimal process
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.process) window.process = { env: {} }
  }
}

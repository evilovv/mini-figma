let counter = 0

function fallbackId(): string {
  counter += 1
  const time = Date.now().toString(36)
  const seq = counter.toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `shape-${time}-${seq}-${random}`
}

export function createShapeId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return fallbackId()
}

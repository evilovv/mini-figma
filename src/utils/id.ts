import type { Shape } from '../types/shape'

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

export function withUniqueIds(shapes: readonly Shape[]): Shape[] {
  const seen = new Set<string>()
  return shapes.map((shape) => {
    if (!seen.has(shape.id)) {
      seen.add(shape.id)
      return shape
    }
    const id = createShapeId()
    seen.add(id)
    return { ...shape, id }
  })
}

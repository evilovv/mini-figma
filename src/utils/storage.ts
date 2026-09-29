import type { Shape, ShapeType } from '../types/shape'

const STORAGE_KEY = 'mini-figma:shapes'

const SHAPE_TYPES: readonly ShapeType[] = ['rectangle', 'ellipse']
const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isShape(value: unknown): value is Shape {
  if (typeof value !== 'object' || value === null) return false
  const shape = value as Record<string, unknown>
  return (
    typeof shape.id === 'string' &&
    shape.id.length > 0 &&
    typeof shape.type === 'string' &&
    SHAPE_TYPES.includes(shape.type as ShapeType) &&
    isFiniteNumber(shape.x) &&
    isFiniteNumber(shape.y) &&
    isFiniteNumber(shape.width) &&
    isFiniteNumber(shape.height) &&
    isFiniteNumber(shape.strokeWidth) &&
    shape.width >= 0 &&
    shape.height >= 0 &&
    shape.strokeWidth >= 0 &&
    typeof shape.fill === 'string' &&
    COLOR_PATTERN.test(shape.fill) &&
    typeof shape.stroke === 'string' &&
    COLOR_PATTERN.test(shape.stroke)
  )
}

export function loadShapes(): Shape[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isShape)
  } catch {
    return []
  }
}

export function saveShapes(shapes: readonly Shape[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes))
  } catch {
    return
  }
}

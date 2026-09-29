import { DEFAULT_FILL, DEFAULT_STROKE, DEFAULT_STROKE_WIDTH } from '../constants/shape'
import { createShapeId } from './id'
import type { Shape, ShapeType } from '../types/shape'

const STORAGE_KEY = 'mini-figma:shapes'
const BACKUP_KEY = 'mini-figma:shapes:backup'

const SHAPE_TYPES: readonly ShapeType[] = ['rectangle', 'ellipse']
const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/

interface Repair<T> {
  value: T
  lossy: boolean
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function repairShape(value: unknown): Repair<Shape | null> {
  if (!isPlainObject(value)) return { value: null, lossy: true }
  if (typeof value.type !== 'string' || !SHAPE_TYPES.includes(value.type as ShapeType)) {
    return { value: null, lossy: true }
  }

  let lossy = false

  const number = (raw: unknown, min: number, fallback: number): number => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= min) return raw
    lossy = true
    return fallback
  }

  const color = (raw: unknown, fallback: string): string => {
    if (typeof raw === 'string' && COLOR_PATTERN.test(raw)) return raw
    lossy = true
    return fallback
  }

  let id: string
  if (typeof value.id === 'string' && value.id.length > 0) {
    id = value.id
  } else {
    lossy = true
    id = createShapeId()
  }

  const shape: Shape = {
    id,
    type: value.type as ShapeType,
    x: number(value.x, Number.NEGATIVE_INFINITY, 0),
    y: number(value.y, Number.NEGATIVE_INFINITY, 0),
    width: number(value.width, 0, 0),
    height: number(value.height, 0, 0),
    fill: color(value.fill, DEFAULT_FILL),
    stroke: color(value.stroke, DEFAULT_STROKE),
    strokeWidth: number(value.strokeWidth, 0, DEFAULT_STROKE_WIDTH),
  }

  return { value: shape, lossy }
}

function keepOriginal(raw: string): void {
  try {
    if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw)
  } catch {
    return
  }
}

export function loadShapes(): Shape[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    keepOriginal(raw)
    return []
  }
  if (!Array.isArray(parsed)) {
    keepOriginal(raw)
    return []
  }

  const shapes: Shape[] = []
  let lossy = false
  for (const item of parsed) {
    const result = repairShape(item)
    if (result.lossy) lossy = true
    if (result.value !== null) shapes.push(result.value)
  }
  if (lossy) keepOriginal(raw)

  return shapes
}

export function saveShapes(shapes: readonly Shape[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes))
  } catch {
    return
  }
}

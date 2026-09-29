import { DEFAULT_FILL, DEFAULT_STROKE, DEFAULT_STROKE_WIDTH } from '../constants/shape'
import { createShapeId } from './id'
import type { Shape, ShapeType } from '../types/shape'

const STORAGE_KEY = 'mini-figma:shapes'
const BACKUP_KEY = 'mini-figma:shapes:backup'
const SCHEMA_VERSION = 1

export { STORAGE_KEY, SCHEMA_VERSION }

const SHAPE_TYPES: readonly ShapeType[] = ['rectangle', 'ellipse']
const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/

interface Repair<T> {
  value: T
  lossy: boolean
}

interface ShapeDocument {
  version: number
  shapes: Shape[]
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

function readEnvelope(value: Record<string, unknown>): unknown[] | null {
  const version = value.version
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) return null
  if (version > SCHEMA_VERSION) return null
  const shapes = value.shapes
  return Array.isArray(shapes) ? shapes : null
}

function readItems(raw: string): unknown[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (Array.isArray(parsed)) return parsed
  if (!isPlainObject(parsed)) return null
  return readEnvelope(parsed)
}

function repairAll(items: readonly unknown[], raw: string): Shape[] {
  const shapes: Shape[] = []
  let lossy = false
  for (const item of items) {
    const result = repairShape(item)
    if (result.lossy) lossy = true
    if (result.value !== null) shapes.push(result.value)
  }
  if (lossy) keepOriginal(raw)
  return shapes
}

export function serializeDocument(shapes: readonly Shape[], pretty = false): string {
  const document: ShapeDocument = { version: SCHEMA_VERSION, shapes: [...shapes] }
  return JSON.stringify(document, null, pretty ? 2 : undefined)
}

export function parseDocument(raw: string): Shape[] | null {
  const items = readItems(raw)
  if (items === null) return null
  return repairAll(items, raw)
}

export function loadShapes(): Shape[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []
  const shapes = parseDocument(raw)
  if (shapes === null) {
    keepOriginal(raw)
    return []
  }
  return shapes
}

export function saveShapes(shapes: readonly Shape[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeDocument(shapes))
  } catch {
    return
  }
}

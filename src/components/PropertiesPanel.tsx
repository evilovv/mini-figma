import { useState } from 'react'
import type { Shape as ShapeModel } from '../types/shape'

interface PropertiesPanelProps {
  shape: ShapeModel | null
  onUpdate: (id: string, patch: Partial<Omit<ShapeModel, 'id'>>) => void
}

const FIELD_CLASS =
  'h-8 w-full rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-900 outline-none focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100'

const MAX_COORDINATE = 100000
const MAX_STROKE_WIDTH = 200

function formatValue(value: number): string {
  return String(Number.isInteger(value) ? value : Math.round(value * 100) / 100)
}

function parseValue(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100) / 100
}

function clampValue(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min
  if (max !== undefined && value > max) return max
  return value
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  const [text, setText] = useState<string | null>(null)

  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
      <span className="uppercase tracking-widest">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={text ?? formatValue(value)}
        onChange={(event) => {
          const raw = event.target.value
          setText(raw)
          const parsed = parseValue(raw)
          if (parsed === null) return
          if (min !== undefined && parsed < min) return
          if (max !== undefined && parsed > max) return
          onChange(parsed)
        }}
        onBlur={() => {
          setText(null)
          const clamped = clampValue(value, min, max)
          if (clamped !== value) onChange(clamped)
        }}
        className={FIELD_CLASS}
      />
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
      <span className="uppercase tracking-widest">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700"
      />
    </label>
  )
}

export function PropertiesPanel({ shape, onUpdate }: PropertiesPanelProps) {
  return (
    <aside className="absolute inset-x-2 top-2 z-10 max-h-[38dvh] w-auto overflow-y-auto overscroll-contain rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 sm:inset-x-auto sm:right-4 sm:max-h-[calc(100dvh-2rem)] sm:w-60 sm:overflow-visible">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        Properties
      </h2>

      {shape === null ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Nothing selected yet</p>
      ) : (
        <>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {shape.type}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="X"
              value={shape.x}
              min={-MAX_COORDINATE}
              max={MAX_COORDINATE}
              onChange={(x) => onUpdate(shape.id, { x })}
            />
            <NumberField
              label="Y"
              value={shape.y}
              min={-MAX_COORDINATE}
              max={MAX_COORDINATE}
              onChange={(y) => onUpdate(shape.id, { y })}
            />
            <NumberField
              label="Width"
              value={shape.width}
              min={0}
              max={MAX_COORDINATE}
              onChange={(width) => onUpdate(shape.id, { width })}
            />
            <NumberField
              label="Height"
              value={shape.height}
              min={0}
              max={MAX_COORDINATE}
              onChange={(height) => onUpdate(shape.id, { height })}
            />
          </div>

          <div className="mt-3 space-y-2">
            <ColorField
              label="Fill"
              value={shape.fill}
              onChange={(fill) => onUpdate(shape.id, { fill })}
            />
            <ColorField
              label="Stroke"
              value={shape.stroke}
              onChange={(stroke) => onUpdate(shape.id, { stroke })}
            />
          </div>

          <div className="mt-3">
            <NumberField
              label="Stroke width"
              value={shape.strokeWidth}
              min={0}
              max={MAX_STROKE_WIDTH}
              step={0.5}
              onChange={(strokeWidth) => onUpdate(shape.id, { strokeWidth })}
            />
          </div>
        </>
      )}
    </aside>
  )
}

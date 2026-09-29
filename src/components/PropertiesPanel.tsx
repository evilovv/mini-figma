import { useState } from 'react'
import type { Shape as ShapeModel } from '../types/shape'

interface PropertiesPanelProps {
  shape: ShapeModel | null
  onUpdate: (id: string, patch: Partial<Omit<ShapeModel, 'id'>>) => void
}

const FIELD_CLASS =
  'h-8 w-full rounded-lg border border-neutral-200 px-2 text-xs text-neutral-900 outline-none focus:border-blue-400'

function formatValue(value: number): string {
  return String(Number.isInteger(value) ? value : Math.round(value * 100) / 100)
}

function parseValue(raw: string, min?: number): number | null {
  if (raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value)) return null
  if (min !== undefined && value < min) return min
  return value
}

function NumberField({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  step?: number
  onChange: (value: number) => void
}) {
  const [state, setState] = useState<{ value: number; text: string | null }>({ value, text: null })
  if (state.value !== value) {
    setState({ value, text: null })
  }
  const text = state.value === value ? state.text : null

  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-neutral-500">
      <span className="uppercase tracking-widest">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={text ?? formatValue(value)}
        onChange={(event) => {
          const raw = event.target.value
          setState({ value, text: raw })
          const parsed = parseValue(raw, min)
          if (parsed !== null) onChange(parsed)
        }}
        onBlur={() => setState({ value, text: null })}
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
    <label className="flex items-center justify-between gap-2 text-[11px] font-medium text-neutral-500">
      <span className="uppercase tracking-widest">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
      />
    </label>
  )
}

export function PropertiesPanel({ shape, onUpdate }: PropertiesPanelProps) {
  return (
    <aside className="absolute right-4 top-4 z-10 w-60 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Properties
      </h2>

      {shape === null ? (
        <p className="text-sm text-neutral-400">Nothing selected yet</p>
      ) : (
        <>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            {shape.type}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X" value={shape.x} onChange={(x) => onUpdate(shape.id, { x })} />
            <NumberField label="Y" value={shape.y} onChange={(y) => onUpdate(shape.id, { y })} />
            <NumberField
              label="Width"
              value={shape.width}
              min={0}
              onChange={(width) => onUpdate(shape.id, { width })}
            />
            <NumberField
              label="Height"
              value={shape.height}
              min={0}
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
              step={0.5}
              onChange={(strokeWidth) => onUpdate(shape.id, { strokeWidth })}
            />
          </div>
        </>
      )}
    </aside>
  )
}

import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react'
import type { ShapeDraft } from '../types/shape'

interface ShapeProps {
  shape: ShapeDraft
  selected: boolean
  interactive?: boolean
  position?: number
  onPointerDown?: (event: PointerEvent) => void
  onFocus?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

export function Shape({
  shape,
  selected,
  interactive = false,
  position,
  onPointerDown,
  onFocus,
  onKeyDown,
}: ShapeProps) {
  const rounding = shape.type === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'
  const size = `${Math.round(shape.width)}×${Math.round(shape.height)}`

  return (
    <div
      role={interactive ? 'button' : undefined}
      aria-hidden={interactive ? undefined : true}
      aria-label={`Layer ${position ?? '?'}: ${shape.type} ${size}`}
      aria-pressed={interactive ? selected : undefined}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={onPointerDown}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={[
        'absolute border',
        rounding,
        interactive ? 'cursor-move focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : '',
        selected ? 'outline outline-2 outline-blue-500' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        backgroundColor: shape.fill,
        borderColor: shape.stroke,
        borderWidth: shape.strokeWidth,
        opacity: shape.width > 0 && shape.height > 0 ? 1 : 0.4,
      }}
    />
  )
}

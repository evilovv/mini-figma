import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Shape as ShapeModel } from '../types/shape'

interface ShapeProps {
  shape: ShapeModel
  selected: boolean
  interactive?: boolean
  onMouseDown?: (shape: ShapeModel, event: ReactMouseEvent) => void
}

export function Shape({ shape, selected, interactive = false, onMouseDown }: ShapeProps) {
  const rounding = shape.type === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'

  return (
    <div
      onMouseDown={onMouseDown ? (event) => onMouseDown(shape, event) : undefined}
      className={[
        'absolute border',
        rounding,
        interactive ? 'cursor-move' : '',
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

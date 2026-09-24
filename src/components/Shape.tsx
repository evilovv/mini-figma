import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Shape as ShapeModel } from '../types/shape'

interface ShapeProps {
  shape: ShapeModel
  selected: boolean
  onSelect: () => void
  onMoveStart: (shape: ShapeModel, event: ReactMouseEvent) => void
}

export function Shape({ shape, selected, onSelect, onMoveStart }: ShapeProps) {
  const rounding = shape.type === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'

  return (
    <div
      onMouseDown={(event) => {
        event.stopPropagation()
        onSelect()
        onMoveStart(shape, event)
      }}
      className={`absolute cursor-move border ${rounding} ${selected ? 'outline outline-2 outline-blue-500' : ''}`}
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
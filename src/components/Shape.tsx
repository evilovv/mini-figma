import type { Shape as ShapeModel } from '../types/shape'

interface ShapeProps {
  shape: ShapeModel
  selected: boolean
  onSelect: () => void
}

export function Shape({ shape, selected, onSelect }: ShapeProps) {
  const rounding = shape.type === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'

  return (
    <div
      onMouseDown={(event) => {
        event.stopPropagation()
        onSelect()
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
      }}
    />
  )
}
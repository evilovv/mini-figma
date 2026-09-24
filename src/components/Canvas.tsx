import { useRef } from 'react'
import type { Shape as ShapeModel } from '../types/shape'
import { useViewport } from '../hooks/useViewport'
import { Shape } from './Shape'

interface CanvasProps {
  shapes: ShapeModel[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function Canvas({ shapes, selectedId, onSelect }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { pan, zoom, isPanning, spaceHeld } = useViewport(containerRef)

  const grid = 20 * zoom
  const cursor = isPanning ? 'cursor-grabbing' : spaceHeld ? 'cursor-grab' : 'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden bg-neutral-50 ${cursor}`}
      onMouseDown={(event) => {
        if (event.button === 0 && !spaceHeld) onSelect(null)
      }}
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px), ' +
          'linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px)',
        backgroundSize: `${grid}px ${grid}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 h-0 w-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedId}
            onSelect={() => onSelect(shape.id)}
          />
        ))}
      </div>
    </div>
  )
}
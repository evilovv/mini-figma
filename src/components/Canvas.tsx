import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import type { Point, Shape as ShapeModel, ShapeDraft, Tool } from '../types/shape'
import { useViewport } from '../hooks/useViewport'
import { Shape } from './Shape'
import { screenToCanvas } from '../utils/geometry'

interface CanvasProps {
  shapes: ShapeModel[]
  selectedId: string | null
  tool: Tool
  onSelect: (id: string | null) => void
  onAddShape: (draft: ShapeDraft) => void
  onUpdateShape: (id: string, patch: Partial<Omit<ShapeModel, 'id'>>) => void
}

const DEFAULT_DRAFT: Omit<ShapeDraft, 'type'> = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
}

interface DrawState {
  origin: Point
  draft: ShapeDraft
  shapeId: string
  current: ShapeModel | null
}

interface MoveState {
  shapeId: string
  origin: Point
  start: Point
}

export function Canvas({ shapes, selectedId, tool, onSelect, onAddShape, onUpdateShape }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { pan, zoom, isPanning, spaceHeld } = useViewport(containerRef)

  const [draftShape, setDraftShape] = useState<ShapeModel | null>(null)
  const panRef = useRef(pan)
  const zoomRef = useRef(zoom)
  const containersRef = useRef<{ pan: Point; zoom: number }>({ pan, zoom })
  const drawRef = useRef<DrawState | null>(null)
  const moveRef = useRef<MoveState | null>(null)

  useEffect(() => {
    panRef.current = pan
    zoomRef.current = zoom
    containersRef.current = { pan, zoom }
  }, [pan, zoom])

  const toCanvas = useCallback((event: { clientX: number; clientY: number }): Point => {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    const { pan: p, zoom: z } = containersRef.current
    return screenToCanvas({ x: event.clientX - rect.left, y: event.clientY - rect.top }, p, z)
  }, [])

  useEffect(() => {
    const onMouseMove = (event: globalThis.MouseEvent) => {
      const draw = drawRef.current
      if (draw) {
        const { origin, draft, shapeId } = draw
        const current = toCanvas(event)
        const draftShape: ShapeModel = {
          id: shapeId,
          ...draft,
          x: Math.min(origin.x, current.x),
          y: Math.min(origin.y, current.y),
          width: Math.abs(current.x - origin.x),
          height: Math.abs(current.y - origin.y),
        }
        draw.current = draftShape
        setDraftShape(draftShape)
        return
      }

      const move = moveRef.current
      if (move) {
        const { shapeId, origin, start } = move
        onUpdateShape(shapeId, {
          x: start.x + (event.clientX - origin.x) / zoomRef.current,
          y: start.y + (event.clientY - origin.y) / zoomRef.current,
        })
      }
    }

    const onMouseUp = () => {
      const draw = drawRef.current
      if (draw) {
        drawRef.current = null
        const finished = draw.current
        setDraftShape(null)
        if (finished && finished.width > 0 && finished.height > 0) {
          onAddShape(finished)
        }
        return
      }
      moveRef.current = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [toCanvas, onAddShape, onUpdateShape])

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (event.button !== 0 || spaceHeld) return

    if (tool !== 'select') {
      const origin = toCanvas(event)
      drawRef.current = {
        origin,
        shapeId: crypto.randomUUID(),
        draft: { ...DEFAULT_DRAFT, type: tool },
        current: null,
      }
      return
    }

    onSelect(null)
  }

  const handleMoveStart = useCallback(
    (shape: ShapeModel, event: ReactMouseEvent) => {
      event.stopPropagation()
      onSelect(shape.id)
      moveRef.current = {
        shapeId: shape.id,
        origin: { x: event.clientX, y: event.clientY },
        start: { x: shape.x, y: shape.y },
      }
    },
    [onSelect],
  )

  const grid = 20 * zoom
  const cursor = isPanning ? 'cursor-grabbing' : spaceHeld ? 'cursor-grab' : tool !== 'select' ? 'cursor-crosshair' : 'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden bg-neutral-50 ${cursor}`}
      onMouseDown={handleMouseDown}
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
            onMoveStart={handleMoveStart}
          />
        ))}
        {draftShape && (
          <Shape
            shape={draftShape}
            selected={false}
            onSelect={() => undefined}
            onMoveStart={() => undefined}
          />
        )}
      </div>
    </div>
  )
}
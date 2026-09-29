import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import type { Point, Shape as ShapeModel, ShapeDraft, Tool } from '../types/shape'
import { DEFAULT_FILL, DEFAULT_STROKE, DEFAULT_STROKE_WIDTH } from '../constants/shape'
import { useViewport } from '../hooks/useViewport'
import { Shape } from './Shape'

interface CanvasProps {
  shapes: ShapeModel[]
  selectedId: string | null
  tool: Tool
  onSelect: (id: string | null) => void
  onAddShape: (draft: ShapeDraft) => void
  onUpdateShape: (id: string, patch: Partial<Omit<ShapeModel, 'id'>>) => void
  onMoveShapeByKeyboard: (id: string, dx: number, dy: number) => void
}

const DEFAULT_DRAFT: Omit<ShapeDraft, 'type'> = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fill: DEFAULT_FILL,
  stroke: DEFAULT_STROKE,
  strokeWidth: DEFAULT_STROKE_WIDTH,
}

const TAP_THRESHOLD_PX = 6

interface DrawState {
  pointerId: number
  origin: Point
  draft: ShapeDraft
  current: ShapeDraft | null
}

interface MoveState {
  pointerId: number
  shapeId: string
  origin: Point
  start: Point
}

interface PanState {
  pointerId: number
  client: Point
  pan: Point
  moved: boolean
  onTap: boolean
}

interface PinchState {
  distance: number
  zoom: number
}

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpointOf(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function Canvas({
  shapes,
  selectedId,
  tool,
  onSelect,
  onAddShape,
  onUpdateShape,
  onMoveShapeByKeyboard,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { pan, zoom, spaceHeld, toCanvas, panTo, zoomAround } = useViewport(containerRef)

  const [draftShape, setDraftShape] = useState<ShapeDraft | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [isPinching, setIsPinching] = useState(false)

  const drawRef = useRef<DrawState | null>(null)
  const moveRef = useRef<MoveState | null>(null)
  const panRef = useRef<PanState | null>(null)
  const pinchRef = useRef<PinchState | null>(null)
  const pointersRef = useRef(new Map<number, Point>())

  const cancelGestures = useCallback(() => {
    drawRef.current = null
    moveRef.current = null
    panRef.current = null
    setDraftShape(null)
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onDown = (event: PointerEvent) => {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointersRef.current.size < 2) return
      cancelGestures()
      const [first, second] = [...pointersRef.current.values()]
      pinchRef.current = { distance: distanceBetween(first, second), zoom }
      setIsPinching(true)
    }

    const onMove = (event: PointerEvent) => {
      if (!pointersRef.current.has(event.pointerId)) return
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      const pinch = pinchRef.current
      if (!pinch || pinch.distance <= 0) return
      const [first, second] = [...pointersRef.current.values()]
      const rect = el.getBoundingClientRect()
      const center = midpointOf(first, second)
      const anchor = { x: center.x - rect.left, y: center.y - rect.top }
      zoomAround(anchor, pinch.zoom * (distanceBetween(first, second) / pinch.distance))
    }

    const onRelease = (event: PointerEvent) => {
      pointersRef.current.delete(event.pointerId)
      if (pointersRef.current.size < 2) {
        pinchRef.current = null
        setIsPinching(false)
      }
    }

    el.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onRelease, true)
    window.addEventListener('pointercancel', onRelease, true)
    return () => {
      el.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onRelease, true)
      window.removeEventListener('pointercancel', onRelease, true)
    }
  }, [cancelGestures, zoom, zoomAround])

  useEffect(() => {
    const onPointerMove = (event: globalThis.PointerEvent) => {
      const draw = drawRef.current
      if (draw && draw.pointerId === event.pointerId) {
        const { origin, draft } = draw
        const current = toCanvas({ x: event.clientX, y: event.clientY })
        const next: ShapeDraft = {
          ...draft,
          x: Math.min(origin.x, current.x),
          y: Math.min(origin.y, current.y),
          width: Math.abs(current.x - origin.x),
          height: Math.abs(current.y - origin.y),
        }
        draw.current = next
        setDraftShape(next)
        return
      }

      const move = moveRef.current
      if (move && move.pointerId === event.pointerId) {
        onUpdateShape(move.shapeId, {
          x: move.start.x + (event.clientX - move.origin.x) / zoom,
          y: move.start.y + (event.clientY - move.origin.y) / zoom,
        })
        return
      }

      const panGesture = panRef.current
      if (panGesture && panGesture.pointerId === event.pointerId) {
        const dx = event.clientX - panGesture.client.x
        const dy = event.clientY - panGesture.client.y
        if (!panGesture.moved && Math.hypot(dx, dy) > TAP_THRESHOLD_PX) panGesture.moved = true
        if (panGesture.moved) {
          panTo({ x: panGesture.pan.x + dx, y: panGesture.pan.y + dy })
        }
      }
    }

    const onPointerUp = (event: globalThis.PointerEvent) => {
      const draw = drawRef.current
      if (draw && draw.pointerId === event.pointerId) {
        drawRef.current = null
        const finished = draw.current
        setDraftShape(null)
        if (finished && finished.width > 0 && finished.height > 0) {
          onAddShape(finished)
        }
        return
      }

      const move = moveRef.current
      if (move && move.pointerId === event.pointerId) {
        moveRef.current = null
        return
      }

      const panGesture = panRef.current
      if (panGesture && panGesture.pointerId === event.pointerId) {
        panRef.current = null
        setIsPanning(false)
        if (!panGesture.moved && panGesture.onTap) onSelect(null)
      }
    }

    const onBlur = () => {
      cancelGestures()
      pinchRef.current = null
      pointersRef.current.clear()
      setIsPinching(false)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [cancelGestures, onAddShape, onSelect, onUpdateShape, panTo, toCanvas, zoom])

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (pinchRef.current) return

    const client = { x: event.clientX, y: event.clientY }
    const isTouch = event.pointerType !== 'mouse'

    if (spaceHeld || (isTouch && tool === 'select')) {
      panRef.current = {
        pointerId: event.pointerId,
        client,
        pan,
        moved: false,
        onTap: isTouch && tool === 'select',
      }
      setIsPanning(true)
      return
    }

    if (tool !== 'select') {
      drawRef.current = {
        pointerId: event.pointerId,
        origin: toCanvas(client),
        draft: { ...DEFAULT_DRAFT, type: tool },
        current: null,
      }
      return
    }

    onSelect(null)
  }

  const shapesInteractive = tool === 'select' && !spaceHeld

  const handleShapePointerDown = useCallback(
    (shape: ShapeModel, event: ReactPointerEvent) => {
      if (tool !== 'select' || spaceHeld || pinchRef.current) return
      event.stopPropagation()
      onSelect(shape.id)
      moveRef.current = {
        pointerId: event.pointerId,
        shapeId: shape.id,
        origin: { x: event.clientX, y: event.clientY },
        start: { x: shape.x, y: shape.y },
      }
    },
    [onSelect, spaceHeld, tool],
  )

  const handleShapeKeyDown = useCallback(
    (shape: ShapeModel, event: ReactKeyboardEvent) => {
      const step = event.shiftKey ? 10 : 1
      const deltas: Record<string, Point> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      }
      const delta = deltas[event.key]
      if (!delta) return
      event.preventDefault()
      onSelect(shape.id)
      onMoveShapeByKeyboard(shape.id, delta.x, delta.y)
    },
    [onMoveShapeByKeyboard, onSelect],
  )

  const grid = 20 * zoom
  const cursor = isPinching
    ? 'cursor-grabbing'
    : isPanning
      ? 'cursor-grabbing'
      : spaceHeld
        ? 'cursor-grab'
        : tool !== 'select'
          ? 'cursor-crosshair'
          : 'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden bg-neutral-50 ${cursor}`}
      onPointerDown={handlePointerDown}
      style={{
        touchAction: 'none',
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
        {shapes.map((shape, index) => (
          <Shape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedId}
            interactive={shapesInteractive}
            position={index + 1}
            onPointerDown={(event) => handleShapePointerDown(shape, event)}
            onFocus={() => onSelect(shape.id)}
            onKeyDown={(event) => handleShapeKeyDown(shape, event)}
          />
        ))}
        {draftShape && <Shape shape={draftShape} selected={false} />}
      </div>
    </div>
  )
}

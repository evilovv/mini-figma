import { useCallback, useState } from 'react'
import type { Shape } from '../types/shape'

export type ShapeDraft = Omit<Shape, 'id'>

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addShape = useCallback((draft: ShapeDraft): Shape => {
    const shape: Shape = { ...draft, id: crypto.randomUUID() }
    setShapes((prev) => [...prev, shape])
    setSelectedId(shape.id)
    return shape
  }, [])

  const updateShape = useCallback(
    (id: string, patch: Partial<Omit<Shape, 'id'>>) => {
      setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },
    [],
  )

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const select = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const selectedShape = shapes.find((s) => s.id === selectedId) ?? null

  return { shapes, selectedId, selectedShape, addShape, updateShape, removeShape, select }
}
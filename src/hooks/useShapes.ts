import { useCallback, useState } from 'react'
import { DEFAULT_TOOL } from '../constants/tools'
import type { Shape, ShapeDraft, Tool } from '../types/shape'

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)

  const selectTool = useCallback((next: Tool) => {
    setTool(next)
  }, [])

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

  return {
    shapes,
    selectedId,
    selectedShape,
    tool,
    selectTool,
    addShape,
    updateShape,
    removeShape,
    select,
  }
}
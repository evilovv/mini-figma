import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_TOOL } from '../constants/tools'
import type { Shape, ShapeDraft, Tool } from '../types/shape'
import { createShapeId } from '../utils/id'
import { STORAGE_KEY, loadShapes, saveShapes } from '../utils/storage'

export function useShapes() {
  const [initial] = useState(loadShapes)
  const [shapes, setShapes] = useState<Shape[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const skipSaveRef = useRef(true)

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    saveShapes(shapes)
  }, [shapes])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      skipSaveRef.current = true
      setShapes(loadShapes())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const selectTool = useCallback((next: Tool) => {
    setTool(next)
  }, [])

  const addShape = useCallback((draft: ShapeDraft): Shape => {
    const shape: Shape = { ...draft, id: createShapeId() }
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { SAVE_DEBOUNCE_MS } from '../constants/shape'
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
  const shapesRef = useRef(shapes)
  const timerRef = useRef<number | null>(null)

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    saveShapes(shapesRef.current)
  }, [])

  useEffect(() => {
    shapesRef.current = shapes
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      saveShapes(shapesRef.current)
    }, SAVE_DEBOUNCE_MS)
  }, [shapes])

  useEffect(() => {
    const onPageHide = () => {
      if (timerRef.current !== null) flush()
    }
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('beforeunload', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onPageHide)
    }
  }, [flush])

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
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
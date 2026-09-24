import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { Point } from '../types/shape'
import { clampZoom, zoomAt } from '../utils/geometry'

export interface Viewport {
  pan: Point
  zoom: number
}

export function useViewport(containerRef: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({ pan: { x: 0, y: 0 }, zoom: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [spaceHeld, setSpaceHeld] = useState(false)

  const spaceRef = useRef(false)
  const panOrigin = useRef<{ mouse: Point; pan: Point } | null>(null)
  const viewportRef = useRef(viewport)

  useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

  const center = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setViewport({ pan: { x: width / 2, y: height / 2 }, zoom: 1 })
  }, [containerRef])

  useEffect(() => {
    center()
  }, [center])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return
      event.preventDefault()
      spaceRef.current = true
      setSpaceHeld(true)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      spaceRef.current = false
      setSpaceHeld(false)
    }

    const onBlur = () => {
      spaceRef.current = false
      setSpaceHeld(false)
      panOrigin.current = null
      setIsPanning(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMouseDown = (event: MouseEvent) => {
      if (!spaceRef.current || event.button !== 0) return
      event.preventDefault()
      panOrigin.current = {
        mouse: { x: event.clientX, y: event.clientY },
        pan: viewportRef.current.pan,
      }
      setIsPanning(true)
    }

    const onMouseMove = (event: MouseEvent) => {
      const origin = panOrigin.current
      if (!origin) return
      setViewport((current) => ({
        ...current,
        pan: {
          x: origin.pan.x + (event.clientX - origin.mouse.x),
          y: origin.pan.y + (event.clientY - origin.mouse.y),
        },
      }))
    }

    const onMouseUp = () => {
      if (!panOrigin.current) return
      panOrigin.current = null
      setIsPanning(false)
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      setViewport((current) => {
        const nextZoom = clampZoom(current.zoom * Math.exp(-event.deltaY * 0.0015))
        if (nextZoom === current.zoom) return current
        return { pan: zoomAt(anchor, current.pan, current.zoom, nextZoom), zoom: nextZoom }
      })
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef])

  return { pan: viewport.pan, zoom: viewport.zoom, isPanning, spaceHeld, center }
}
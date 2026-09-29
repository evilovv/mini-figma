import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { Point } from '../types/shape'
import { screenToCanvas, zoomAt } from '../utils/geometry'

export interface Viewport {
  pan: Point
  zoom: number
}

export function useViewport(containerRef: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({ pan: { x: 0, y: 0 }, zoom: 1 })
  const [spaceHeld, setSpaceHeld] = useState(false)

  const spaceRef = useRef(false)
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
      if (event.target instanceof HTMLElement && isInteractive(event.target)) return
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

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      setViewport((current) => {
        const result = zoomAt(anchor, current.pan, current.zoom, current.zoom * Math.exp(-event.deltaY * 0.0015))
        return result.zoom === current.zoom ? current : result
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [containerRef])

  const toCanvas = useCallback(
    (client: Point): Point => {
      const el = containerRef.current
      if (!el) return { x: 0, y: 0 }
      const rect = el.getBoundingClientRect()
      const { pan, zoom } = viewportRef.current
      return screenToCanvas({ x: client.x - rect.left, y: client.y - rect.top }, pan, zoom)
    },
    [containerRef],
  )

  const panTo = useCallback((pan: Point) => {
    setViewport((current) => (current.pan.x === pan.x && current.pan.y === pan.y ? current : { ...current, pan }))
  }, [])

  const zoomAround = useCallback((anchor: Point, nextZoom: number) => {
    setViewport((current) => {
      const result = zoomAt(anchor, current.pan, current.zoom, nextZoom)
      return result.zoom === current.zoom ? current : result
    })
  }, [])

  return { pan: viewport.pan, zoom: viewport.zoom, spaceHeld, toCanvas, panTo, zoomAround }
}

function isInteractive(target: HTMLElement): boolean {
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT' || tag === 'TEXTAREA') return true
  if (tag !== 'INPUT') return false
  const type = (target as HTMLInputElement).type
  return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)
}

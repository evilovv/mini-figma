import type { Point } from '../types/shape'

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

export function screenToCanvas(screen: Point, pan: Point, zoom: number): Point {
  return {
    x: (screen.x - pan.x) / zoom,
    y: (screen.y - pan.y) / zoom,
  }
}

export function canvasToScreen(canvas: Point, pan: Point, zoom: number): Point {
  return {
    x: canvas.x * zoom + pan.x,
    y: canvas.y * zoom + pan.y,
  }
}

export function zoomAt(anchor: Point, pan: Point, zoom: number, nextZoom: number): Point {
  const clamped = clampZoom(nextZoom)
  const world = screenToCanvas(anchor, pan, zoom)
  return {
    x: anchor.x - world.x * clamped,
    y: anchor.y - world.y * clamped,
  }
}
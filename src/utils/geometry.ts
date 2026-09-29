import type { Point } from '../types/shape'

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

export function snapToGrid(value: number, grid: number): number {
  return Math.round(value / grid) * grid
}

export function screenToCanvas(screen: Point, pan: Point, zoom: number): Point {
  return {
    x: (screen.x - pan.x) / zoom,
    y: (screen.y - pan.y) / zoom,
  }
}

export function zoomAt(
  anchor: Point,
  pan: Point,
  zoom: number,
  nextZoom: number,
): { pan: Point; zoom: number } {
  const clamped = clampZoom(nextZoom)
  const world = screenToCanvas(anchor, pan, zoom)
  return {
    pan: { x: anchor.x - world.x * clamped, y: anchor.y - world.y * clamped },
    zoom: clamped,
  }
}

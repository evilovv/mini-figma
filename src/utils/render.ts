import type { Shape } from '../types/shape'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export const PNG_SCALE = 2
const MAX_PNG_SIDE = 8192

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function getBounds(shapes: readonly Shape[]): Bounds | null {
  if (shapes.length === 0) return null
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const shape of shapes) {
    const half = shape.strokeWidth / 2
    minX = Math.min(minX, shape.x - half)
    minY = Math.min(minY, shape.y - half)
    maxX = Math.max(maxX, shape.x + shape.width + half)
    maxY = Math.max(maxY, shape.y + shape.height + half)
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(1, Math.ceil(maxX - minX)),
    height: Math.max(1, Math.ceil(maxY - minY)),
  }
}

function shapeToSvg(shape: Shape, offsetX: number, offsetY: number): string {
  const x = round(shape.x - offsetX)
  const y = round(shape.y - offsetY)
  const style = `fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}"`
  if (shape.type === 'ellipse') {
    return `<ellipse cx="${round(x + shape.width / 2)}" cy="${round(y + shape.height / 2)}" rx="${round(shape.width / 2)}" ry="${round(shape.height / 2)}" ${style} />`
  }
  return `<rect x="${x}" y="${y}" width="${round(shape.width)}" height="${round(shape.height)}" rx="2" ${style} />`
}

export function renderSvg(shapes: readonly Shape[], bounds: Bounds): string {
  const body = shapes.map((shape) => `  ${shapeToSvg(shape, bounds.x, bounds.y)}`).join('\n')
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">`,
    body,
    '</svg>',
  ].join('\n')
}

export async function renderPngBlob(shapes: readonly Shape[], bounds: Bounds): Promise<Blob | null> {
  const scale = Math.min(PNG_SCALE, MAX_PNG_SIDE / Math.max(bounds.width, bounds.height))
  const svg = renderSvg(shapes, bounds)
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('svg decode failed'))
      image.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bounds.width * scale))
    canvas.height = Math.max(1, Math.round(bounds.height * scale))
    const context = canvas.getContext('2d')
    if (!context) return null
    context.scale(scale, scale)
    context.drawImage(image, 0, 0)
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}

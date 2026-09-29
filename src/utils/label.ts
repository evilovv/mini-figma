import type { ShapeDraft } from '../types/shape'

export function shapeLabel(shape: ShapeDraft, position?: number): string {
  const size = `${Math.round(shape.width)}×${Math.round(shape.height)}`
  const prefix = position === undefined ? '' : `Layer ${position}: `
  return `${prefix}${shape.type} ${size}`
}

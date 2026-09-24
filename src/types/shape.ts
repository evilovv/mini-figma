export type Tool = 'select' | 'rectangle' | 'ellipse'

export type ShapeType = Exclude<Tool, 'select'>

export interface Point {
  x: number
  y: number
}

export interface Shape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
}

export type ShapeDraft = Omit<Shape, 'id'>
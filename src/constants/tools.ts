import type { ShapeType, Tool } from '../types/shape'

export const SHORTCUT_TO_TOOL: Readonly<Record<string, Tool>> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
}

export interface ToolDefinition {
  id: Tool
  shapeType: ShapeType | null
  label: string
  shortcut: string
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', shapeType: null, label: 'Select', shortcut: 'v' },
  { id: 'rectangle', shapeType: 'rectangle', label: 'Rectangle', shortcut: 'r' },
  { id: 'ellipse', shapeType: 'ellipse', label: 'Ellipse', shortcut: 'o' },
]

export const DEFAULT_TOOL: Tool = 'select'
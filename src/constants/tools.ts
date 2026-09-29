import type { Tool } from '../types/shape'

export const SHORTCUT_TO_TOOL: Readonly<Record<string, Tool>> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
}

export interface ToolDefinition {
  id: Tool
  label: string
  shortcut: string
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'v' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'r' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'o' },
]

export const DEFAULT_TOOL: Tool = 'select'
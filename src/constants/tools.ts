import type { Tool } from '../types/shape'

export interface ToolDefinition {
  id: Tool
  label: string
  shortcut: string
  code: string
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'v', code: 'KeyV' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'r', code: 'KeyR' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'o', code: 'KeyO' },
]

export const SHORTCUT_TO_TOOL: Readonly<Record<string, Tool>> = Object.fromEntries(
  TOOLS.map((tool) => [tool.code, tool.id]),
)

export const DEFAULT_TOOL: Tool = 'select'

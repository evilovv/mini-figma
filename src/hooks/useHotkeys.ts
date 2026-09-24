import type { Tool } from '../types/shape'

export interface HotkeyHandlers {
  onSelectTool: (tool: Tool) => void
  onDeleteSelected: () => void
}

export function useHotkeys(_handlers: HotkeyHandlers): void {}
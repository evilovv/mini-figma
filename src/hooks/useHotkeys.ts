import { useEffect } from 'react'
import { SHORTCUT_TO_TOOL } from '../constants/tools'
import type { Tool } from '../types/shape'

export interface HotkeyHandlers {
  onSelectTool: (tool: Tool) => void
  onDeleteSelected: () => void
}

export function useHotkeys({ onSelectTool, onDeleteSelected }: HotkeyHandlers): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tool = SHORTCUT_TO_TOOL[event.key.toLowerCase()]
      if (tool) {
        event.preventDefault()
        onSelectTool(tool)
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        onDeleteSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onSelectTool, onDeleteSelected])
}
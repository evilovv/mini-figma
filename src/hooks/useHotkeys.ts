import { useEffect } from 'react'
import { SHORTCUT_TO_TOOL } from '../constants/tools'
import type { Tool } from '../types/shape'

export interface HotkeyHandlers {
  onSelectTool: (tool: Tool) => void
  onDeleteSelected: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  const type = (target as HTMLInputElement).type
  return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)
}

export function useHotkeys({ onSelectTool, onDeleteSelected }: HotkeyHandlers): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return
      if (isEditableTarget(event.target)) return

      const tool = SHORTCUT_TO_TOOL[event.code]
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

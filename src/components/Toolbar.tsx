import { TOOLS } from '../constants/tools'
import type { Tool } from '../types/shape'

interface ToolbarProps {
  tool: Tool
  onSelectTool: (tool: Tool) => void
}

export function Toolbar({ tool, onSelectTool }: ToolbarProps) {
  return (
    <aside className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg">
      <div className="flex flex-col items-center gap-1">
        {TOOLS.map((item) => {
          const active = tool === item.id
          return (
            <button
              key={item.id}
              type="button"
              title={`${item.label} (${item.shortcut})`}
              onClick={() => onSelectTool(item.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold uppercase transition-colors ${
                active
                  ? 'bg-blue-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {item.shortcut}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
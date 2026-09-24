import { TOOLS } from '../constants/tools'

export function Toolbar() {
  return (
    <aside className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg">
      <div className="flex flex-col items-center gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={`${tool.label} (${tool.shortcut})`}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold uppercase text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            {tool.shortcut}
          </button>
        ))}
      </div>
    </aside>
  )
}
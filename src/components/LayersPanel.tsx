import type { Shape as ShapeModel } from '../types/shape'

interface LayersPanelProps {
  shapes: ShapeModel[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function LayersPanel({ shapes, selectedId, onSelect, onDelete }: LayersPanelProps) {
  const layers = shapes.map((shape, index) => ({ shape, position: index + 1 })).reverse()

  return (
    <aside className="absolute inset-x-2 bottom-2 z-10 flex max-h-[35dvh] w-auto flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:max-h-[calc(100dvh-2rem)] sm:w-60">
      <h2 className="mb-3 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Layers
      </h2>
      {shapes.length === 0 ? (
        <p className="text-sm text-neutral-400">No layers yet</p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
          {layers.map(({ shape, position }) => {
            const active = shape.id === selectedId
            return (
              <li
                key={shape.id}
                className={`flex items-center gap-1 rounded-lg text-xs ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-neutral-700'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(shape.id)}
                  className={`flex min-w-0 flex-1 items-center rounded-lg px-2 py-1.5 text-left ${
                    active ? '' : 'hover:bg-neutral-100'
                  }`}
                >
                  <span className="truncate">
                    #{position} · {shape.type}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${shape.type} layer`}
                  onClick={() => onDelete(shape.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

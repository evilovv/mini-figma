import type { Shape as ShapeModel } from '../types/shape'

interface LayersPanelProps {
  shapes: ShapeModel[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function LayersPanel({ shapes, selectedId, onSelect, onDelete }: LayersPanelProps) {
  return (
    <aside className="absolute bottom-4 right-4 z-10 w-60 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        Layers
      </h2>
      {shapes.length === 0 ? (
        <p className="text-sm text-neutral-400">No layers yet</p>
      ) : (
        <ul className="space-y-1">
          {[...shapes].reverse().map((shape, index) => {
            const active = shape.id === selectedId
            return (
              <li
                key={shape.id}
                onClick={() => onSelect(shape.id)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span className="truncate">
                  #{shapes.length - index} · {shape.type}
                </span>
                <button
                  type="button"
                  title="Delete layer"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(shape.id)
                  }}
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
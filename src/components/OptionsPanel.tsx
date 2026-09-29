interface OptionsPanelProps {
  snap: boolean
  onToggleSnap: (value: boolean) => void
}

export function OptionsPanel({ snap, onToggleSnap }: OptionsPanelProps) {
  return (
    <aside className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-lg">
      <input
        id="snap-to-grid"
        type="checkbox"
        checked={snap}
        onChange={(event) => onToggleSnap(event.target.checked)}
        className="h-4 w-4 cursor-pointer accent-blue-500"
      />
      <label
        htmlFor="snap-to-grid"
        className="cursor-pointer select-none text-xs font-medium text-neutral-700"
      >
        Snap to grid
      </label>
    </aside>
  )
}

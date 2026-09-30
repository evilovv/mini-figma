interface OptionsPanelProps {
  snap: boolean
  status: string | null
  dark: boolean
  onToggleSnap: (value: boolean) => void
  onExportJson: () => void
  onImportJson: (file: File) => void
  onExportSvg: () => void
  onExportPng: () => void
  onToggleTheme: () => void
}

const buttonClass =
  'rounded-lg border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'

export function OptionsPanel({
  snap,
  status,
  dark,
  onToggleSnap,
  onExportJson,
  onImportJson,
  onExportSvg,
  onExportPng,
  onToggleTheme,
}: OptionsPanelProps) {
  return (
    <aside className="absolute left-4 top-4 z-10 flex w-56 flex-col gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <input
          id="snap-to-grid"
          type="checkbox"
          checked={snap}
          onChange={(event) => onToggleSnap(event.target.checked)}
          className="h-4 w-4 cursor-pointer accent-blue-500"
        />
        <label
          htmlFor="snap-to-grid"
          className="cursor-pointer select-none text-xs font-medium text-neutral-700 dark:text-neutral-200"
        >
          Snap to grid
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className={buttonClass} onClick={onExportJson}>
          Export JSON
        </button>
        <label className={`${buttonClass} cursor-pointer text-center`}>
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onImportJson(file)
              event.target.value = ''
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className={buttonClass} onClick={onExportSvg}>
          Export SVG
        </button>
        <button type="button" className={buttonClass} onClick={onExportPng}>
          Export PNG
        </button>
      </div>

      <button
        type="button"
        className={buttonClass}
        aria-pressed={dark}
        onClick={onToggleTheme}
      >
        {dark ? 'Light theme' : 'Dark theme'}
      </button>

      <p className="m-0 text-xs text-neutral-500 dark:text-neutral-400" role="status">
        {status}
      </p>
    </aside>
  )
}

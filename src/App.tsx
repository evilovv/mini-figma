import { useCallback, useEffect, useState } from 'react'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { LayersPanel } from './components/LayersPanel'
import { OptionsPanel } from './components/OptionsPanel'
import { useShapes } from './hooks/useShapes'
import { useHotkeys } from './hooks/useHotkeys'
import { downloadBlob, downloadText, readTextFile } from './utils/file'
import { withUniqueIds } from './utils/id'
import { shapeLabel } from './utils/label'
import { getBounds, renderPngBlob, renderSvg } from './utils/render'
import { parseDocument, serializeDocument } from './utils/storage'

const STATUS_TTL_MS = 4000

export default function App() {
  const {
    shapes,
    selectedId,
    selectedShape,
    tool,
    selectTool,
    addShape,
    updateShape,
    removeShape,
    nudgeShape,
    replaceShapes,
    select,
  } = useShapes()

  const [snap, setSnap] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useHotkeys({
    onSelectTool: selectTool,
    onDeleteSelected: () => {
      if (selectedId) removeShape(selectedId)
    },
  })

  useEffect(() => {
    if (status === null) return
    const timer = window.setTimeout(() => setStatus(null), STATUS_TTL_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  const handleExportJson = useCallback(() => {
    downloadText(serializeDocument(shapes, true), 'mini-figma.json')
    setStatus(`Exported ${shapes.length} layers`)
  }, [shapes])

  const handleImportJson = useCallback(
    (file: File) => {
      readTextFile(file)
        .then((text) => {
          const parsed = parseDocument(text)
          if (parsed === null) {
            setStatus(`Could not read ${file.name}`)
            return
          }
          replaceShapes(withUniqueIds(parsed))
          setStatus(`Imported ${parsed.length} layers`)
        })
        .catch(() => setStatus(`Could not read ${file.name}`))
    },
    [replaceShapes],
  )

  const handleExportSvg = useCallback(() => {
    const bounds = getBounds(shapes)
    if (!bounds) {
      setStatus('Nothing to export')
      return
    }
    downloadText(renderSvg(shapes, bounds), 'mini-figma.svg', 'image/svg+xml')
    setStatus('Exported SVG')
  }, [shapes])

  const handleExportPng = useCallback(() => {
    const bounds = getBounds(shapes)
    if (!bounds) {
      setStatus('Nothing to export')
      return
    }
    setStatus('Rendering PNG...')
    renderPngBlob(shapes, bounds)
      .then((blob) => {
        if (!blob) {
          setStatus('Could not render PNG')
          return
        }
        downloadBlob(blob, 'mini-figma.png')
        setStatus('Exported PNG')
      })
      .catch(() => setStatus('Could not render PNG'))
  }, [shapes])

  const announcement = selectedShape
    ? `${shapeLabel(selectedShape, shapes.findIndex((s) => s.id === selectedShape.id) + 1)} selected`
    : `${shapes.length} layers, nothing selected`

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <Canvas
        shapes={shapes}
        selectedId={selectedId}
        tool={tool}
        snap={snap}
        onSelect={select}
        onAddShape={addShape}
        onUpdateShape={updateShape}
        onMoveShapeByKeyboard={nudgeShape}
      />
      <OptionsPanel
        snap={snap}
        status={status}
        onToggleSnap={setSnap}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
      />
      <Toolbar tool={tool} onSelectTool={selectTool} />
      <PropertiesPanel shape={selectedShape} onUpdate={updateShape} />
      <LayersPanel
        shapes={shapes}
        selectedId={selectedId}
        onSelect={select}
        onDelete={removeShape}
      />
    </div>
  )
}
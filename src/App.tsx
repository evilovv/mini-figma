import { useState } from 'react'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { LayersPanel } from './components/LayersPanel'
import { OptionsPanel } from './components/OptionsPanel'
import { useShapes } from './hooks/useShapes'
import { useHotkeys } from './hooks/useHotkeys'
import { shapeLabel } from './utils/label'

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
    select,
  } = useShapes()

  const [snap, setSnap] = useState(false)

  useHotkeys({
    onSelectTool: selectTool,
    onDeleteSelected: () => {
      if (selectedId) removeShape(selectedId)
    },
  })

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
      <OptionsPanel snap={snap} onToggleSnap={setSnap} />
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
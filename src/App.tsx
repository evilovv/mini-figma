import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { LayersPanel } from './components/LayersPanel'
import { useShapes } from './hooks/useShapes'
import { useHotkeys } from './hooks/useHotkeys'

export default function App() {
  const { shapes, selectedId, selectedShape, tool, selectTool, addShape, updateShape, removeShape, select } =
    useShapes()

  useHotkeys({
    onSelectTool: selectTool,
    onDeleteSelected: () => {
      if (selectedId) removeShape(selectedId)
    },
  })

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased">
      <Canvas
        shapes={shapes}
        selectedId={selectedId}
        tool={tool}
        onSelect={select}
        onAddShape={addShape}
        onUpdateShape={updateShape}
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
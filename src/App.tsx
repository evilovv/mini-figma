import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { LayersPanel } from './components/LayersPanel'
import { useShapes } from './hooks/useShapes'

export default function App() {
  const { shapes, selectedId, select } = useShapes()

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased">
      <Canvas shapes={shapes} selectedId={selectedId} onSelect={select} />
      <Toolbar />
      <PropertiesPanel />
      <LayersPanel />
    </div>
  )
}
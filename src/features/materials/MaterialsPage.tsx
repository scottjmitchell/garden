import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { PageHeader, Card, Tabs } from '../../design-system'
import { useMaterials } from '../../lib/firebase/hooks'
import { MaterialCard }     from './MaterialCard'
import { MaterialTableRow } from './MaterialTableRow'
import { MaterialModal }    from './MaterialModal'
import { OptionsModal }     from './OptionsModal'
import type { Material } from '../../types'

type ViewMode = 'tiles' | 'table'

function useViewPreference(): [ViewMode, (v: ViewMode) => void] {
  const [view, setViewRaw] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem('garden/materials-view')
      return (stored === 'tiles' || stored === 'table') ? stored : 'tiles'
    } catch { return 'tiles' }
  })
  function setView(v: ViewMode) {
    setViewRaw(v)
    try { localStorage.setItem('garden/materials-view', v) } catch { /* ignore */ }
  }
  return [view, setView]
}

const VIEW_TABS = [
  { id: 'tiles', label: 'Tiles' },
  { id: 'table', label: 'Table' },
]

export function MaterialsPage() {
  const {
    materials, loading,
    setMaterialStatus, addMaterial, updateMaterial, deleteMaterial,
    reorderMaterials,
    addOption, updateOption, deleteOption, setOptionStatus, setOptionImage,
  } = useMaterials()

  const [view, setView] = useViewPreference()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const [editMaterial,      setEditMaterial]      = useState<Material | null>(null)
  const [addingMaterial,    setAddingMaterial]    = useState(false)
  const [optionsMaterialId, setOptionsMaterialId] = useState<string | null>(null)

  const optionsMaterial = optionsMaterialId
    ? materials.find(m => m.id === optionsMaterialId) ?? null
    : null

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = materials.findIndex(m => m.id === active.id)
      const newIndex = materials.findIndex(m => m.id === over.id)
      const reordered = arrayMove(materials, oldIndex, newIndex)
      reorderMaterials(reordered.map(m => m.id))
    }
  }

  if (loading) return (
    <div>
      <PageHeader title="Materials" subtitle="Sourcing and procurement tracker" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0,1,2].map(i => <Card key={i}><div className="h-32 w-full animate-pulse bg-white/5 rounded" /></Card>)}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Materials" subtitle="Sourcing and procurement tracker" />

      <Tabs tabs={VIEW_TABS} active={view} onChange={id => setView(id as ViewMode)} />

      <div className="mt-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={materials.map(m => m.id)}
            strategy={view === 'tiles' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {view === 'tiles' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {materials.map(m => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    onStatusChange={setMaterialStatus}
                    onEdit={() => setEditMaterial(m)}
                    onDelete={deleteMaterial}
                    onOpenOptions={() => setOptionsMaterialId(m.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-garden-text/40">
                      <th className="pb-2 w-6 font-normal" />
                      <th className="pb-2 pr-4 font-normal">Name</th>
                      <th className="pb-2 pr-4 font-normal">Status</th>
                      <th className="pb-2 pr-4 font-normal">Spec</th>
                      <th className="pb-2 pr-4 text-right font-normal">Price</th>
                      <th className="pb-2 pr-4 text-center font-normal">Options</th>
                      <th className="pb-2 font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(m => (
                      <MaterialTableRow
                        key={m.id}
                        material={m}
                        onStatusChange={setMaterialStatus}
                        onEdit={() => setEditMaterial(m)}
                        onDelete={deleteMaterial}
                        onOpenOptions={() => setOptionsMaterialId(m.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>

      <button
        onClick={() => setAddingMaterial(true)}
        className="mt-4 flex w-full items-center gap-2 rounded border border-dashed border-white/10 px-4 py-3 text-sm text-garden-text/40 hover:border-amber/30 hover:text-amber"
      >
        ＋ Add material
      </button>

      <MaterialModal
        key={editMaterial?.id ?? 'new'}
        open={addingMaterial || editMaterial !== null}
        material={editMaterial ?? undefined}
        onSave={data => {
          if (editMaterial) updateMaterial(editMaterial.id, data)
          else addMaterial(data)
        }}
        onClose={() => { setAddingMaterial(false); setEditMaterial(null) }}
      />

      {optionsMaterial && (
        <OptionsModal
          material={optionsMaterial}
          onClose={() => setOptionsMaterialId(null)}
          onAddOption={addOption}
          onUpdateOption={updateOption}
          onDeleteOption={deleteOption}
          onSetStatus={setOptionStatus}
          onSetImage={setOptionImage}
        />
      )}
    </div>
  )
}

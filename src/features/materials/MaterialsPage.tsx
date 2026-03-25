import { useState } from 'react'
import { PageHeader, Card } from '../../design-system'
import { useMaterials } from '../../lib/firebase/hooks'
import { MaterialCard }  from './MaterialCard'
import { MaterialModal } from './MaterialModal'
import { OptionsModal }  from './OptionsModal'
import type { Material } from '../../types'

export function MaterialsPage() {
  const {
    materials, loading,
    setMaterialStatus, addMaterial, updateMaterial, deleteMaterial,
    addOption, updateOption, deleteOption, setOptionStatus, setOptionImage,
  } = useMaterials()

  const [editMaterial,      setEditMaterial]      = useState<Material | null>(null)
  const [addingMaterial,    setAddingMaterial]    = useState(false)
  const [optionsMaterialId, setOptionsMaterialId] = useState<string | null>(null)

  // Always read the latest material from the live list (so options stay up-to-date)
  const optionsMaterial = optionsMaterialId
    ? materials.find(m => m.id === optionsMaterialId) ?? null
    : null

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

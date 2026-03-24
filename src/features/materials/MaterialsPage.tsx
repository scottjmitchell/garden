import { useState } from 'react'
import { PageHeader, Card, Badge, Modal } from '../../design-system'
import { MATERIALS } from '../../lib/mock-data'
import type { Material, MaterialStatus } from '../../types'

const statusVariant: Record<MaterialStatus, 'default' | 'warning' | 'success'> = {
  researching: 'default',
  'to-order':  'warning',
  ordered:     'success',
  delivered:   'success',
}

function MaterialCard({ material, onOpen }: { material: Material; onOpen: () => void }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-lg" style={{ color: material.accent }}>{material.name}</p>
        <Badge variant={statusVariant[material.status]}>{material.status}</Badge>
      </div>
      <p className="line-clamp-3 text-sm text-garden-text/60">{material.spec}</p>
      <p className="text-xs text-garden-text/40">{`£${material.low.toLocaleString()} – £${material.high.toLocaleString()}`}</p>
      <button
        onClick={onOpen}
        className="mt-auto self-start text-xs text-amber/70 hover:text-amber transition-colors"
      >
        View details →
      </button>
    </Card>
  )
}

export function MaterialsPage() {
  const [selected, setSelected] = useState<Material | null>(null)

  return (
    <div>
      <PageHeader title="Materials" subtitle="Sourcing and procurement tracker" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATERIALS.map(m => (
          <MaterialCard key={m.id} material={m} onOpen={() => setSelected(m)} />
        ))}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name}
      >
        {selected && (
          <div className="space-y-4">
            <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
            <div>
              <p className="mb-1 text-xs text-garden-text/40">Specification</p>
              <p className="text-sm text-garden-text/80">{selected.spec}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-garden-text/40">Cost estimate</p>
              <p className="text-sm text-garden-text/80">{`£${selected.low.toLocaleString()} – £${selected.high.toLocaleString()}`}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

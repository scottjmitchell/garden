import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, ConfirmModal } from '../../design-system'
import type { Material, MaterialStatus } from '../../types'

const STATUS_LABELS: Record<MaterialStatus, string> = {
  'researching': 'Researching',
  'to-order':    'To order',
  'ordered':     'Ordered',
  'delivered':   'Delivered',
}

interface MaterialCardProps {
  material:       Material
  onStatusChange: (id: string, status: MaterialStatus) => void
  onEdit:         () => void
  onDelete:       (id: string) => void
  onOpenOptions:  () => void
}

export function MaterialCard({ material, onStatusChange, onEdit, onDelete, onOpenOptions }: MaterialCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOrdered = material.status === 'ordered' || material.status === 'delivered'

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group/card">
      <Card className="flex flex-col gap-3" data-testid="material-card">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className="mt-1 flex w-3 shrink-0 cursor-grab justify-center opacity-0 transition-opacity group-hover/card:opacity-100 text-garden-text/20 hover:text-garden-text/50 active:cursor-grabbing"
              aria-label="Drag to reorder"
              tabIndex={-1}
            >
              <svg viewBox="0 0 10 16" className="h-4 w-2.5" fill="currentColor">
                <circle cx="3" cy="2" r="1.2" />
                <circle cx="7" cy="2" r="1.2" />
                <circle cx="3" cy="8" r="1.2" />
                <circle cx="7" cy="8" r="1.2" />
                <circle cx="3" cy="14" r="1.2" />
                <circle cx="7" cy="14" r="1.2" />
              </svg>
            </button>
            <p className="font-display text-lg" style={{ color: material.accent }}>
              {material.name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onEdit} aria-label="Edit material" className="text-xs text-garden-text/30 hover:text-amber px-1">✎</button>
            <button
              data-testid="material-delete-btn"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete material"
              className="text-xs text-garden-text/30 hover:text-[#9E4E24] px-1"
            >
              ✕
            </button>
          </div>
        </div>

        <label className={`relative flex w-fit cursor-pointer items-center rounded-full border px-3 py-0.5 text-xs ${
          isOrdered
            ? 'border-moss/40 bg-moss/20 text-[#8fbb8a]'
            : 'border-amber/30 bg-amber/10 text-amber'
        }`}>
          <span aria-hidden="true">{STATUS_LABELS[material.status]}</span>
          <select
            data-testid="material-status"
            value={material.status}
            onChange={e => onStatusChange(material.id, e.target.value as MaterialStatus)}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent opacity-0 focus:outline-none"
            aria-label={`Status: ${STATUS_LABELS[material.status]}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <p className="text-sm text-garden-text/60 line-clamp-3">{material.spec}</p>
        <p className="text-xs text-garden-text/40">
          £{material.low.toLocaleString('en-GB')} – £{material.high.toLocaleString('en-GB')}
        </p>

        <button
          onClick={onOpenOptions}
          className="mt-auto self-start text-xs text-amber/70 hover:text-amber transition-colors"
        >
          Options ({material.options.length}) →
        </button>

        <ConfirmModal
          open={confirmOpen}
          title={`Delete "${material.name}"?`}
          body="This will permanently remove the material and all its options."
          onConfirm={() => { onDelete(material.id); setConfirmOpen(false) }}
          onCancel={() => setConfirmOpen(false)}
        />
      </Card>
    </div>
  )
}

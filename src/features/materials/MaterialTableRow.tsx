import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ConfirmModal } from '../../design-system'
import type { Material, MaterialStatus } from '../../types'

const STATUS_LABELS: Record<MaterialStatus, string> = {
  'researching': 'Researching',
  'to-order':    'To order',
  'ordered':     'Ordered',
  'delivered':   'Delivered',
}

interface MaterialTableRowProps {
  material:       Material
  onStatusChange: (id: string, status: MaterialStatus) => void
  onEdit:         () => void
  onDelete:       (id: string) => void
  onOpenOptions:  () => void
}

export function MaterialTableRow({ material, onStatusChange, onEdit, onDelete, onOpenOptions }: MaterialTableRowProps) {
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
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-testid="material-table-row"
      className="group border-b border-white/5 hover:bg-white/[0.02]"
    >
      <td className="py-2.5 w-6">
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          className="flex w-3 shrink-0 cursor-grab justify-center opacity-0 transition-opacity group-hover:opacity-100 text-garden-text/20 hover:text-garden-text/50 active:cursor-grabbing"
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
      </td>
      <td className="py-2.5 pr-4">
        <span className="font-display text-base" style={{ color: material.accent }}>{material.name}</span>
      </td>
      <td className="py-2.5 pr-4">
        <label className={`relative flex w-fit cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs ${
          isOrdered
            ? 'border-moss/40 bg-moss/20 text-[#8fbb8a]'
            : 'border-amber/30 bg-amber/10 text-amber'
        }`}>
          <span aria-hidden="true">{STATUS_LABELS[material.status]}</span>
          <select
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
      </td>
      <td className="py-2.5 pr-4 text-sm text-garden-text/60 max-w-[200px] truncate">{material.spec}</td>
      <td className="py-2.5 pr-4 text-xs text-garden-text/40 text-right whitespace-nowrap">
        £{material.low.toLocaleString('en-GB')} – £{material.high.toLocaleString('en-GB')}
      </td>
      <td className="py-2.5 pr-4 text-center">
        <button onClick={onOpenOptions} className="text-xs text-amber/70 hover:text-amber">
          {material.options.length}
        </button>
      </td>
      <td className="py-2.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} aria-label="Edit material" className="text-xs text-garden-text/20 hover:text-amber px-1">✎</button>
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete material"
            className="text-xs text-garden-text/20 hover:text-[#9E4E24] px-1"
          >
            ✕
          </button>
        </div>
        <ConfirmModal
          open={confirmOpen}
          title={`Delete "${material.name}"?`}
          body="This will permanently remove the material and all its options."
          onConfirm={() => { onDelete(material.id); setConfirmOpen(false) }}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}

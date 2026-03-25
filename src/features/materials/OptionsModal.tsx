import { useState } from 'react'
import { Modal, ConfirmModal } from '../../design-system'
import { AddOptionForm } from './AddOptionForm'
import { OptionCard }    from './OptionCard'
import type { Material, MaterialOption, OptionStatus } from '../../types'

interface OptionsModalProps {
  material:       Material
  onClose:        () => void
  onAddOption:    (materialId: string, option: Omit<MaterialOption, 'id'>) => void
  onUpdateOption: (materialId: string, optionId: string, option: Omit<MaterialOption, 'id'>) => void
  onDeleteOption: (materialId: string, optionId: string) => void
  onSetStatus:    (materialId: string, optionId: string, status: OptionStatus) => void
  onSetImage:     (materialId: string, optionId: string, url: string) => void
}

export function OptionsModal({
  material, onClose,
  onAddOption, onUpdateOption, onDeleteOption, onSetStatus, onSetImage,
}: OptionsModalProps) {
  const [compareMode,   setCompareMode]   = useState(false)
  const [addingOption,  setAddingOption]  = useState(false)
  const [editingOption, setEditingOption] = useState<MaterialOption | null>(null)
  const [deleteOption,  setDeleteOption]  = useState<MaterialOption | null>(null)

  const options    = material.options
  const pricesOnly = options.filter(o => o.price != null).map(o => o.price!)
  const minPrice   = pricesOnly.length ? Math.min(...pricesOnly) : null

  return (
    <Modal open onClose={onClose} title={`${material.name} — Options`}>
      <div data-testid="options-modal">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-garden-text/40">{options.length} options · {material.spec}</p>
          <button
            onClick={() => setCompareMode(c => !c)}
            className={`flex items-center gap-1.5 rounded border px-3 py-1 text-xs transition-colors ${
              compareMode
                ? 'border-amber/40 bg-amber/10 text-amber'
                : 'border-white/10 text-garden-text/40 hover:text-garden-text'
            }`}
          >
            ⇄ Compare
          </button>
        </div>

        <div
          data-testid={compareMode ? 'options-compare-mode' : 'options-list-mode'}
          className={compareMode ? 'flex gap-3 overflow-x-auto pb-2' : 'space-y-3'}
        >
          {options.map(opt => (
            <OptionCard
              key={opt.id}
              option={opt}
              materialId={material.id}
              isBest={opt.price != null && opt.price === minPrice}
              highEstimate={material.high}
              compareMode={compareMode}
              onEdit={() => setEditingOption(opt)}
              onDelete={() => setDeleteOption(opt)}
              onSetStatus={status => onSetStatus(material.id, opt.id, status)}
              onSetImage={url => onSetImage(material.id, opt.id, url)}
            />
          ))}

          {addingOption ? (
            <AddOptionForm
              onSave={data => { onAddOption(material.id, { ...data }); setAddingOption(false) }}
              onCancel={() => setAddingOption(false)}
            />
          ) : (
            <button
              onClick={() => setAddingOption(true)}
              className={`flex items-center justify-center gap-2 rounded border border-dashed border-white/10 text-xs text-garden-text/30 hover:border-amber/30 hover:text-amber transition-colors ${
                compareMode ? 'h-48 w-36 shrink-0 flex-col' : 'w-full py-3'
              }`}
            >
              ＋ Add option
            </button>
          )}
        </div>

        {editingOption && (
          <div className="mt-4">
            <AddOptionForm
              initial={editingOption}
              onSave={data => {
                const update: Omit<MaterialOption, 'id'> = { ...data, status: editingOption.status ?? null }
                if (editingOption.imageUrl) update.imageUrl = editingOption.imageUrl
                onUpdateOption(material.id, editingOption.id, update)
                setEditingOption(null)
              }}
              onCancel={() => setEditingOption(null)}
            />
          </div>
        )}

        <ConfirmModal
          open={deleteOption !== null}
          title={`Delete "${deleteOption?.name}"?`}
          body="This will permanently remove this option."
          onConfirm={() => { onDeleteOption(material.id, deleteOption!.id); setDeleteOption(null) }}
          onCancel={() => setDeleteOption(null)}
        />
      </div>
    </Modal>
  )
}

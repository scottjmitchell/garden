import { useState } from 'react'
import { Modal } from '../../design-system'
import type { BudgetItem } from '../../types'

interface BudgetItemModalProps {
  open:    boolean
  item?:   BudgetItem
  onSave:  (data: { name: string; low: number; high: number }) => void
  onClose: () => void
}

export function BudgetItemModal({ open, item, onSave, onClose }: BudgetItemModalProps) {
  const [name, setName] = useState(item?.name ?? '')
  const [low,  setLow]  = useState(String(item?.low  ?? ''))
  const [high, setHigh] = useState(String(item?.high ?? ''))

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), low: Number(low) || 0, high: Number(high) || 0 })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit budget item' : 'Add budget item'}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Item name</label>
          <input aria-label="Item name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Low (£)</label>
            <input aria-label="Low" type="number" value={low} onChange={e => setLow(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">High (£)</label>
            <input aria-label="High" type="number" value={high} onChange={e => setHigh(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-garden-text/50 hover:text-garden-text">Cancel</button>
          <button onClick={handleSave} className="rounded bg-amber px-4 py-2 text-sm font-semibold text-[#111410] hover:bg-amber/80">Save</button>
        </div>
      </div>
    </Modal>
  )
}

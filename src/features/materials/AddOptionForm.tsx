import { useState } from 'react'
import type { MaterialOption } from '../../types'

interface AddOptionFormProps {
  onSave:   (option: Omit<MaterialOption, 'id' | 'status' | 'imageUrl'>) => void
  onCancel: () => void
  initial?: MaterialOption
}

export function AddOptionForm({ onSave, onCancel, initial }: AddOptionFormProps) {
  const [name,     setName]     = useState(initial?.name      ?? '')
  const [supplier, setSupplier] = useState(initial?.supplier  ?? '')
  const [leadTime, setLeadTime] = useState(initial?.leadTime  ?? '')
  const [price,    setPrice]    = useState(initial?.price != null ? String(initial.price) : '')
  const [url,      setUrl]      = useState(initial?.url       ?? '')
  const [notes,    setNotes]    = useState(initial?.notes     ?? '')

  function handleSave() {
    if (!name.trim()) return
    // Firebase RTDB rejects undefined values — omit optional fields when empty
    const data: Parameters<typeof onSave>[0] = { name: name.trim() }
    if (supplier)         data.supplier = supplier
    if (leadTime)         data.leadTime = leadTime
    if (price)            data.price    = Number(price)
    if (url)              data.url      = url
    if (notes)            data.notes    = notes
    onSave(data)
  }

  return (
    <div className="rounded border border-amber/20 bg-white/3 p-4 space-y-3">
      <p className="text-xs font-semibold text-garden-text/60 uppercase tracking-wider">
        {initial ? 'Edit option' : 'Add option'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-garden-text/40">Name *</label>
          <input aria-label="Option name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-garden-text focus:outline-none focus:border-white/20" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Supplier</label>
          <input value={supplier} onChange={e => setSupplier(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Lead time</label>
          <input value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 2 weeks"
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Price (£)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-garden-text/40">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full resize-none rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} aria-label="Save option" className="rounded bg-amber px-3 py-1.5 text-xs font-semibold text-[#111410]">
          Save option
        </button>
        <button onClick={onCancel} className="text-xs text-garden-text/40 hover:text-garden-text">Cancel</button>
      </div>
    </div>
  )
}

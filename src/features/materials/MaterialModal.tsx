import { useState } from 'react'
import { Modal } from '../../design-system'
import type { Material, MaterialStatus } from '../../types'

interface MaterialModalProps {
  open:      boolean
  material?: Material
  onSave:    (data: Omit<Material, 'id' | 'options'>) => void
  onClose:   () => void
}

export function MaterialModal({ open, material, onSave, onClose }: MaterialModalProps) {
  const [name,   setName]   = useState(material?.name   ?? '')
  const [spec,   setSpec]   = useState(material?.spec   ?? '')
  const [low,    setLow]    = useState(String(material?.low  ?? ''))
  const [high,   setHigh]   = useState(String(material?.high ?? ''))
  const [status, setStatus] = useState<MaterialStatus>(material?.status ?? 'researching')
  const [accent, setAccent] = useState(material?.accent ?? '#C8922A')

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), spec, low: Number(low) || 0, high: Number(high) || 0, status, accent })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={material ? 'Edit material' : 'Add material'}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Name</label>
          <input aria-label="Name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Spec</label>
          <textarea aria-label="Spec" value={spec} onChange={e => setSpec(e.target.value)} rows={2}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Low estimate (£)</label>
            <input aria-label="Low estimate" type="number" value={low} onChange={e => setLow(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">High estimate (£)</label>
            <input aria-label="High estimate" type="number" value={high} onChange={e => setHigh(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as MaterialStatus)}
            className="w-full rounded border border-white/10 bg-[#1c2017] px-3 py-2 text-sm text-garden-text">
            <option value="researching">Researching</option>
            <option value="to-order">To order</option>
            <option value="ordered">Ordered</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Accent colour</label>
          <div className="flex gap-3">
            {['#C8922A', '#8fbb8a', '#EDE8DC'].map(c => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${accent === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
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

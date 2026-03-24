// src/features/plan/PhaseModal.tsx
import { useState } from 'react'
import { Modal } from '../../design-system'
import type { Phase, PhaseStatus } from '../../types'

interface PhaseModalProps {
  open:    boolean
  phase?:  Phase
  onSave:  (data: { num: string; title: string; date: string; status: PhaseStatus }) => void
  onClose: () => void
}

export function PhaseModal({ open, phase, onSave, onClose }: PhaseModalProps) {
  const [num,    setNum]    = useState(phase?.num    ?? '')
  const [title,  setTitle]  = useState(phase?.title  ?? '')
  const [date,   setDate]   = useState(phase?.date   ?? '')
  const [status, setStatus] = useState<PhaseStatus>(phase?.status ?? 'upcoming')

  function handleSave() {
    if (!title.trim()) return
    onSave({ num, title: title.trim(), date, status })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={phase ? 'Edit phase' : 'Add phase'}>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Num</label>
            <input
              aria-label="Num"
              value={num}
              onChange={e => setNum(e.target.value)}
              placeholder="0"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
            />
          </div>
          <div className="col-span-3">
            <label className="mb-1 block text-xs text-garden-text/50">Title</label>
            <input
              aria-label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Phase title"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Date</label>
          <input
            aria-label="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="April 2026"
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PhaseStatus)}
            className="w-full rounded border border-white/10 bg-[#1c2017] px-3 py-2 text-sm text-garden-text"
          >
            <option value="upcoming">Upcoming</option>
            <option value="current">Current</option>
            <option value="done">Complete</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-garden-text/50 hover:text-garden-text">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-amber px-4 py-2 text-sm font-semibold text-[#111410] hover:bg-amber/80"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

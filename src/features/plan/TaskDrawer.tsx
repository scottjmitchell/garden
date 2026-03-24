import { useRef, useEffect, useState } from 'react'
import type { Task, TaskStatus } from '../../types'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done',        label: 'Done'        },
]

interface TaskDrawerProps {
  phaseId:        string
  task:           Task | null
  onClose:        () => void
  onUpdateStatus: (phaseId: string, taskId: string, status: TaskStatus | null) => void
  onUpdateNotes:  (phaseId: string, taskId: string, notes: string) => void
  onAddOption:    (phaseId: string, taskId: string, option: { name: string; price?: number; url?: string; notes?: string }) => void
  onSelectOption: (phaseId: string, taskId: string, selectedId: string, allIds: string[]) => void
  onDeleteOption: (phaseId: string, taskId: string, optionId: string) => void
}

export function TaskDrawer({
  phaseId, task, onClose,
  onUpdateStatus, onUpdateNotes,
  onAddOption, onSelectOption, onDeleteOption,
}: TaskDrawerProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [addingOption, setAddingOption] = useState(false)
  const [optName,  setOptName]  = useState('')
  const [optPrice, setOptPrice] = useState('')
  const [optUrl,   setOptUrl]   = useState('')
  const [optNotes, setOptNotes] = useState('')

  useEffect(() => {
    if (!task) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [task, onClose])

  if (!task) return null

  const options = Object.entries(task.options ?? {}).map(([id, o]) => ({ ...o, id }))
  const allIds  = options.map(o => o.id)

  function handleAddOption() {
    if (!optName.trim()) return
    onAddOption(phaseId, task!.id, {
      name:  optName.trim(),
      price: optPrice ? parseFloat(optPrice) : undefined,
      url:   optUrl   || undefined,
      notes: optNotes || undefined,
    })
    setOptName(''); setOptPrice(''); setOptUrl(''); setOptNotes('')
    setAddingOption(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div
        data-testid="task-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/10 bg-[#111410] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-lg text-garden-text">{task.text}</h3>
          <button onClick={onClose} aria-label="Close drawer" className="text-garden-text/40 hover:text-garden-text">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status pills */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateStatus(phaseId, task.id, task.status === value ? null : value)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    task.status === value
                      ? 'bg-amber text-[#111410] font-semibold'
                      : 'border border-white/10 text-garden-text/50 hover:border-white/20 hover:text-garden-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Notes</p>
            <textarea
              defaultValue={task.notes ?? ''}
              placeholder="Add notes…"
              rows={4}
              onBlur={e => {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                onUpdateNotes(phaseId, task.id, e.target.value)
              }}
              onInput={e => {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => {
                  onUpdateNotes(phaseId, task.id, (e.target as HTMLTextAreaElement).value)
                }, 800)
              }}
              className="w-full resize-none rounded border border-white/10 bg-white/5 p-3 text-sm text-garden-text/70 placeholder:text-garden-text/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          {/* Options list */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Options</p>
            {options.length === 0 && (
              <p className="text-xs text-garden-text/30 italic">No options yet</p>
            )}
            {options.map(opt => (
              <div
                key={opt.id}
                className={`mb-2 rounded border p-3 text-sm ${
                  opt.selected ? 'border-moss/50 bg-moss/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-garden-text/80">{opt.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onSelectOption(phaseId, task.id, opt.selected ? '' : opt.id, allIds)}
                      className={`text-xs px-2 py-0.5 rounded ${opt.selected ? 'text-moss' : 'text-garden-text/30 hover:text-garden-text/60'}`}
                    >
                      {opt.selected ? '✓ Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => onDeleteOption(phaseId, task.id, opt.id)}
                      className="text-xs text-garden-text/20 hover:text-[#9E4E24] px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {opt.price && <p className="mt-1 text-xs text-amber">£{opt.price}</p>}
                {opt.url   && <a href={opt.url} target="_blank" rel="noreferrer" className="mt-0.5 block text-xs text-[#5A7A8A] hover:underline truncate">{opt.url}</a>}
              </div>
            ))}

            {addingOption ? (
              <div className="rounded border border-white/10 bg-white/5 p-3 space-y-2">
                <input value={optName}  onChange={e => setOptName(e.target.value)}  placeholder="Name *" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <input value={optPrice} onChange={e => setOptPrice(e.target.value)} placeholder="Price" type="number" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <input value={optUrl}   onChange={e => setOptUrl(e.target.value)}   placeholder="URL" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <div className="flex gap-2">
                  <button onClick={handleAddOption} className="rounded bg-amber px-3 py-1 text-xs font-semibold text-[#111410]">Add</button>
                  <button onClick={() => setAddingOption(false)} className="text-xs text-garden-text/40">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingOption(true)}
                className="mt-1 text-xs text-garden-text/30 hover:text-amber"
              >
                ＋ Add option
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

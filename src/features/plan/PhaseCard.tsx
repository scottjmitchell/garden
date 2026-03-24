import { useState, useRef, useEffect } from 'react'
import { Card, Badge, ConfirmModal } from '../../design-system'
import type { Phase, PhaseStatus } from '../../types'
import { loadStoredPhaseNote } from '../../lib/firebase/hooks'
import { TaskRow } from './TaskRow'

const statusVariant: Record<PhaseStatus, 'success' | 'warning' | 'default'> = {
  done:     'success',
  current:  'warning',
  upcoming: 'default',
}

const statusLabel: Record<PhaseStatus, string> = {
  done:     'Done',
  current:  'In progress',
  upcoming: 'Upcoming',
}

interface PhaseCardProps {
  phase:            Phase
  onToggle:         (phaseId: string, taskId: string, done: boolean) => void
  onEdit:           () => void
  onDelete:         (phaseId: string) => void
  updatePhaseNotes: (phaseId: string, notes: string) => void
}

export function PhaseCard({ phase, onToggle, onEdit, onDelete, updatePhaseNotes }: PhaseCardProps) {
  // Resolve initial notes: Firebase value takes priority, localStorage is fallback
  const initialNotes = phase.notes ?? loadStoredPhaseNote(phase.id)

  const [open, setOpen]               = useState(phase.status === 'current')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hasNotes, setHasNotes]       = useState(!!(initialNotes))
  const notesRef    = useRef(initialNotes)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Stable ref to avoid stale closure in native listener
  const phaseIdRef         = useRef(phase.id)
  const updateNotesRef     = useRef(updatePhaseNotes)
  useEffect(() => { phaseIdRef.current = phase.id }, [phase.id])
  useEffect(() => { updateNotesRef.current = updatePhaseNotes }, [updatePhaseNotes])

  // Native DOM listener — catches Playwright fill() which bypasses React synthetic events
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    function handleNativeInput() {
      const val = el!.value
      notesRef.current = val
      setHasNotes(!!val)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        updateNotesRef.current(phaseIdRef.current, val)
      }, 800)
    }
    el.addEventListener('input', handleNativeInput)
    return () => el.removeEventListener('input', handleNativeInput)
  }, [])

  // Sync notes from Firebase: only update when not editing (textarea empty or not focused)
  useEffect(() => {
    const incoming = phase.notes ?? loadStoredPhaseNote(phase.id)
    const el = textareaRef.current
    const isFocused = !!(el && document.activeElement === el)
    const hasLocalContent = !!(el && el.value)
    if (!isFocused && !hasLocalContent) {
      notesRef.current = incoming
      setHasNotes(!!incoming)
      if (el) el.value = incoming
    }
  }, [phase.notes, phase.id])

  const done  = phase.tasks.filter(t => t.done).length
  const total = phase.tasks.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Card>
      {/* Header */}
      <button
        className="flex w-full items-start justify-between gap-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber/30 text-xs text-amber">
            {phase.num}
          </span>
          <div>
            <p className="font-display text-lg text-garden-text flex items-center gap-2">
              {phase.title}
              {hasNotes && (
                <span
                  data-testid="phase-has-notes-dot"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-amber"
                  title="Has notes"
                />
              )}
            </p>
            <p className="text-xs text-garden-text/40">{phase.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={statusVariant[phase.status]}>{statusLabel[phase.status]}</Badge>
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            data-testid="phase-edit-btn"
            aria-label="Edit phase"
            className="text-xs text-garden-text/30 hover:text-amber p-1"
          >
            ✎
          </button>
          <button
            onClick={e => { e.stopPropagation(); setConfirmOpen(true) }}
            data-testid="phase-delete-btn"
            aria-label="Remove phase"
            className="text-xs text-garden-text/30 hover:text-[#9E4E24] p-1"
          >
            ✕
          </button>
        </div>
      </button>

      {/* Progress bar */}
      <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-garden-text/40">{done}/{total} tasks</p>

      {/* Task list */}
      {open && (
        <ul className="mt-4 space-y-0.5">
          {phase.tasks.map(task => (
            <TaskRow
              key={task.id}
              phaseId={phase.id}
              task={task}
              onToggle={onToggle}
              onClick={() => {}} // no-op for now; wired in Task 9
            />
          ))}
        </ul>
      )}

      {/* Notes */}
      <hr className="mt-4 border-white/5" />
      <textarea
        ref={textareaRef}
        data-testid="phase-notes"
        defaultValue={initialNotes}
        placeholder="Add notes…"
        rows={2}
        onBlur={e => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          const val = e.target.value
          notesRef.current = val
          setHasNotes(!!val)
          updatePhaseNotes(phase.id, val)
        }}
        className="mt-3 w-full resize-none bg-transparent text-xs text-garden-text/60 placeholder:text-garden-text/20 focus:outline-none"
      />

      <ConfirmModal
        open={confirmOpen}
        title={`Delete "${phase.title}"?`}
        body="This will permanently remove the phase and all its tasks."
        onConfirm={() => { onDelete(phase.id); setConfirmOpen(false) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  )
}

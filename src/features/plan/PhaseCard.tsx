import { useState } from 'react'
import { Card, Badge } from '../../design-system'
import type { Phase, PhaseStatus } from '../../types'
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
  phase:    Phase
  onToggle: (phaseId: string, taskId: string, done: boolean) => void
}

export function PhaseCard({ phase, onToggle }: PhaseCardProps) {
  const [open, setOpen] = useState(phase.status === 'current')
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
            <p className="font-display text-lg text-garden-text">{phase.title}</p>
            <p className="text-xs text-garden-text/40">{phase.date}</p>
          </div>
        </div>
        <Badge variant={statusVariant[phase.status]}>{statusLabel[phase.status]}</Badge>
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
    </Card>
  )
}

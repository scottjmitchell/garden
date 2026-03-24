import { useState } from 'react'
import { PageHeader } from '../../design-system'
import { PHASES } from '../../lib/mock-data'
import { PhaseCard } from './PhaseCard'
import type { Phase } from '../../types'

export function PlanPage() {
  const [phases, setPhases] = useState<Phase[]>(PHASES)

  function handleToggle(phaseId: string, taskId: string, done: boolean) {
    setPhases(prev =>
      prev.map(p =>
        p.id !== phaseId ? p : {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, done } : t),
        }
      )
    )
  }

  const totalTasks = phases.reduce((n, p) => n + p.tasks.length, 0)
  const doneTasks  = phases.reduce((n, p) => n + p.tasks.filter(t => t.done).length, 0)

  return (
    <div>
      <PageHeader
        title="Plan"
        subtitle={`${doneTasks} of ${totalTasks} tasks complete`}
      />
      <div className="space-y-4">
        {phases.map(phase => (
          <PhaseCard key={phase.id} phase={phase} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  )
}

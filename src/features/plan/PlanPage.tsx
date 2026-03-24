import { useState } from 'react'
import { PageHeader } from '../../design-system'
import { usePhases } from '../../lib/firebase/hooks'
import { PhaseCard } from './PhaseCard'
import { PhaseModal } from './PhaseModal'
import type { Phase } from '../../types'

export function PlanPage() {
  const { phases, toggleTask, addPhase, updatePhase, deletePhase, updatePhaseNotes } = usePhases()
  const [phaseModal, setPhaseModal] = useState<{ open: boolean; phase?: Phase }>({ open: false })

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
          <PhaseCard
            key={phase.id}
            phase={phase}
            onToggle={toggleTask}
            onEdit={() => setPhaseModal({ open: true, phase })}
            onDelete={deletePhase}
            updatePhaseNotes={updatePhaseNotes}
          />
        ))}
      </div>

      <button
        onClick={() => setPhaseModal({ open: true })}
        className="flex items-center gap-2 rounded border border-dashed border-white/10 px-4 py-3 text-sm text-garden-text/40 hover:border-amber/30 hover:text-amber w-full mt-4"
      >
        ＋ Add phase
      </button>

      <PhaseModal
        key={phaseModal.phase?.id ?? 'new'}
        open={phaseModal.open}
        phase={phaseModal.phase}
        onSave={data => phaseModal.phase ? updatePhase(phaseModal.phase.id, data) : addPhase(data)}
        onClose={() => setPhaseModal({ open: false })}
      />
    </div>
  )
}

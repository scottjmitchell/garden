import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { PageHeader } from '../../design-system'
import { usePhases } from '../../lib/firebase/hooks'
import { PhaseCard } from './PhaseCard'
import { PhaseModal } from './PhaseModal'
import { TaskDrawer } from './TaskDrawer'
import type { Phase, Task } from '../../types'

export function PlanPage() {
  const {
    phases, toggleTask, addPhase, updatePhase, deletePhase, reorderPhases, updatePhaseNotes,
    addTask, deleteTask, updateTaskText, updateTaskStatus, updateTaskNotes,
    reorderTasks,
    addTaskOption, selectTaskOption, deleteTaskOption,
  } = usePhases()
  const [phaseModal, setPhaseModal] = useState<{ open: boolean; phase?: Phase }>({ open: false })
  const [drawerTask, setDrawerTask] = useState<{ phase: Phase; task: Task } | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const totalTasks = phases.reduce((n, p) => n + p.tasks.length, 0)
  const doneTasks  = phases.reduce((n, p) => n + p.tasks.filter(t => t.done).length, 0)

  function handlePhaseDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex(p => p.id === active.id)
      const newIndex = phases.findIndex(p => p.id === over.id)
      const reordered = arrayMove(phases, oldIndex, newIndex)
      reorderPhases(reordered.map(p => p.id))
    }
  }

  return (
    <div>
      <PageHeader
        title="Plan"
        subtitle={`${doneTasks} of ${totalTasks} tasks complete`}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhaseDragEnd}>
        <SortableContext items={phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={index}
                onToggle={toggleTask}
                onEdit={() => setPhaseModal({ open: true, phase })}
                onDelete={deletePhase}
                updatePhaseNotes={updatePhaseNotes}
                onTaskClick={task => setDrawerTask({ phase, task })}
                onAddTask={addTask}
                onDeleteTask={deleteTask}
                onRenameTask={updateTaskText}
                onReorderTasks={reorderTasks}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

      <TaskDrawer
        phaseId={drawerTask?.phase.id ?? ''}
        task={drawerTask?.task ?? null}
        onClose={() => setDrawerTask(null)}
        onUpdateStatus={updateTaskStatus}
        onUpdateNotes={updateTaskNotes}
        onAddOption={addTaskOption}
        onSelectOption={selectTaskOption}
        onDeleteOption={deleteTaskOption}
      />
    </div>
  )
}

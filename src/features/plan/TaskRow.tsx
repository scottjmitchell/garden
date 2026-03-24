// src/features/plan/TaskRow.tsx
import type { Task } from '../../types'

interface TaskRowProps {
  phaseId:  string
  task:     Task
  onToggle: (phaseId: string, taskId: string, done: boolean) => void
  onClick:  (task: Task) => void
}

export function TaskRow({ phaseId, task, onToggle, onClick }: TaskRowProps) {
  return (
    <li
      data-testid="task-row"
      className="flex items-center gap-3 py-1.5 group"
    >
      {/* Custom moss checkbox */}
      <button
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.text}
        onClick={() => onToggle(phaseId, task.id, !task.done)}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-colors ${
          task.done
            ? 'border-moss bg-moss'
            : 'border-moss bg-transparent hover:bg-moss/20'
        }`}
      >
        {task.done && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
            <polyline
              points="1.5,5 4,7.5 8.5,2.5"
              stroke="#EDE8DC"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Task text — single click to open drawer */}
      <span
        data-testid="task-text"
        onClick={() => onClick(task)}
        className={`flex-1 cursor-pointer text-sm select-none ${
          task.done
            ? 'text-garden-text/40 line-through decoration-amber/40'
            : 'text-garden-text/80 hover:text-garden-text'
        }`}
      >
        {task.text}
      </span>
    </li>
  )
}

import { ReactNode } from 'react'

interface EmptyStateProps {
  title:        string
  description?: string
  action?:      ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="font-display text-xl text-garden-text/60">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-garden-text/40">{description}</p>
      )}
      {action}
    </div>
  )
}

import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open:     boolean
  onClose:  () => void
  title?:   string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded border border-white/10 bg-[#1c2017] p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2 className="font-display text-xl text-amber">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto text-garden-text/40 hover:text-garden-text"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

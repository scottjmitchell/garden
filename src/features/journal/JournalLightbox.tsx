import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { JournalEntry } from '../../types'
import { ConfirmModal } from '../../design-system'

interface JournalLightboxProps {
  entries:          JournalEntry[]
  index:            number
  onIndexChange:    (next: number) => void
  onClose:          () => void
  onDelete:         (id: string) => void
  onCaptionChange:  (id: string, caption: string) => void
}

export function JournalLightbox({
  entries, index, onIndexChange, onClose, onDelete, onCaptionChange,
}: JournalLightboxProps) {
  const entry = entries[index]
  const [editing, setEditing]       = useState(false)
  const [draft, setDraft]           = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => { setEditing(false) }, [index])

  const hasPrev = index > 0
  const hasNext = index < entries.length - 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editing || confirming) return
      if (e.key === 'ArrowLeft'  && hasPrev) onIndexChange(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onIndexChange(index + 1)
      if (e.key === 'Escape')                onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext, editing, confirming, onIndexChange, onClose])

  if (!entry) return null

  function startEditing() {
    setDraft(entry.caption ?? '')
    setEditing(true)
  }

  function commitCaption() {
    setEditing(false)
    if ((entry.caption ?? '') !== draft) onCaptionChange(entry.id, draft)
  }

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-black/85"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between px-4 py-3 text-garden-text/70">
        <span className="text-xs">
          {index + 1} / {entries.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-garden-text/60 hover:text-[#9E4E24]"
            aria-label="Delete photo"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-garden-text/50 hover:text-garden-text"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <button
          onClick={() => hasPrev && onIndexChange(index - 1)}
          disabled={!hasPrev}
          aria-label="Previous photo"
          className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-2xl text-garden-text/80 transition-opacity hover:bg-black/60 disabled:opacity-20 sm:left-6"
        >
          ‹
        </button>

        <img
          src={entry.imageUrl}
          alt={entry.caption ?? 'Journal photo'}
          className="max-h-[75vh] max-w-full rounded object-contain"
          onClick={e => e.stopPropagation()}
        />

        <button
          onClick={() => hasNext && onIndexChange(index + 1)}
          disabled={!hasNext}
          aria-label="Next photo"
          className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-2xl text-garden-text/80 transition-opacity hover:bg-black/60 disabled:opacity-20 sm:right-6"
        >
          ›
        </button>
      </div>

      <div
        className="relative z-10 px-4 py-4 sm:px-12"
        onClick={e => e.stopPropagation()}
      >
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitCaption}
            onKeyDown={e => {
              if (e.key === 'Enter') commitCaption()
              if (e.key === 'Escape') { setEditing(false); setDraft(entry.caption ?? '') }
            }}
            placeholder="Add a caption…"
            className="w-full rounded border border-amber/40 bg-transparent px-3 py-2 text-sm text-garden-text placeholder:text-garden-text/30 focus:outline-none"
            data-testid="journal-caption-input"
          />
        ) : (
          <button
            onClick={startEditing}
            className="block w-full rounded px-3 py-2 text-left text-sm text-garden-text/80 hover:bg-white/5"
            data-testid="journal-caption-display"
          >
            {entry.caption || <span className="italic text-garden-text/30">Add a caption…</span>}
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirming}
        title="Delete photo?"
        body="This will permanently remove the photo from the journal."
        onConfirm={() => { setConfirming(false); onDelete(entry.id) }}
        onCancel={() => setConfirming(false)}
      />
    </div>,
    document.body,
  )
}

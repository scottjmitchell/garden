import { Modal } from '../Modal/Modal'

interface ConfirmModalProps {
  open:          boolean
  title:         string
  body:          string
  confirmLabel?: string
  onConfirm:     () => void
  onCancel:      () => void
}

export function ConfirmModal({
  open, title, body, confirmLabel = 'Delete', onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-5 text-sm text-garden-text/60 leading-relaxed">{body}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded border border-white/10 px-4 py-2 text-sm text-garden-text/60 hover:text-garden-text"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded bg-[#9E4E24] px-4 py-2 text-sm font-semibold text-garden-text hover:bg-[#b85a2b]"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

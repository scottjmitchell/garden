import { useRef } from 'react'
import type { MaterialOption, OptionStatus } from '../../types'
import { storeOptionImage, imageFromClipboard } from '../../lib/firebase/storage'

const CHIP_OPTIONS: { value: Exclude<OptionStatus, null>; label: string }[] = [
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'ordered',     label: 'Ordered'     },
  { value: 'rejected',    label: 'Rejected'    },
]

const CHIP_STYLE: Record<string, string> = {
  shortlisted: 'bg-amber/15 text-amber border-amber/30',
  ordered:     'bg-moss/25 text-[#8fbb8a] border-moss/40',
  rejected:    'bg-[#9E4E24]/10 text-[#9E4E24]/70 border-[#9E4E24]/30',
  inactive:    'bg-white/5 text-garden-text/20 border-white/10',
}

interface OptionCardProps {
  option:       MaterialOption
  materialId:   string
  isBest:       boolean
  highEstimate: number
  compareMode:  boolean
  onEdit:       () => void
  onDelete:     () => void
  onSetStatus:  (status: OptionStatus) => void
  onSetImage:   (url: string) => void
}

export function OptionCard({
  option, materialId, isBest, highEstimate, compareMode,
  onEdit, onDelete, onSetStatus, onSetImage,
}: OptionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | Blob) {
    const url = await storeOptionImage(file, materialId, option.id)
    onSetImage(url)
  }

  function handlePaste(e: React.ClipboardEvent) {
    const file = imageFromClipboard(e.nativeEvent)
    if (file) handleFile(file)
  }

  const barPct = (highEstimate > 0 && option.price != null)
    ? Math.min(100, Math.round((option.price / highEstimate) * 100))
    : null

  return (
    <div
      className={`overflow-hidden rounded border border-white/10 bg-[#111410] ${
        compareMode ? 'flex flex-col w-64 shrink-0' : 'flex'
      }`}
      onPaste={handlePaste}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer items-center justify-center bg-[#0e110c] transition-colors hover:bg-[#161a13] ${
          compareMode
            ? 'aspect-[4/3] w-full border-b border-white/10'
            : 'h-auto w-36 shrink-0 border-r border-white/10'
        }`}
      >
        {option.imageUrl ? (
          <img src={option.imageUrl} alt={option.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-2xl text-white/10">⬚</div>
            <div className="mt-1 text-[10px] text-white/20">Add photo</div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      <div className="flex-1 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-garden-text/90">{option.name}</span>
          <div className="flex gap-1 shrink-0">
            <button onClick={onEdit} className="text-xs text-garden-text/30 hover:text-amber px-1">✎</button>
            <button onClick={onDelete} className="text-xs text-garden-text/30 hover:text-[#9E4E24] px-1">✕</button>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {CHIP_OPTIONS.map(({ value, label }) => {
            const active = option.status === value
            return (
              <button
                key={value}
                onClick={() => onSetStatus(active ? null : value)}
                className={`rounded-full border px-2 py-0.5 text-[9px] tracking-wide transition-colors ${
                  active ? CHIP_STYLE[value] : CHIP_STYLE.inactive
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="space-y-1 text-xs">
          {option.supplier && <div className="text-garden-text/50">Supplier: {option.supplier}</div>}
          {option.leadTime && <div className="text-garden-text/50">Lead time: {option.leadTime}</div>}
          {option.price != null && (
            <div className="text-amber font-medium">£{option.price.toLocaleString('en-GB')}</div>
          )}
          {option.url && (
            <a href={option.url} target="_blank" rel="noreferrer"
              className="block truncate text-[#5A7A8A] hover:underline">{option.url}</a>
          )}
        </div>

        {barPct !== null && (
          <div>
            <div className="mb-1 flex justify-between text-[9px] text-garden-text/30">
              <span>vs budget high</span><span>{barPct}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${isBest ? 'bg-moss/60' : 'bg-amber/40'}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        )}

        {option.notes && (
          <p className="text-[10px] italic text-garden-text/30">{option.notes}</p>
        )}
      </div>
    </div>
  )
}

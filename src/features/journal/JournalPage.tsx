import { PageHeader } from '../../design-system'
import { JOURNAL_SLOTS } from '../../lib/mock-data'

function PhotoSlot({ label, phase, imageUrl }: { label: string; phase: string; imageUrl?: string }) {
  return (
    <div className="group relative aspect-[3/2] overflow-hidden rounded border border-white/10 bg-[#1c2017]">
      {imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
          <svg className="h-8 w-8 text-garden-text/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span className="text-xs text-garden-text/30">{phase}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <p className="text-xs text-garden-text/80">{label}</p>
      </div>
    </div>
  )
}

export function JournalPage() {
  return (
    <div>
      <PageHeader title="Journal" subtitle="Visual progress through each phase of the build" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {JOURNAL_SLOTS.map(slot => (
          <PhotoSlot key={slot.id} label={slot.label} phase={slot.phase} imageUrl={slot.imageUrl} />
        ))}
      </div>
    </div>
  )
}

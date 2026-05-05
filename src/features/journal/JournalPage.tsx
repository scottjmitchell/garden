import { useEffect, useRef, useState } from 'react'
import { Button, EmptyState, PageHeader, Skeleton } from '../../design-system'
import { useJournal } from '../../lib/firebase/hooks'
import { imageFromClipboard } from '../../lib/firebase/storage'
import { JournalLightbox } from './JournalLightbox'

function JournalSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="aspect-[3/2] rounded" />
      ))}
    </div>
  )
}

export function JournalPage() {
  const { entries, loading, addEntry, deleteEntry, updateCaption } = useJournal()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]   = useState(false)
  const [openIndex, setOpenIndex]   = useState<number | null>(null)
  const [dragging, setDragging]     = useState(false)
  const dragDepth = useRef(0)

  // Close the lightbox if the entry it was pointing at disappears (e.g. delete).
  useEffect(() => {
    if (openIndex === null) return
    if (entries.length === 0) { setOpenIndex(null); return }
    if (openIndex >= entries.length) setOpenIndex(entries.length - 1)
  }, [entries.length, openIndex])

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (list.length === 0) return
    setUploading(true)
    try {
      // Upload sequentially so push-key timestamps stay distinct and ordered.
      for (const file of list) await addEntry(file)
    } finally {
      setUploading(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const file = imageFromClipboard(e.nativeEvent)
    if (file) handleFiles([file])
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!Array.from(e.dataTransfer.items ?? []).some(i => i.kind === 'file')) return
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDragLeave() {
    dragDepth.current -= 1
    if (dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false) }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageHeader title="Journal" subtitle="Photos from the build — upload, browse, caption" />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Add photo'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {loading ? (
        <JournalSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No photos yet"
          description="Upload your first photo, paste from the clipboard, or drag an image onto this page."
          action={
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Add photo'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {entries.map((entry, i) => (
            <button
              key={entry.id}
              onClick={() => setOpenIndex(i)}
              className="group relative aspect-[3/2] overflow-hidden rounded border border-white/10 bg-[#1c2017] transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-amber/60"
              data-testid="journal-tile"
            >
              <img
                src={entry.imageUrl}
                alt={entry.caption ?? 'Journal photo'}
                className="h-full w-full object-cover"
              />
              {entry.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-left">
                  <p className="truncate text-xs text-garden-text/85">{entry.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded border-2 border-dashed border-amber/60 bg-[#1c2017]/90 px-6 py-4 text-amber">
            Drop image to upload
          </div>
        </div>
      )}

      {openIndex !== null && entries[openIndex] && (
        <JournalLightbox
          entries={entries}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          onDelete={async (id) => { await deleteEntry(id) }}
          onCaptionChange={(id, caption) => updateCaption(id, caption)}
        />
      )}
    </div>
  )
}

// src/lib/firebase/storage.ts
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from './config'

const storage = getStorage(app)

/** Compress an image File/Blob to max 800px wide, JPEG at 0.8 quality. Returns a data URL. */
export function compressImage(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 800
      const scale = img.width > MAX ? MAX / img.width : 1
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Compress an image and store it:
 * - ≤ 100KB compressed → store as data URL in RTDB (returned directly)
 * - > 100KB → upload to Firebase Storage, return download URL
 */
export async function storeOptionImage(
  file: File | Blob,
  materialId: string,
  optionId: string,
): Promise<string> {
  const dataUrl = await compressImage(file)
  // ~3/4 of base64 length = byte size
  const byteSize = Math.round((dataUrl.length * 3) / 4)

  if (byteSize <= 100 * 1024) {
    return dataUrl
  }

  // Convert data URL to Blob for upload
  const res  = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `options/${materialId}/${optionId}.jpg`
  const sRef = storageRef(storage, path)
  await uploadBytes(sRef, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(sRef)
}

/** Extract an image File from a paste ClipboardEvent. Returns null if no image found. */
export function imageFromClipboard(e: ClipboardEvent): File | null {
  const items = Array.from(e.clipboardData?.items ?? [])
  const item  = items.find(i => i.type.startsWith('image/'))
  return item ? item.getAsFile() : null
}

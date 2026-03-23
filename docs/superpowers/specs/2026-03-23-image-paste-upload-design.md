# Image Paste Upload — Design Spec

**Date:** 2026-03-23
**Feature area:** Materials options modal — image upload UX
**File:** `index.html` (single-file app)

---

## Problem

The current image upload requires clicking the image zone, which opens a native file picker. The user's actual workflow is: find a product image on a supplier website → right-click → Copy Image → come back to the app and paste it. The current UI has no paste support, making this a multi-step workaround (save file, then upload).

---

## Solution

Add clipboard paste support to the image zones in the materials options modal, with a click-to-arm interaction pattern so the user can direct the paste to a specific card.

---

## Interaction Design

### States

**Default** — faint dashed border, low-key "Add photo" placeholder. Unobtrusive.

**Armed** — triggered by clicking the image zone. Green border + glow, clipboard icon, label changes to "Cmd+V to paste". A small "or pick a file" link provides fallback access to the native file picker. Only one zone is armed at a time.

**Has image** — image fills the zone. Hover shows "Replace" overlay. Clicking arms the zone for replacement (same flow).

### Paste targeting

1. If a zone is armed: paste goes to that card.
2. If nothing is armed: paste goes to the first card without an image (fallback for quick single-card paste without clicking first).
3. Pasting non-image clipboard data is silently ignored.

### Disarming

- Clicking outside any image zone (within the modal)
- Pressing Escape — handled in the existing `document.addEventListener('keydown', ...)` block (line ~5343 in index.html) by calling `setArmedZone(null)` when `e.key === 'Escape'` and modal is open
- Successful paste (auto-disarms after image lands)
- Modal close

### Drag-and-drop (bonus)

Dragging an image file onto any image zone uploads it directly — no arming needed. Dragover shows amber border highlight.

---

## Implementation

### State variable

```js
let matPasteTargetIdx = null; // index of armed card, or null
```

### Click handler on image zone

- Sets `matPasteTargetIdx = idx`
- Removes armed state from any previously armed zone
- Adds `armed` class to clicked zone
- Does NOT open file picker (file picker is now a separate link inside the armed state)

### Global paste listener (scoped to modal open)

```js
document.addEventListener('paste', handleModalPaste);
// Added in openMaterialOptions(), removed in closeMaterialOptions()
```

`handleModalPaste(e)`:
1. If `matModalKey` is null (modal closed): return
2. Extract image from `e.clipboardData.items` (type starting with `image/`)
3. If no image found: return (ignore)
4. Determine target: `matPasteTargetIdx ?? firstCardWithoutImage()` where `firstCardWithoutImage()` inspects `getMaterialOptions(matModalKey)` and returns the index of the first option where `!opt.imageUrl` — uses the authoritative in-memory state, not the DOM
5. Call `uploadOptionImage(key, targetIdx, file)` (existing function)
6. Disarm: `setArmedZone(null)`

### CSS changes

- `.mat-opt-img-area.armed` — green border (`rgba(94,117,88,0.5)`), green glow (`box-shadow: 0 0 0 3px rgba(94,117,88,0.12)`), green background tint
- `.mat-opt-img-area.drag-over` — amber border highlight (existing dragover state)
- Update placeholder HTML when armed: show clipboard icon + "Cmd+V to paste" + "or pick a file" link

### Drag-and-drop

Add `dragover`, `dragleave`, `drop` handlers to each `.mat-opt-img-area`:
- `dragover`: add `drag-over` class, `preventDefault()`
- `dragleave`: only remove `drag-over` if `!zone.contains(e.relatedTarget)` — prevents flicker when cursor moves over child elements inside the zone
- `drop`: extract `dataTransfer.files[0]`, call `uploadOptionImage`, remove `drag-over`

### Document click listener (disarm on outside click)

In the existing `document.addEventListener('click', ...)` block: if click target is not inside `.mat-opt-img-area` (i.e. `!e.target.closest('.mat-opt-img-area')`), call `setArmedZone(null)`. Clicks on the "or pick a file" link live inside `.mat-opt-img-area` and therefore do NOT disarm.

---

## Placeholder text update

Update the placeholder in `renderModalOptions` to hint at the new interaction:

- Default state: "Add photo" (unchanged)
- Armed state: rendered dynamically when `armed` class is present (via CSS `:after` or JS re-render)

Since the card is re-rendered on status/field changes, the armed state is managed purely via CSS class on the DOM element (not via re-render), so it survives across field edits.

---

## No changes to

- Firebase upload path (`optionImages/{key}/{idx}.jpg`) — unchanged
- `compressImage()` — reused as-is
- `uploadOptionImage()` — reused as-is, just called from new trigger points

---

## Testing (Playwright)

New tests:
- **Armed state visible after click** — click image zone, verify `.mat-opt-img-area.armed` exists
- **Armed state clears after click outside** — click zone, click modal body elsewhere, verify no `.armed` class
- **Drag-and-drop highlight** — dispatch `dragover` event on zone, verify `.drag-over` class added; dispatch `dragleave` with `relatedTarget` outside zone, verify class removed
- **Drag-and-drop no flicker** — dispatch `dragleave` with `relatedTarget` inside zone, verify `.drag-over` class remains

Paste tests (clipboard image content) are not automatable via Playwright without browser permission grants — manual verification only.

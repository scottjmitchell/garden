# Garden Site UX Improvements — Design Spec
**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Two-part improvement to the garden project site: (1) replace the in-card material options panel with a modal that doesn't shift card sizes, and (2) a targeted set of secondary UX polish items surfaced during a code audit.

---

## Part 1: Material Options Modal (confirmed design)

### Problem

When the "Options" button is clicked on a material card, a panel expands inline, growing the card's height. Because the materials grid uses `auto-fill` with row-stretching, all cards in the same row grow to match. This causes jarring layout shift across the whole grid.

### Solution: Centred Modal Dialog

Replace `toggleMaterialOptions` / `.mat-options-panel` with a centred modal. The grid is untouched.

### Modal Structure

```
┌────────────────────────────────────┐
│ [Porcelain Paving — Options]  [✕]  │  ← header: material name eyebrow, italic title
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ [Name input            ]     │  │  ← opt-card (repeats)
│  │ [Considering] [★ Fav] [✗ Rej]│  │
│  │ [URL input              ]    │  │
│  │ [Price]                      │  │
│  │ [Notes textarea         ]    │  │
│  └──────────────────────────────┘  │
│  (more option cards…)              │
├────────────────────────────────────┤
│ [+ Add option]     Saves auto…     │  ← footer
└────────────────────────────────────┘
```

### Option Card Fields

Each option card contains:

| Field | Type | Notes |
|-------|------|-------|
| Label | `<input type="text">` | Full-width, underline style |
| Status | 3-chip toggle | Considering / Favourite / Rejected — mutually exclusive |
| URL | `<input type="text">` | Full-width, bordered |
| Price | `<input type="text">` | 90px wide, sits beside URL |
| Notes | `<textarea>` | Resizes to content |

### Status Chip Behaviour

- Three chips: Considering / Favourite / Rejected
- Mutually exclusive — clicking an active chip deselects it (back to neutral)
- The new field is named `optionStatus` inside each option object (scoped to `garden-material-opts-${key}`) — this is entirely separate from the card-level `garden-material-status-${key}` field which controls the Researching / To Order / Ordered badge on the material card itself.
- Visual states:
  - **Considering** → moss green chip only (border + background on the chip); no card-level border change
  - **Favourite** → amber chip border + background; option card gets amber border highlight
  - **Rejected** → rust chip border + background; option card fades to 60% opacity, name gets strikethrough
- Replaces the existing binary `selected` boolean — data migration: `selected: true` maps to `optionStatus: 'favourite'`

### Material Card Button Update

The "Options" button on the card should reflect state at a glance:
- If no options saved → `Options` (plain)
- If options exist but none are Favourite → `Options (n)` with count
- If a Favourite is set → amber text + amber dot indicator

### Modal Behaviour

- Opens via click on the material card's Options button
- Closes via: ✕ button, Escape key, or clicking backdrop
- Auto-saves to localStorage on every field change (debounced 500ms) — same as current
- No explicit Save/Cancel buttons needed

### DOM Changes

**Remove:**
- `.mat-options-toggle` button (replaced by new card button)
- `.mat-options-panel` div
- `.mat-options-list` div
- CSS: `.mat-options-toggle`, `.mat-options-panel`, `.mat-options-list`

**Add:**
- `#mat-options-modal` — fixed overlay + centred modal element (single shared modal, populated dynamically like the task drawer). Must be appended as a direct child of `<body>` (end of body, after the task drawer elements) to avoid stacking context clipping. Use `z-index: 910` for the modal and `z-index: 909` for the backdrop, sitting just above the task drawer (`z-index: 901` / `900`).
- `#mat-options-backdrop` — backdrop element (same as above)
- CSS: all modal styles
- JS: `openMaterialOptions(key)`, `closeMaterialOptions()`, `renderModalOptions(key)`, updated save/delete/add functions

### Data Migration

Existing `selected: boolean` field → new `status: 'considering' | 'favourite' | 'rejected' | null`

```js
// Migration on first load: if saved options have `selected: true`, convert to `optionStatus: 'favourite'`
function migrateMaterialOptions(options) {
  return options.map(opt => {
    if ('selected' in opt && !('optionStatus' in opt)) {
      return { ...opt, optionStatus: opt.selected ? 'favourite' : null };
    }
    return opt;
  });
}
```

---

## Part 2: Audit — Secondary UX Improvements

These were identified during the code review. All are targeted, low-risk changes.

### 2a. Phase task list — animate expand/collapse

**Current:** `.phase-tasks` toggles `display: none` / `display: block` — instant snap.
**Fix:** Replace with `max-height` CSS transition.

```css
.phase-tasks {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.phase-card.expanded .phase-tasks {
  max-height: 2000px; /* sufficiently large */
  display: block; /* keep for JS compat */
}
```

Note: `max-height` animation with a large value causes a timing mismatch on collapse. A JS-based height approach (set `height` from `scrollHeight`, then `0`) is cleaner if fidelity matters. Either is fine here.

### 2b. Status picker — animate open/close

**Current:** `.mat-status-picker` uses `style.display = 'none'/'block'` — instant.
**Fix:** Use `opacity` + `transform` transition via a CSS class instead of inline display.

```css
.mat-status-picker {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mat-status-picker.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
```

Remove `style.display` toggling from JS; toggle `.visible` class instead.

### 2c. Mobile nav — animate open/close

**Current:** Hamburger menu snaps open via `toggleMenu()` which sets `links.style.display = isOpen ? 'none' : 'flex'` directly.
**Fix:** Remove the inline style assignment. Instead, toggle a `.open` class on `.nav-links` and handle show/hide entirely in CSS using `max-height` + `overflow: hidden` transition. The inline style assignment in `toggleMenu` will override any CSS transition, so it must be removed before the animation can take effect.

```js
function toggleMenu(btn) {
  document.querySelector('.nav-links').classList.toggle('open');
}
```

```css
@media (max-width: 768px) {
  .nav-links {
    display: flex; /* always flex, but clamped by max-height */
    flex-direction: column;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease;
  }
  .nav-links.open { max-height: 300px; }
}
```

### 2d. `prefers-reduced-motion` — pulse animation

**Current:** The `.pulse::after` animation runs unconditionally.
**Fix:**

```css
@media (prefers-reduced-motion: reduce) {
  .status-badge .pulse::after { animation: none; }
  .fade-in, .fade-in-stagger { transition: none !important; opacity: 1 !important; transform: none !important; }
}
```

### 2e. Material card — Options button count indicator

Already covered in Part 1 (button state reflects option count and favourite status).

---

## Out of Scope

- Photo journal upload functionality (no storage backend)
- Budget table editing (no changes requested)
- Task detail drawer redesign (working well as-is)

---

## Implementation Order

1. Part 1: Material Options Modal (main request)
2. 2a: Phase expand animation (highest visual impact)
3. 2d: `prefers-reduced-motion` (quick, important)
4. 2b: Status picker animation (quick polish)
5. 2c: Mobile nav animation (lowest priority)

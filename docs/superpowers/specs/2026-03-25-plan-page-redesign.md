# Plan Page Redesign — Spec

**Date:** 2026-03-25
**Branch:** feat/inline-editing-and-chevron (extends existing PR)

## Problem

Three related issues on the Plan page:

1. **Status is broken at both levels** — Phase status requires the edit modal; task status pills write to Firebase but the drawer held a stale task snapshot, so the UI never reflected the change (fixed in previous commit but the interaction model is poor regardless).
2. **Phase editing is modal-heavy** — every field change requires opening a modal, which is slow and doesn't feel inline.
3. **Phase ordering is manual** — users set a numeric position index by hand; this is confusing for non-technical users and breaks 1-based expectations.

## Goals

- Reusable `StatusChip` component used consistently at phase and task level.
- All phase fields editable inline; modal kept only for *adding* new phases.
- Drag-to-reorder phases with full touch/mobile support.
- Phase numbers auto-assigned from position (1-indexed), never set manually.
- `StatusChip` added to the `/components` gallery.

## Out of Scope

- Task reordering (tasks stay in creation order for now).
- Any changes outside the Plan page and design system.

---

## 1. `StatusChip` Component

**File:** `src/design-system/components/StatusChip.tsx`

### API

```ts
interface StatusOption {
  value:   string
  label:   string
  variant: 'success' | 'warning' | 'default'
}

interface StatusChipProps {
  value:     string | null
  options:   StatusOption[]
  onChange:  (value: string) => void
  nullable?: boolean   // adds "None" option that calls onChange(null → handled by parent)
}
```

### Behaviour

- Renders a Badge-style pill: `[label] [chevron ▾]`. Colour driven by `variant` of the matching option.
- Click opens an absolute-positioned dropdown anchored below the chip.
- Dropdown lists all options. Active option shows a `✓`.
- Click outside (document `mousedown` listener) closes the dropdown.
- If `nullable: true`, a "None" item appears at the top; selecting it calls `onChange('')` — callers map `''` to `null`.
- Keyboard: `Escape` closes; `Enter`/`Space` selects focused option (basic a11y).

### Visual (agreed in brainstorm)

Badge-style — coloured background tint + matching border + chevron. Matches the existing `Badge` component's colour tokens:

| variant   | background              | border                   | text      |
|-----------|-------------------------|--------------------------|-----------|
| `warning` | `rgba(200,146,42,.12)`  | `rgba(200,146,42,.3)`    | `#C8922A` |
| `success` | `rgba(61,82,57,.15)`    | `rgba(61,82,57,.4)`      | `#5E7558` |
| `default` | `rgba(168,155,120,.08)` | `rgba(168,155,120,.18)`  | `#8A9485` |

Dropdown: `bg-[#171a13]`, `border border-white/[.14]`, `rounded-lg`, `shadow-xl`. Each row `px-3 py-2 text-sm`. Active row has variant-coloured text + `✓`.

### Status option sets (defined alongside their consumers)

**Phase statuses** (in `PhaseCard.tsx`):
```ts
const PHASE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'upcoming', label: 'Upcoming',    variant: 'default'  },
  { value: 'current',  label: 'In progress', variant: 'warning'  },
  { value: 'done',     label: 'Done',        variant: 'success'  },
]
```

**Task statuses** (in `TaskDrawer.tsx`):
```ts
const TASK_STATUS_OPTIONS: StatusOption[] = [
  { value: 'not-started', label: 'Not started', variant: 'default' },
  { value: 'in-progress', label: 'In progress', variant: 'warning' },
  { value: 'done',        label: 'Done',        variant: 'success' },
]
```

### Components gallery

Add a `StatusChip` section to the existing `/components` page showing all three variants in both collapsed and open states, with a `data-testid="status-chip-example"` for the Playwright test.

---

## 2. `PhaseCard` Redesign

### Header layout (left → right)

```
[⠿ drag handle]  [① num]  [Title — click to edit]  [date — click to edit]  ···  [StatusChip]  [✕]  [chevron]
```

### Drag handle

- Six-dot `⠿` icon, far left.
- `color: var(--text-dim)` at rest; brightens to `var(--text-muted)` on hover.
- This is the `<DragHandle>` attributes element from `@dnd-kit/sortable` (`...listeners`, `...attributes`).

### Phase number

- Read-only. Receives `num: number` prop from `PlanPage` (`index + 1`).
- Rendered inside the existing amber circle. No longer stored in or read from Firebase.

### Title inline edit

- Single click (not double-click). The entire header no longer toggles on click — collapse is chevron-only — so single click is unambiguous. Drag gestures are handled exclusively by the drag handle element and will not accidentally trigger the title input.
- Shows `<input>` in place of `<p>`. Enter or blur saves via `onRenamePhase`.
- Escape cancels.

### Date inline edit

- Same pattern: click the date text → `<input>`, Enter/blur saves via `onUpdatePhaseDate` prop.
- Placeholder: `"Add date…"` when empty.

### Status

- `<StatusChip value={phase.status} options={PHASE_STATUS_OPTIONS} onChange={status => onUpdatePhaseStatus(phaseId, status)} />`
- Replaces the existing non-interactive `<Badge>`.

### Collapse toggle

- **Only the chevron button** toggles open/closed. The rest of the header row is now interactive for editing.
- Chevron rotates 180° when expanded (already implemented).

### Edit modal button (✎) removed

- The pencil button is removed from PhaseCard entirely.
- `onEdit` prop removed.
- `PhaseModal` is no longer opened for editing.

### Props delta

```ts
// Removed
onEdit: () => void

// Added
num:                  number                                        // position (1-indexed), read-only display
onUpdatePhaseStatus:  (phaseId: string, status: PhaseStatus) => void
onUpdatePhaseDate:    (phaseId: string, date: string) => void
```

`onRenamePhase` already exists from the previous PR.

---

## 3. `PlanPage` — Drag Reorder

### Dependency

```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Wiring

```tsx
<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext items={phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
    {phases.map((phase, i) => (
      <PhaseCard key={phase.id} num={i + 1} ... />
    ))}
  </SortableContext>
  <DragOverlay>
    {activeId ? <PhaseCardGhost phase={phases.find(p => p.id === activeId)!} /> : null}
  </DragOverlay>
</DndContext>
```

`PhaseCardGhost` is a lightweight dimmed version of the card (no interactive elements, `opacity-50`) used only in the overlay. Defined as an inline component inside `PlanPage.tsx` — no separate file needed.

### `handleDragEnd`

```ts
function handleDragEnd({ active, over }) {
  if (!over || active.id === over.id) return
  const oldIndex = phases.findIndex(p => p.id === active.id)
  const newIndex = phases.findIndex(p => p.id === over.id)
  const reordered = arrayMove(phases, oldIndex, newIndex)
  reorderPhases(reordered.map(p => p.id))
}
```

### `reorderPhases` (new hook function)

```ts
function reorderPhases(orderedIds: string[]) {
  const updates: Record<string, number> = {}
  orderedIds.forEach((id, i) => {
    updates[`${DB_ROOT}/phases/${id}/order`] = i * 1000
  })
  update(ref(db), updates)  // root ref for multi-path update
}
```

### New / updated hook functions

```ts
// New — targeted updates replace the old full-object updatePhase where possible
function updatePhaseStatus(phaseId: string, status: PhaseStatus) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), { status })
}

function updatePhaseDate(phaseId: string, date: string) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), { date })
}
```

**`updatePhase` signature change:** The existing `updatePhase(phaseId, { num, title, date, status })` must drop `num` from both the TypeScript signature and the Firebase write, since `num` is no longer a stored field. Updated signature:

```ts
function updatePhase(phaseId: string, data: { title: string; date: string; status: PhaseStatus }) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), data)
}
```

`updatePhase` is still used by `PhaseModal` (add-only path) to write `title`, `date`, and `status` on creation. All other field updates go through the targeted functions above.

All new/updated functions added to the `usePhases` return object.

---

## 4. `TaskDrawer` — StatusChip

Replace the three custom pill buttons with:

```tsx
<StatusChip
  value={task.status ?? null}
  options={TASK_STATUS_OPTIONS}
  onChange={val => onUpdateStatus(phaseId, task.id, val || null)}
  nullable
/>
```

The `nullable` prop adds a "None" row; selecting it passes `''` → caller converts to `null`.

---

## 5. `PhaseModal` — Add-only

Remove the `Num` input field (auto-assigned now). Keep `Title`, `Date`, `Status` fields for the add flow — the user sets an initial state when creating a phase, then edits inline after.

The edit path in `PlanPage` (`onEdit={() => setPhaseModal({ open: true, phase })}`) is removed.

---

## 6. Data Model

### `num` field

- Not written on new phases.
- Existing `num` values in Firebase are ignored on read (`toPhases` already maps by array position after sort).
- No migration needed.

### `order` field

- Already exists, already drives sort in `toPhases`.
- After drag: rewritten as `index * 1000` for all phases.
- Sparse integers give room for future insertion without full rewrite (though full rewrite on each drag is acceptable for a short list).

### `Phase` TypeScript type

Remove `num` field from the `Phase` interface in `src/types/index.ts`.

---

## 7. Components Gallery (`/components` page)

Add to the existing gallery:

```tsx
<section data-testid="status-chip-example">
  <h3>StatusChip</h3>
  {/* Phase statuses */}
  <StatusChip value="current"     options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
  <StatusChip value="done"        options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
  <StatusChip value="upcoming"    options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
  {/* Task statuses */}
  <StatusChip value="in-progress" options={TASK_STATUS_OPTIONS}  onChange={() => {}} />
</section>
```

---

## 8. Tests

### New Playwright tests

- `plan: StatusChip changes phase status inline` — click chip, pick option, verify badge updates
- `plan: StatusChip changes task status in drawer` — open drawer, click chip, pick option
- `plan: drag reorders phases` — drag second phase above first, verify new order. Use Playwright's `page.mouse` sequence (`move` → `down` → `move` → `up`) rather than `dragTo`, as `@dnd-kit` relies on pointer events that `dragTo` does not reliably trigger.
- `components: StatusChip renders all variants` — checks `data-testid="status-chip-example"` visible

### Updated tests

- `plan: edit phase updates title in list` — update to use inline title click instead of modal
- Remove test dependency on phase edit modal button (`phase-edit-btn`) where it relates to editing (keep delete test)

---

## Implementation Order

1. `types/index.ts` — remove `num` from `Phase` **first**, so all downstream changes compile cleanly
2. `hooks.ts` — update `updatePhase` signature (drop `num`), add `reorderPhases`, `updatePhaseStatus`, `updatePhaseDate`. New phase `order` value: `(existingPhases.length) * 1000` — appends at end.
3. `StatusChip` component + gallery entry + gallery test
4. `PhaseCard` — inline date, StatusChip, drag handle wiring, remove `onEdit` prop, receive `num: number` prop
5. `PlanPage` — install `@dnd-kit`, `handleDragEnd`, pass new props, remove edit modal path
6. `TaskDrawer` — swap pills for StatusChip
7. `PhaseModal` — remove `Num` field
8. Playwright tests — new + updated

> **Note on step 1:** removing `num` from `Phase` will immediately break all existing references (`PhaseCard`, `PhaseModal`, `hooks.ts`, `PlanPage`). Step 1 should land together with steps 2–7 in a single commit, not incrementally.

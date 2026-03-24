# Garden Site — Feature Parity Design Spec
**Date:** 2026-03-24
**Status:** Draft
**Scope:** Full feature parity with original static HTML site, plus collapsible sidebar navigation

---

## 1. Navigation — Collapsible Sidebar

Replace the current horizontal top nav with a vertical collapsible sidebar.

**Expanded state (180px wide):**
- Logo text "Mitchell Garden" (Cormorant Garamond, amber)
- Nav links: icon + label, vertical stack
- Collapse button `‹` at top right of sidebar
- Sign-out at the bottom

**Collapsed state (52px wide):**
- Logo icon only
- Icon-only nav links, centred
- Collapse button becomes `›`
- Sign-out icon only

**Nav items (in order):** Overview `⊞`, Plan `✓`, Materials `◈`, Budget `£`, Journal `▣`, Map `⬡`

**Active state:** amber left border, amber text, amber-tinted background.

**Implementation:** `AppShell.tsx` holds sidebar + main area. Sidebar collapse state in `useState`, toggled by button. No routing changes needed — only layout.

**Persistence:** Sidebar collapse state is **not** persisted across page loads — it resets to expanded on refresh. This is intentional; `localStorage` persistence is out of scope for this spec.

---

## 2. Custom Checkboxes (Plan page)

Replace native `<input type="checkbox">` with custom-styled elements.

- **Unchecked:** 16×16px box, 1.5px border, moss colour (`#3D5239`), transparent fill, 2px border-radius
- **Checked:** moss fill (`#3D5239`), SVG checkmark polyline in `#EDE8DC`
- **Checked task text:** strikethrough with amber-tinted decoration colour, text dimmed to `#5A6355`
- Stored in Firebase as boolean on the task object

---

## 3. Phase CRUD (Plan page)

### 3.1 Add phase
- `＋ Add phase` button below all phase cards
- Opens a **modal** with fields: Title, Date (month/year, stored as `"April 2026"` display string), Status (Upcoming / Current / Complete)
- Save creates a new phase in Firebase at `phases/{id}`

### 3.2 Edit phase
- `✎` icon button on each phase card header
- Opens same modal pre-populated with current values
- Save writes back to Firebase

### 3.3 Delete phase
- `✕` icon button on each phase card header
- Opens **confirmation modal**: "Delete [phase name]? This will permanently remove the phase and all its tasks."
- Confirm deletes phase and all child tasks from Firebase

### 3.4 Phase status badge
Values: `Upcoming` (moss/green), `Current` (amber), `Complete` (dimmed green). Shown as non-interactive badge in card header.

---

## 4. Phase Notes (Plan page)

Each phase card has a notes section below its task list.

- Amber dot `●` (6px) in the phase title row when the note field is non-empty
- Notes render as a `<textarea>` directly in the card, below a `<hr>` divider
- Placeholder: "Add notes…"
- **Auto-save:** debounced write fires 800ms after last `input` event. On `blur`, the debounce timer is cancelled and a write fires immediately (prevents double-write if blur follows a recent keystroke).
- No explicit save button needed

---

## 5. Task CRUD (Plan page)

### 5.1 Add task
- `＋ Add task` link at the bottom of each phase's task list
- Clicking renders an inline text input in place of the link
- Enter saves, Escape cancels

### 5.2 Edit task text
- **Double-click** on task text opens it for inline editing (controlled input)
- Enter/blur saves, Escape cancels
- This disambiguates from single-click which opens the detail drawer (see 5.4)

### 5.3 Delete task
- Each task row has a `✕` icon (visible on hover)
- Clicking `✕` opens a confirmation modal: "Delete this task?"

### 5.4 Task detail drawer
**Single-click** on task text (not the checkbox) opens a slide-in drawer from the right.

**Drawer contents:**
- Task title (editable, double-click to edit inline)
- **Status pills** (single-select): Not started / In progress / Done — clicking an already-active pill deselects it (returns to no status)
- **Notes textarea** — saves to Firebase on blur (debounce timer cancelled on blur to avoid double-write)
- **Options list** — per-task supplier/product options. Each option has: name, price (optional), URL (optional), notes (optional). Actions: **Select** (single-select — marks this option as the chosen one, clears others) and **Delete** (removes immediately, no confirmation needed for task options). Selected option shown with moss/amber highlight.
- Close button `✕` at top right; clicking outside also closes

---

## 6. Materials CRUD

### 6.1 Material card
Each card shows: name (display serif), status dropdown, spec text, cost range, Options button, edit/delete buttons.

### 6.2 Status dropdown
`<select>` element (not click-to-cycle). Options: Researching, To order, Ordered, Delivered.
- **Researching / To order:** amber styling
- **Ordered / Delivered:** moss/green styling
- Saves to Firebase on `change`

### 6.3 Add material
- `＋ Add material` button below cards
- Opens **modal** with fields: Name, Spec (description), Cost low, Cost high, Status (`<select>` with options: Researching / To order / Ordered / Delivered mapping to stored values `researching / to-order / ordered / delivered`), Accent colour picker (amber or moss presets)

### 6.4 Edit material
- `✎` on card opens same modal pre-populated

### 6.5 Delete material
- `✕` on card opens confirmation modal: "Delete [name]? This will permanently remove the material and all its options."

### 6.6 Material options modal

Opened via **Options** button on each material card.

**Modal header:**
- Title: "[Material name] — Options"
- Subtitle: option count + material spec
- Compare mode toggle button `⇄ Compare`
- Close `✕`

**List mode (default):**
- Options stacked vertically
- Each option: thumbnail image on left (140px wide), details on right
- Details: name, status chip (single-select: Shortlisted / Ordered / Rejected), supplier, lead time, price, URL, cost bar vs budget range, notes
- `✎` and `✕` per option. The `✎` re-opens the same inline mini-form (section 6.6 "Add option") pre-populated with existing values — no separate edit form needed.

**Compare mode:**
- Toggled by `⇄ Compare` button (amber highlight when active)
- Options displayed as fixed-width cards (260px) in a horizontal scroll row
- Each card: image on top (4:3 aspect), details below
- Same fields as list mode, compacted

**Image handling:**
- Upload from device (`<input type="file" accept="image/*">`)
- Paste from clipboard (`paste` event listener on the image zone / document while modal is open)
- On receipt: compress to max 800px wide, convert to JPEG at 0.8 quality using Canvas API
- Post-compression size check: if compressed data URL ≤ 100KB, store directly in Firebase Realtime Database as `imageUrl` string. If > 100KB, upload to Firebase Storage at path `options/{materialId}/{optionId}.jpg` and store the download URL instead. This routing is automatic in `storage.ts` — the caller always receives a URL string.
- Placeholder shown when no image: upload icon + "Add photo" text

**Status chip:** single-select radio behaviour — clicking an active chip deselects it (returns to no status); clicking an inactive chip selects it and deselects any other.

**Add option (inline mini-form):**
- `＋ Add option` card/button at end of list/compare row
- Clicking expands an inline form within the modal (no second modal)
- Fields: Name (required), Supplier, Price, Lead time, URL, Notes
- Image upload zone included
- Save / Cancel buttons

**Cost bar:**
- Bar width = `(price / high_estimate) * 100%`, capped at 100%
- Colour: moss green for the option with the lowest price among options that have a price; amber for all others. This comparison is computed in `OptionsModal` and passed as an `isBest: boolean` prop to each `OptionCard`. Options without a price have no bar rendered.
- Label shows percentage of high estimate
- Only shown when the material has a high estimate and the option has a price

---

## 7. Budget CRUD

### 7.1 Table structure
Columns: Item, Low, High, Actual (inline input), Variance, Actions (✎ ✕)

### 7.2 Variance calculation
- Per-row: `actual - midpoint` where `midpoint = (low + high) / 2`
- Under budget (negative variance): moss green pill, e.g. `–£57`
- Over budget (positive variance): dark red pill (`#9E4E24` background), e.g. `+£57`
- Total row variance: sum of variance for rows that have an actual value
- Rows without an actual: blank variance cell

### 7.3 Add budget item
- `＋ Add budget item` button below table
- Opens **modal**: Item name, Low estimate, High estimate

### 7.4 Edit budget item
- `✎` per row opens same modal pre-populated

### 7.5 Delete budget item
- `✕` per row opens confirmation modal: "Delete [name]? This cannot be undone."

### 7.6 Actual value
- Inline `<input>` in Actual column, transparent border
- Focus reveals bordered input
- Saves to Firebase on `blur`

---

## 8. Map Zone Tooltips

### Problem
Tooltips are currently broken — positioned incorrectly or not appearing on hover.

### Fix
- Each zone is an SVG `<path>` or `<polygon>` with a `data-zone` attribute
- On `mouseenter`: calculate tooltip position from `getBoundingClientRect()` of the hovered element relative to the map container
- Show tooltip absolutely positioned above the zone centroid
- On `mouseleave`: hide tooltip
- Tooltip content: zone name + brief description (from a static config object keyed by zone ID)
- Use a React portal or `position: absolute` within the map container (not `position: fixed`) to avoid scroll issues

---

## 9. Confirmation Modal (shared component)

Single reusable `<ConfirmModal>` component used for all destructive actions.

Props: `title`, `body`, `confirmLabel` (default "Delete"), `onConfirm`, `onCancel`

- Confirm button: dark red (`#9E4E24`), bold
- Cancel button: ghost style
- Clicking backdrop closes (same as cancel)
- Used by: phase delete, task delete, material delete, budget item delete, material option delete
- **Not** used by: task option delete (immediate, no confirmation — task options are lightweight and easily re-added)

---

## 10. Data Model

No changes to the existing TypeScript types in `src/types/index.ts` except additions:

```ts
interface Task {
  id: string
  text: string
  done: boolean
  status?: 'not-started' | 'in-progress' | 'done'  // drawer status pills
  notes?: string
  options?: Record<string, TaskOption>  // Firebase RTDB stores as keyed object, not array
}

interface TaskOption {
  id: string
  name: string
  price?: number
  url?: string
  notes?: string
  selected?: boolean  // single-select — at most one option per task has selected: true
}

interface MaterialOption {
  id: string
  name: string
  supplier?: string
  leadTime?: string
  price?: number
  url?: string
  notes?: string
  imageUrl?: string  // Firebase Storage download URL, or data URL if ≤100KB post-compression
  status?: 'shortlisted' | 'ordered' | 'rejected' | null  // single-select; null = no status
}

interface Material {
  // existing fields unchanged...
  status: 'researching' | 'to-order' | 'ordered' | 'delivered'
  options?: Record<string, MaterialOption>  // Firebase RTDB keyed object
}
```

Hooks in `db.ts` convert `Record<string, X>` to `X[]` (with `id` injected from key) before returning to components, consistent with existing `usePhases` pattern.

---

## 11. Firebase Write Patterns

All writes follow the existing pattern in `src/lib/firebase/db.ts`:

| Action | Path |
|--------|------|
| Add phase | `phases/{newPhaseId}` (full object write) |
| Edit phase | `phases/{phaseId}` (full object write) |
| Delete phase | `phases/{phaseId}` set to null (also removes child tasks) |
| Add task | `phases/{phaseId}/tasks/{newTaskId}` (full object write) |
| Edit task text | `phases/{phaseId}/tasks/{taskId}/text` |
| Delete task | `phases/{phaseId}/tasks/{taskId}` set to null |
| Toggle task done | `phases/{phaseId}/tasks/{taskId}/done` |
| Set task status (drawer) | `phases/{phaseId}/tasks/{taskId}/status` |
| Update phase notes | `phases/{phaseId}/notes` |
| Save task drawer notes | `phases/{phaseId}/tasks/{taskId}/notes` |
| Add task option | `phases/{phaseId}/tasks/{taskId}/options/{newOptionId}` |
| Select task option | Firebase multi-path `update()` — write `true` to `options/{optionId}/selected`, write `false` to all sibling option `selected` fields atomically |
| Delete task option | `phases/{phaseId}/tasks/{taskId}/options/{optionId}` set to null |
| Add material | `materials/{newMaterialId}` (full object write) |
| Edit material | `materials/{materialId}` (full object write) |
| Delete material | `materials/{materialId}` set to null |
| Set material status | `materials/{materialId}/status` |
| Add material option | `materials/{materialId}/options/{newOptionId}` (full object write) |
| Edit material option | `materials/{materialId}/options/{optionId}` (full object write) |
| Delete material option | `materials/{materialId}/options/{optionId}` set to null |
| Set option status | `materials/{materialId}/options/{optionId}/status` |
| Set option image URL | `materials/{materialId}/options/{optionId}/imageUrl` |
| Add budget item | `budget/{newItemId}` (full object write) |
| Edit budget item | `budget/{itemId}` (full object write) |
| Delete budget item | `budget/{itemId}` set to null |
| Save budget actual | `budget/{itemId}/actual` |
| Upload option image | Firebase Storage: `options/{materialId}/{optionId}.jpg` |

---

## 12. Component Breakdown

New components to create:

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppShell` | `app/layout/AppShell.tsx` | Sidebar + main layout wrapper |
| `Sidebar` | `app/layout/Sidebar.tsx` | Collapsible nav |
| `ConfirmModal` | `design-system/components/ConfirmModal.tsx` | Reusable destructive confirm |
| `PhaseCard` | `features/plan/PhaseCard.tsx` | Phase with tasks + notes |
| `TaskRow` | `features/plan/TaskRow.tsx` | Individual task with checkbox |
| `TaskDrawer` | `features/plan/TaskDrawer.tsx` | Slide-in task detail panel |
| `PhaseModal` | `features/plan/PhaseModal.tsx` | Add/edit phase |
| `MaterialCard` | `features/materials/MaterialCard.tsx` | Material with status + options btn |
| `MaterialModal` | `features/materials/MaterialModal.tsx` | Add/edit material |
| `OptionsModal` | `features/materials/OptionsModal.tsx` | Material options + compare mode |
| `OptionCard` | `features/materials/OptionCard.tsx` | Single option in list or compare |
| `AddOptionForm` | `features/materials/AddOptionForm.tsx` | Inline add-option mini-form |
| `BudgetTable` | `features/budget/BudgetTable.tsx` | Budget table with inline actuals |
| `BudgetItemModal` | `features/budget/BudgetItemModal.tsx` | Add/edit budget item |
| `MapZone` (refactor) | `features/map/MapPage.tsx` | Fix tooltip positioning in existing map; no new component required unless current structure warrants extraction |

---

## 13. Testing Strategy

All features implemented test-first using Playwright (`tests/page.spec.ts`).

Key test scenarios:

**Sidebar**
- Sidebar collapses to icon-only on button click; expands again; resets to expanded on reload
- Active nav link shows amber left border and text
- Navigation works in collapsed state (icon-only links)

**Plan — checkboxes & tasks**
- Clicking checkbox marks task done (strikethrough text, moss fill); persists on reload
- Single-click on task text opens detail drawer
- Double-click on task text enters inline edit mode; Enter saves, Escape cancels
- `＋ Add task` shows inline input; Enter saves new task; appears in list
- Task row `✕` (hover) shows confirmation modal; confirming removes the task

**Plan — phases**
- Adding a phase via modal appears in the plan list
- Editing a phase via `✎` modal updates the title/date
- Deleting a phase requires confirmation and removes it with all its tasks
- Phase notes textarea: type text, click away — value persists on reload
- Amber dot appears when phase has notes; absent when notes cleared

**Plan — task drawer**
- Task drawer slides in on single-click; closes on `✕` and on outside click
- Status pill click changes status (single-select); second click clears it
- Drawer notes save on blur; persists on reload
- Add task option via inline form; appears in options list
- Select a task option highlights it; selecting another deselects first
- Delete task option removes it from list

**Materials**
- Add material via modal; appears as card
- Status dropdown change persists on reload
- Edit material via `✎`; name/spec updates in card
- Delete material with confirmation removes card
- Options button opens options modal
- Add option via inline mini-form; appears in list
- Status chip single-select: clicking active chip deselects; clicking another switches
- Compare toggle switches to horizontal card layout
- Upload image: appears in option card image area (E2E test uses a small test image ≤100KB so it takes the data URL path; the >100KB Firebase Storage branch is unit-tested in `storage.ts`)

**Budget**
- Add budget item via modal; appears in table
- Edit item via `✎`; name/values update
- Delete item with confirmation removes row
- Enter actual in input; blur saves; variance pill appears with correct value
- Total row variance = sum of all rows with actuals
- Over-budget row shows dark red pill; under-budget shows moss green

**Map**
- Hovering a zone shows tooltip with zone name
- Moving mouse away hides tooltip
- Sidebar collapse does not break tooltip positioning

---

## 14. Out of Scope (this spec)

- Styling/visual design changes (deferred — user request)
- Journal / photo upload page (no changes)
- Authentication changes
- Mobile layout (no changes beyond existing)

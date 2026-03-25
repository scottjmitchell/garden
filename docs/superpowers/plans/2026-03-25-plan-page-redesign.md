# Plan Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `StatusChip` dropdown component, make all phase fields inline-editable, replace the edit modal with drag-to-reorder using `@dnd-kit`, and auto-number phases from position.

**Architecture:** `StatusChip` lives in `design-system/` and is consumed by `PhaseCard` and `TaskDrawer`. Drag-to-reorder is handled by `@dnd-kit/sortable` in `PlanPage`, which writes updated `order` values to Firebase on drop. The `num` field is removed from Firebase and the `Phase` type; position numbers are derived from array index at render time.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Firebase Realtime Database, `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`, Playwright (tests run against production URL by default — `npm test`).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/types/index.ts` | Remove `num` from `Phase` interface |
| Create | `src/design-system/components/StatusChip/StatusChip.tsx` | Dropdown status selector |
| Modify | `src/design-system/index.ts` | Export `StatusChip` |
| Modify | `src/lib/firebase/hooks.ts` | Add `reorderPhases`, `updatePhaseStatus`, `updatePhaseDate`; update `updatePhase` signature; set `order` on `addPhase` |
| Modify | `src/features/plan/PhaseCard.tsx` | Inline date edit, StatusChip, drag handle, remove edit button, receive `num: number` prop |
| Modify | `src/features/plan/PlanPage.tsx` | `@dnd-kit` wiring, `handleDragEnd`, pass new props, remove edit modal path |
| Modify | `src/features/plan/TaskDrawer.tsx` | Swap status pills for `StatusChip` |
| Modify | `src/features/plan/PhaseModal.tsx` | Remove `Num` field |
| Modify | `src/features/components/ComponentsPage.tsx` | Add `StatusChip` gallery section |
| Modify | `tests/page.spec.ts` | New tests + update existing |

---

## Task 1: Remove `num` from `Phase` type and fix all references

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/firebase/hooks.ts`
- Modify: `src/features/plan/PhaseCard.tsx`
- Modify: `src/features/plan/PhaseModal.tsx`
- Modify: `src/features/plan/PlanPage.tsx`

This task has no Playwright test (it's a type refactor). Verify via `npm run build`.

- [ ] **Step 1: Remove `num` from the `Phase` interface**

In `src/types/index.ts`, change:
```ts
export interface Phase {
  id:     string
  num:    string   // ← remove this line
  title:  string
  date:   string
  status: PhaseStatus
  tasks:  Task[]
  notes?: string
}
```

- [ ] **Step 2: Update `hooks.ts` — remove `num` from `updatePhase` and `addPhase`**

In `src/lib/firebase/hooks.ts`:

Change `updatePhase` signature:
```ts
// Before
function updatePhase(phaseId: string, data: { num: string; title: string; date: string; status: PhaseStatus }) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), data)
}

// After
function updatePhase(phaseId: string, data: { title: string; date: string; status: PhaseStatus }) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), data)
}
```

Change `addPhase` — remove `num` from the stored object (keep `order: Date.now()`):
```ts
// Before
function addPhase(data: { num: string; title: string; date: string; status: PhaseStatus }) {
  const newRef = push(ref(db, `${DB_ROOT}/phases`))
  set(newRef, { ...data, tasks: {}, order: Date.now() })
}

// After
function addPhase(data: { title: string; date: string; status: PhaseStatus }) {
  const newRef = push(ref(db, `${DB_ROOT}/phases`))
  set(newRef, { ...data, tasks: {}, order: Date.now() })
}
```

Also remove `num: p.num` from `toPhases`:
```ts
// In toPhases, the mapped object — remove num field:
.map(([id, p]) => ({
  id,
  // num: p.num,   ← delete this line
  title:  p.title,
  ...
```

- [ ] **Step 3: Update `PhaseCard.tsx` — replace `phase.num` with a `num: number` prop**

In `src/features/plan/PhaseCard.tsx`:

Add `num: number` to `PhaseCardProps` and remove any reference to `phase.num`:
```ts
interface PhaseCardProps {
  phase:            Phase
  num:              number      // ← add
  onToggle:         ...
  // ... rest unchanged
}
```

Replace the display:
```tsx
// Before
<span ...>{phase.num}</span>

// After
<span ...>{num}</span>
```

- [ ] **Step 4: Update `PhaseModal.tsx` — remove the Num field**

Remove the entire `Num` `<div>` block (the `col-span-1` grid cell with `<input aria-label="Num" ...>`).

Change the `grid-cols-4` to `grid-cols-1` (or just remove the grid entirely since only Title remains in that row — keep Date and Status in their own rows).

Remove `num` from `useState`, from the `handleSave` call, from props, and from the `onSave` signature:
```ts
// PhaseModalProps.onSave — before
onSave: (data: { num: string; title: string; date: string; status: PhaseStatus }) => void

// After
onSave: (data: { title: string; date: string; status: PhaseStatus }) => void
```

- [ ] **Step 5: Update `PlanPage.tsx` — pass `num` prop, fix `onSave`**

Pass `num={i + 1}` to each `PhaseCard` in the map:
```tsx
{phases.map((phase, i) => (
  <PhaseCard
    key={phase.id}
    phase={phase}
    num={i + 1}    // ← add
    ...
  />
))}
```

Fix `onRenamePhase` — it currently passes `num: phase.num` which no longer exists:
```tsx
// Before
onRenamePhase={(phaseId, title) => updatePhase(phaseId, { num: phase.num, title, date: phase.date, status: phase.status })}

// After
onRenamePhase={(phaseId, title) => updatePhase(phaseId, { title, date: phase.date, status: phase.status })}
```

Fix the `PhaseModal onSave`:
```tsx
// Before
onSave={data => phaseModal.phase ? updatePhase(phaseModal.phase.id, data) : addPhase(data)}

// After — same line works because types now match
onSave={data => phaseModal.phase ? updatePhase(phaseModal.phase.id, data) : addPhase(data)}
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/lib/firebase/hooks.ts src/features/plan/PhaseCard.tsx src/features/plan/PhaseModal.tsx src/features/plan/PlanPage.tsx
git commit -m "refactor: remove num field from Phase type, derive from array position"
```

---

## Task 2: `StatusChip` component

**Files:**
- Create: `src/design-system/components/StatusChip/StatusChip.tsx`
- Modify: `src/design-system/index.ts`
- Modify: `src/features/components/ComponentsPage.tsx`
- Modify: `tests/page.spec.ts`

- [ ] **Step 1: Write the failing test**

Add to `tests/page.spec.ts`:
```ts
test('components: StatusChip renders all variants', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('status-chip-example')).toBeVisible()
  await expect(page.getByTestId('status-chip-warning')).toBeVisible()
  await expect(page.getByTestId('status-chip-success')).toBeVisible()
  await expect(page.getByTestId('status-chip-default')).toBeVisible()
})
```

- [ ] **Step 2: Run test to confirm RED**

```bash
npm run test:local
# grep for: components: StatusChip
```

Expected: fails — `status-chip-example` not found.

- [ ] **Step 3: Create `StatusChip.tsx`**

Create `src/design-system/components/StatusChip/StatusChip.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react'

export interface StatusOption {
  value:   string
  label:   string
  variant: 'success' | 'warning' | 'default'
}

interface StatusChipProps {
  value:     string | null
  options:   StatusOption[]
  onChange:  (value: string) => void
  nullable?: boolean
  'data-testid'?: string
}

const variantStyles: Record<string, string> = {
  warning: 'bg-amber/[.12] border-amber/30 text-amber',
  success: 'bg-moss/[.15] border-moss/40 text-moss-light',
  default: 'bg-white/[.05] border-white/[.13] text-garden-text/60',
}

export function StatusChip({ value, options, onChange, nullable, 'data-testid': testId }: StatusChipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = options.find(o => o.value === value)
  const variant = active?.variant ?? 'default'

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block" data-testid={testId} onKeyDown={handleKey}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${variantStyles[variant]}`}
      >
        {active?.label ?? 'Set status'}
        <svg className={`h-2.5 w-2.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 8 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points=".5,.5 4,4.5 7.5,.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[130px] overflow-hidden rounded-lg border border-white/[.14] bg-[#171a13] shadow-xl">
          {nullable && (
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-garden-text/40 hover:bg-white/5"
            >
              None
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                opt.value === value
                  ? variantStyles[opt.variant].split(' ').filter(c => c.startsWith('text-')).join(' ')
                  : 'text-garden-text/60'
              }`}
            >
              {opt.label}
              {opt.value === value && <span className="text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Export from design system**

In `src/design-system/index.ts`, add:
```ts
export { StatusChip } from './components/StatusChip/StatusChip'
export type { StatusOption } from './components/StatusChip/StatusChip'
```

- [ ] **Step 5: Add to ComponentsPage gallery**

In `src/features/components/ComponentsPage.tsx`, add the import and a new section. Add `StatusChip` to the import from `../../design-system`. Define the option arrays locally:

```tsx
const PHASE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'upcoming', label: 'Upcoming',    variant: 'default'  },
  { value: 'current',  label: 'In progress', variant: 'warning'  },
  { value: 'done',     label: 'Done',        variant: 'success'  },
]

// In the JSX, add after the Badge section:
<section data-testid="status-chip-example" className="space-y-3">
  <h2 className="text-xs uppercase tracking-widest text-garden-text/40">StatusChip</h2>
  <div className="flex flex-wrap gap-3">
    <StatusChip data-testid="status-chip-warning" value="current"  options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
    <StatusChip data-testid="status-chip-success" value="done"     options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
    <StatusChip data-testid="status-chip-default" value="upcoming" options={PHASE_STATUS_OPTIONS} onChange={() => {}} />
  </div>
</section>
```

- [ ] **Step 6: Run test to confirm GREEN**

```bash
npm run test:local
# grep for: components: StatusChip
```

Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/components/StatusChip/StatusChip.tsx src/design-system/index.ts src/features/components/ComponentsPage.tsx tests/page.spec.ts
git commit -m "feat: add StatusChip component to design system and gallery"
```

---

## Task 3: Wire `StatusChip` into `PhaseCard` + inline date editing + remove edit button

**Files:**
- Modify: `src/features/plan/PhaseCard.tsx`
- Modify: `src/features/plan/PlanPage.tsx`
- Modify: `src/lib/firebase/hooks.ts`
- Modify: `tests/page.spec.ts`

- [ ] **Step 1: Write the failing tests**

Add to `tests/page.spec.ts`:
```ts
test('plan: StatusChip changes phase status inline', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-status-chip"]')
  await page.getByTestId('phase-status-chip').first().click()
  await page.getByRole('button', { name: 'Done' }).first().click()
  await expect(page.getByTestId('phase-status-chip').first()).toContainText('Done')
})

test('plan: phase date editable inline', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-date"]')
  await page.getByTestId('phase-date').first().click()
  await expect(page.getByTestId('phase-date-input').first()).toBeVisible()
  await page.getByTestId('phase-date-input').first().fill('May 2026')
  await page.getByTestId('phase-date-input').first().press('Enter')
  await expect(page.getByTestId('phase-date').first()).toContainText('May 2026')
})
```

- [ ] **Step 2: Run tests to confirm RED**

```bash
npm run test:local
# grep for: phase status|phase date
```

Expected: both fail.

- [ ] **Step 3: Add `updatePhaseStatus` and `updatePhaseDate` to `hooks.ts`**

In `src/lib/firebase/hooks.ts`, add after `updatePhase`:
```ts
function updatePhaseStatus(phaseId: string, status: PhaseStatus) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), { status })
}

function updatePhaseDate(phaseId: string, date: string) {
  update(ref(db, `${DB_ROOT}/phases/${phaseId}`), { date })
}
```

Add both to the return object:
```ts
return {
  phases, loading,
  toggleTask, updatePhaseNotes,
  addPhase, updatePhase, updatePhaseStatus, updatePhaseDate, deletePhase,
  ...
}
```

- [ ] **Step 4: Update `PhaseCard` props and implementation**

In `src/features/plan/PhaseCard.tsx`:

**Add to imports:**
```tsx
import { StatusChip } from '../../design-system'
import type { StatusOption } from '../../design-system'
```

**Add phase status options constant** (top of file, outside component):
```ts
const PHASE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'upcoming', label: 'Upcoming',    variant: 'default' },
  { value: 'current',  label: 'In progress', variant: 'warning' },
  { value: 'done',     label: 'Done',        variant: 'success' },
]
```

**Update `PhaseCardProps`** — add new props, remove `onEdit`:
```ts
interface PhaseCardProps {
  phase:              Phase
  num:                number
  onToggle:           (phaseId: string, taskId: string, done: boolean) => void
  onDelete:           (phaseId: string) => void
  updatePhaseNotes:   (phaseId: string, notes: string) => void
  onTaskClick:        (task: Task) => void
  onAddTask:          (phaseId: string, text: string) => void
  onDeleteTask:       (phaseId: string, taskId: string) => void
  onRenamePhase:      (phaseId: string, title: string) => void
  onRenameTask:       (phaseId: string, taskId: string, text: string) => void
  onUpdatePhaseStatus:(phaseId: string, status: PhaseStatus) => void
  onUpdatePhaseDate:  (phaseId: string, date: string) => void
}
```

**Add inline date editing state** (alongside existing `editingTitle` state):
```ts
const [editingDate, setEditingDate]   = useState(false)
const [dateDraft, setDateDraft]       = useState(phase.date)

function saveDate() {
  const d = dateDraft.trim()
  if (d !== phase.date) onUpdatePhaseDate(phase.id, d)
  setEditingDate(false)
}
```

**Replace the header button** — the outer `<button>` that wraps the whole header currently does toggle. Change so collapse is chevron-only:

Replace the outer header structure. Instead of one big `<button>` wrapping everything, use a `<div>` for the header row and make only the chevron a toggle button:

```tsx
{/* Header */}
<div className="flex w-full items-start justify-between gap-4">
  {/* Left side: num + title + date */}
  <div className="flex items-center gap-3 min-w-0 flex-1">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber/30 text-xs text-amber">
      {num}
    </span>
    <div className="min-w-0 flex-1">
      {editingTitle ? (
        <input
          data-testid="phase-title-input"
          autoFocus
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onKeyDown={e => {
            e.stopPropagation()
            if (e.key === 'Enter') saveTitle()
            if (e.key === 'Escape') setEditingTitle(false)
          }}
          onBlur={saveTitle}
          className="bg-transparent font-display text-lg text-garden-text focus:outline-none border-b border-amber/40 w-full"
        />
      ) : (
        <p
          data-testid="phase-card-title"
          className="font-display text-lg text-garden-text flex items-center gap-2 cursor-text"
          onClick={() => { setTitleDraft(phase.title); setEditingTitle(true) }}
        >
          {phase.title}
          {hasNotes && (
            <span data-testid="phase-has-notes-dot" className="inline-block h-1.5 w-1.5 rounded-full bg-amber" title="Has notes" />
          )}
        </p>
      )}
      {editingDate ? (
        <input
          data-testid="phase-date-input"
          autoFocus
          value={dateDraft}
          onChange={e => setDateDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') saveDate()
            if (e.key === 'Escape') setEditingDate(false)
          }}
          onBlur={saveDate}
          className="bg-transparent text-xs text-garden-text/60 focus:outline-none border-b border-amber/40"
        />
      ) : (
        <p
          data-testid="phase-date"
          className="text-xs text-garden-text/40 cursor-text hover:text-garden-text/60 mt-0.5"
          onClick={() => { setDateDraft(phase.date); setEditingDate(true) }}
        >
          {phase.date || 'Add date…'}
        </p>
      )}
    </div>
  </div>

  {/* Right side: StatusChip + delete + chevron */}
  <div className="flex items-center gap-1 shrink-0">
    <StatusChip
      data-testid="phase-status-chip"
      value={phase.status}
      options={PHASE_STATUS_OPTIONS}
      onChange={status => onUpdatePhaseStatus(phase.id, status as PhaseStatus)}
    />
    <button
      onClick={e => { e.stopPropagation(); setConfirmOpen(true) }}
      data-testid="phase-delete-btn"
      aria-label="Remove phase"
      className="text-xs text-garden-text/30 hover:text-[#9E4E24] p-1"
    >
      ✕
    </button>
    <button
      data-testid="phase-collapse-chevron"
      onClick={() => setOpen(o => !o)}
      aria-label="Toggle phase"
      className="p-1"
    >
      <svg
        className={`h-3 w-3 text-garden-text/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="1,1 5,5 9,1" />
      </svg>
    </button>
  </div>
</div>
```

Remove the `phase-edit-btn` entirely (no more ✎ button on phase header).

Update the component signature to use the new props and remove `onEdit`:
```tsx
export function PhaseCard({ phase, num, onToggle, onDelete, updatePhaseNotes, onTaskClick, onAddTask, onDeleteTask, onRenamePhase, onRenameTask, onUpdatePhaseStatus, onUpdatePhaseDate }: PhaseCardProps) {
```

- [ ] **Step 5: Update `PlanPage.tsx` — pass new props, remove `onEdit`, destructure new hooks**

```tsx
const {
  phases, toggleTask, addPhase, updatePhase, updatePhaseStatus, updatePhaseDate, deletePhase, updatePhaseNotes,
  addTask, deleteTask, updateTaskText, updateTaskStatus, updateTaskNotes,
  addTaskOption, selectTaskOption, deleteTaskOption,
} = usePhases()
```

Pass to `PhaseCard`:
```tsx
<PhaseCard
  key={phase.id}
  phase={phase}
  num={i + 1}
  onToggle={toggleTask}
  onDelete={deletePhase}
  updatePhaseNotes={updatePhaseNotes}
  onTaskClick={task => setDrawerTask({ phaseId: phase.id, taskId: task.id })}
  onAddTask={addTask}
  onDeleteTask={deleteTask}
  onRenamePhase={(phaseId, title) => updatePhase(phaseId, { title, date: phase.date, status: phase.status })}
  onRenameTask={updateTaskText}
  onUpdatePhaseStatus={updatePhaseStatus}
  onUpdatePhaseDate={updatePhaseDate}
/>
```

Remove from `PlanPage`: the `phaseModal` edit path (`onEdit` prop and the `setPhaseModal({ open: true, phase })` call). Remove `PhaseModal`'s edit path — it now only handles `addPhase`:
```tsx
// Before
onSave={data => phaseModal.phase ? updatePhase(phaseModal.phase.id, data) : addPhase(data)}

// After (modal is add-only now, so phase is always undefined here)
onSave={data => addPhase(data)}
```

Also remove the `phaseModal.phase` from the `key` (always `'new'` now):
```tsx
<PhaseModal
  key="new"
  open={phaseModal.open}
  onSave={addPhase}
  onClose={() => setPhaseModal({ open: false })}
/>
```

- [ ] **Step 6: Run tests to confirm GREEN**

```bash
npm run test:local
# grep for: phase status|phase date
```

Expected: both pass.

- [ ] **Step 7: Run full suite to confirm no regressions**

```bash
npm run test:local
```

Expected: all tests pass. Note: `plan: edit phase updates title in list` now needs updating — it previously used the modal edit button. Update that test:

```ts
// Old test used phase-edit-btn to open modal — replace with:
test('plan: edit phase updates title in list', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-card-title"]')
  await page.getByTestId('phase-card-title').first().click()
  await page.getByTestId('phase-title-input').first().fill('Renamed Phase')
  await page.getByTestId('phase-title-input').first().press('Enter')
  await expect(page.getByText('Renamed Phase')).toBeVisible()
})
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/firebase/hooks.ts src/features/plan/PhaseCard.tsx src/features/plan/PlanPage.tsx src/features/plan/PhaseModal.tsx tests/page.spec.ts
git commit -m "feat: inline phase status/date editing via StatusChip and text inputs"
```

---

## Task 4: Wire `StatusChip` into `TaskDrawer`

**Files:**
- Modify: `src/features/plan/TaskDrawer.tsx`
- Modify: `tests/page.spec.ts`

- [ ] **Step 1: Write the failing test**

Add to `tests/page.spec.ts`:
```ts
test('plan: StatusChip changes task status in drawer', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="task-row"]')
  await page.getByTestId('task-row').first().hover()
  await page.getByTestId('task-edit-btn').first().click()
  await expect(page.getByTestId('task-drawer')).toBeVisible()
  await page.getByTestId('task-status-chip').click()
  await page.getByRole('button', { name: 'In progress' }).click()
  await expect(page.getByTestId('task-status-chip')).toContainText('In progress')
})
```

- [ ] **Step 2: Run test to confirm RED**

```bash
npm run test:local
# grep for: task status in drawer
```

Expected: fails — `task-status-chip` not found.

- [ ] **Step 3: Update `TaskDrawer.tsx`**

**Add to imports:**
```tsx
import { StatusChip } from '../../design-system'
import type { StatusOption } from '../../design-system'
```

**Add task status options constant** (top of file, replace `STATUS_OPTIONS`):
```ts
const TASK_STATUS_OPTIONS: StatusOption[] = [
  { value: 'not-started', label: 'Not started', variant: 'default' },
  { value: 'in-progress', label: 'In progress', variant: 'warning' },
  { value: 'done',        label: 'Done',        variant: 'success' },
]
```

**Replace the status pills section:**
```tsx
{/* Status */}
<div>
  <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Status</p>
  <StatusChip
    data-testid="task-status-chip"
    value={task.status ?? null}
    options={TASK_STATUS_OPTIONS}
    onChange={val => onUpdateStatus(phaseId, task.id, (val || null) as TaskStatus | null)}
    nullable
  />
</div>
```

Remove the old `STATUS_OPTIONS` array and its import if it was separate.

- [ ] **Step 4: Run test to confirm GREEN**

```bash
npm run test:local
# grep for: task status in drawer
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/features/plan/TaskDrawer.tsx tests/page.spec.ts
git commit -m "feat: StatusChip in TaskDrawer replaces status pills"
```

---

## Task 5: Drag-to-reorder phases with `@dnd-kit`

**Files:**
- Modify: `package.json` (install deps)
- Modify: `src/features/plan/PlanPage.tsx`
- Modify: `src/features/plan/PhaseCard.tsx`
- Modify: `src/lib/firebase/hooks.ts`
- Modify: `tests/page.spec.ts`

- [ ] **Step 1: Install `@dnd-kit`**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Write the failing test**

Add to `tests/page.spec.ts`:
```ts
test('plan: drag reorders phases', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-drag-handle"]')
  const handles = page.getByTestId('phase-drag-handle')
  const first = handles.nth(0)
  const second = handles.nth(1)
  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()
  if (!firstBox || !secondBox) throw new Error('No bounding box')

  // Drag second phase above the first
  await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y - 10, { steps: 20 })
  await page.mouse.up()
  await page.waitForTimeout(500)

  // First phase's num badge should now show 2
  await expect(page.getByTestId('phase-num-badge').first()).toContainText('2')
})
```

- [ ] **Step 3: Run test to confirm RED**

```bash
npm run test:local
# grep for: drag reorders
```

Expected: fails — `phase-drag-handle` not found.

- [ ] **Step 4: Add `reorderPhases` to `hooks.ts`**

```ts
function reorderPhases(orderedIds: string[]) {
  const updates: Record<string, number> = {}
  orderedIds.forEach((id, i) => {
    updates[`${DB_ROOT}/phases/${id}/order`] = i * 1000
  })
  update(ref(db), updates)
}
```

Add to the return object: `reorderPhases`.

- [ ] **Step 5: Add `useSortable` drag handle to `PhaseCard`**

In `src/features/plan/PhaseCard.tsx`:

**Add imports:**
```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
```

**Add `useSortable` hook inside the component (top of function body):**
```tsx
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: phase.id })

const sortableStyle = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
}
```

**Wrap the return value:** change `return (<Card>...)` to `return (<div ref={setNodeRef} style={sortableStyle}><Card>...</Card></div>)`.

**Insert the drag handle button** as the first child inside the left flex group (before the `<span>` showing `{num}`). This is additive — insert before the num circle, do not replace anything:

```tsx
<button
  data-testid="phase-drag-handle"
  className="cursor-grab touch-none text-garden-text/20 hover:text-garden-text/50 p-1 shrink-0 active:cursor-grabbing"
  aria-label="Drag to reorder"
  {...attributes}
  {...listeners}
>
  <svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor">
    <circle cx="2.5" cy="2.5"  r="1.5"/><circle cx="7.5" cy="2.5"  r="1.5"/>
    <circle cx="2.5" cy="8"    r="1.5"/><circle cx="7.5" cy="8"    r="1.5"/>
    <circle cx="2.5" cy="13.5" r="1.5"/><circle cx="7.5" cy="13.5" r="1.5"/>
  </svg>
</button>
```

Also add `data-testid="phase-num-badge"` to the `<span>` that displays `{num}` so the drag reorder test can assert on it without relying on CSS class selectors.

- [ ] **Step 6: Wire `@dnd-kit` in `PlanPage.tsx`**

**Add imports:**
```tsx
import {
  DndContext, closestCenter, DragOverlay,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
```

**Add state:**
```tsx
const [activePhaseId, setActivePhaseId] = useState<string | null>(null)
```

**Destructure `reorderPhases` from hook.**

**Add handlers:**
```tsx
function handleDragStart({ active }: DragStartEvent) {
  setActivePhaseId(active.id as string)
}

function handleDragEnd({ active, over }: DragEndEvent) {
  setActivePhaseId(null)
  if (!over || active.id === over.id) return
  const oldIndex = phases.findIndex(p => p.id === active.id)
  const newIndex = phases.findIndex(p => p.id === over.id)
  reorderPhases(arrayMove(phases, oldIndex, newIndex).map(p => p.id))
}
```

**Wrap the phases list:**
```tsx
<DndContext
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
    <div className="space-y-4">
      {phases.map((phase, i) => (
        <PhaseCard key={phase.id} phase={phase} num={i + 1} ... />
      ))}
    </div>
  </SortableContext>
  <DragOverlay>
    {activePhaseId ? (() => {
      const p = phases.find(ph => ph.id === activePhaseId)!
      const n = phases.findIndex(ph => ph.id === activePhaseId) + 1
      // Full PhaseCard with no-op callbacks — interactive elements are
      // visually hidden by pointer-events-none so clicking the ghost does nothing.
      return (
        <div className="opacity-50 pointer-events-none">
          <PhaseCard
            phase={p} num={n}
            onToggle={() => {}} onDelete={() => {}} updatePhaseNotes={() => {}}
            onTaskClick={() => {}} onAddTask={() => {}} onDeleteTask={() => {}}
            onRenamePhase={() => {}} onRenameTask={() => {}}
            onUpdatePhaseStatus={() => {}} onUpdatePhaseDate={() => {}}
          />
        </div>
      )
    })() : null}
  </DragOverlay>
</DndContext>
```

- [ ] **Step 7: Run test to confirm GREEN**

```bash
npm run test:local
# grep for: drag reorders
```

Expected: passes.

- [ ] **Step 8: Run full suite**

```bash
npm run test:local
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/features/plan/PlanPage.tsx src/features/plan/PhaseCard.tsx src/lib/firebase/hooks.ts tests/page.spec.ts
git commit -m "feat: drag-to-reorder phases with @dnd-kit, touch-friendly"
```

---

## Task 6: Final verification + push

- [ ] **Step 1: Build for production**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 2: Run full Playwright suite**

```bash
npm run test:local
```

Expected: all tests pass.

- [ ] **Step 3: Push branch and update PR**

```bash
git push
```

The open PR (`feat/inline-editing-and-chevron`) will auto-update. CI will run the full test suite against the deployed preview.

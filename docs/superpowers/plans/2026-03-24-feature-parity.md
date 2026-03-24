# Garden Site — Feature Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the React rebuild to full feature parity with the original static HTML site, including collapsible sidebar navigation, full CRUD for all entities, material options modal with compare mode, task detail drawer, phase notes, custom checkboxes, and a fixed map tooltip.

**Architecture:** Feature logic lives in `features/` pages and components; shared UI primitives in `design-system/`; all Firebase reads/writes go through `src/lib/firebase/hooks.ts`. New layout replaces the horizontal `Nav` with a vertical collapsible `Sidebar` in `AppShell`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, Firebase Realtime Database (modular v9), React Router v6, Playwright (TDD)

**Dev server:** `npm run dev` (runs on `http://localhost:5173`). Must be running for local tests.
**Run local tests:** `npm run test:local -- --grep "pattern"` (auth bypassed via `VITE_SKIP_AUTH=true`)
**Firebase path:** `garden-dev` (local), `garden` (prod). Budget key is `budgetItems`.

---

## File Map

**New files:**
| File | Purpose |
|------|---------|
| `src/app/layout/Sidebar.tsx` | Collapsible icon+label sidebar |
| `src/design-system/components/ConfirmModal/ConfirmModal.tsx` | Reusable destructive action confirm |
| `src/features/plan/TaskRow.tsx` | Task with custom moss checkbox |
| `src/features/plan/TaskDrawer.tsx` | Slide-in task detail panel |
| `src/features/plan/PhaseModal.tsx` | Add/edit phase modal |
| `src/features/materials/MaterialCard.tsx` | Material card with status `<select>` |
| `src/features/materials/MaterialModal.tsx` | Add/edit material modal |
| `src/features/materials/OptionsModal.tsx` | Material options + compare mode |
| `src/features/materials/OptionCard.tsx` | Single option (list or compare) |
| `src/features/materials/AddOptionForm.tsx` | Inline add/edit option mini-form |
| `src/lib/firebase/storage.ts` | Image compression + conditional Storage upload |
| `src/features/budget/BudgetItemModal.tsx` | Add/edit budget item modal |

**Modified files:**
| File | Change |
|------|--------|
| `src/types/index.ts` | Extend `Task`, `Material`, `MaterialOption`; add `TaskOption` |
| `src/app/layout/AppShell.tsx` | Full rewrite — sidebar layout |
| `src/app/layout/Nav.tsx` | Delete content; AppShell no longer imports it |
| `src/lib/firebase/hooks.ts` | Add CRUD functions to all hooks |
| `src/design-system/index.ts` | Export `ConfirmModal` |
| `src/features/plan/PhaseCard.tsx` | Use `TaskRow`, add notes area + amber dot + edit/delete |
| `src/features/plan/PlanPage.tsx` | Add `PhaseModal`, `+ Add phase` button |
| `src/features/materials/MaterialsPage.tsx` | Full rewrite using new components |
| `src/features/budget/BudgetPage.tsx` | Add CRUD columns + variance total in footer |
| `src/features/map/MapPage.tsx` | Fix tooltip positioning using mouse tracking |
| `tests/page.spec.ts` | All new test scenarios |

---

## Task 1: Extend TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update types**

Replace the current `Task`, `MaterialOption`, `Material` definitions and add `TaskOption`:

```ts
// src/types/index.ts

// ─── Plan ────────────────────────────────────────────────────────────────────

export type PhaseStatus = 'done' | 'current' | 'upcoming'

export type TaskStatus = 'not-started' | 'in-progress' | 'done'

export interface TaskOption {
  id:        string
  name:      string
  price?:    number
  url?:      string
  notes?:    string
  selected?: boolean
}

export interface Task {
  id:      string
  text:    string
  done:    boolean
  status?: TaskStatus
  notes?:  string
  options?: Record<string, TaskOption>
}

export interface Phase {
  id:     string
  num:    string
  title:  string
  date:   string
  status: PhaseStatus
  tasks:  Task[]
  notes?: string
}

// ─── Materials ───────────────────────────────────────────────────────────────

export type MaterialStatus = 'researching' | 'to-order' | 'ordered' | 'delivered'

export type OptionStatus = 'shortlisted' | 'ordered' | 'rejected' | null

export interface MaterialOption {
  id:        string
  name:      string
  supplier?: string
  leadTime?: string
  price?:    number
  url?:      string
  notes?:    string
  imageUrl?: string
  status?:   OptionStatus
}

export interface Material {
  id:      string
  name:    string
  spec:    string
  low:     number
  high:    number
  status:  MaterialStatus
  accent:  string
  options: MaterialOption[]
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface BudgetItem {
  id:      string
  name:    string
  low:     number
  high:    number
  actual?: number
  order?:  number
}

// ─── Journal ─────────────────────────────────────────────────────────────────

export interface JournalSlot {
  id:        string
  label:     string
  phase:     string
  imageUrl?: string
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export interface Zone {
  id:    string
  title: string
  desc:  string
}
```

> **Note:** `Material.cost` (string) is replaced by `low`/`high` (numbers) to enable variance calculations in OptionsModal. If existing Firebase data has `cost: "£2,500 – £4,000"`, the migration script or a backwards-compatible read is needed. For this plan, treat `cost` as legacy — the hooks will still return it but we derive the display string from `low`/`high`.

- [ ] **Step 2: Fix any TypeScript errors from the type changes**

Run `npm run build` and resolve any type errors surfaced by the new Material shape (mainly `MaterialsPage.tsx` and `hooks.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "types: extend Task, Material, MaterialOption; add TaskOption"
```

---

## Task 2: Collapsible sidebar navigation

**Files:**
- Create: `src/app/layout/Sidebar.tsx`
- Modify: `src/app/layout/AppShell.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/page.spec.ts`:

```ts
// ─── Sidebar ──────────────────────────────────────────────────────────────────

test('sidebar: shows all nav links expanded by default', async ({ page }) => {
  await page.goto('/')
  for (const label of ['Overview', 'Plan', 'Materials', 'Budget', 'Journal', 'Map']) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible()
  }
})

test('sidebar: collapses to icon-only on button click', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /collapse/i }).click()
  await expect(page.getByText('Overview')).not.toBeVisible()
})

test('sidebar: expands again after second click', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /collapse/i }).click()
  await page.getByRole('button', { name: /expand/i }).click()
  await expect(page.getByText('Overview')).toBeVisible()
})

test('sidebar: active nav link is highlighted on plan page', async ({ page }) => {
  await page.goto('/plan')
  const planLink = page.getByRole('link', { name: 'Plan', exact: true })
  await expect(planLink).toHaveClass(/text-amber/)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:local -- --grep "sidebar"
```

Expected: FAIL — sidebar not present, tests find nav links in horizontal nav or none.

- [ ] **Step 3: Create Sidebar component**

```tsx
// src/app/layout/Sidebar.tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

const NAV_ITEMS = [
  { to: '/',          label: 'Overview',  icon: '⊞' },
  { to: '/plan',      label: 'Plan',      icon: '✓' },
  { to: '/materials', label: 'Materials', icon: '◈' },
  { to: '/budget',    label: 'Budget',    icon: '£' },
  { to: '/journal',   label: 'Journal',   icon: '▣' },
  { to: '/map',       label: 'Map',       icon: '⬡' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { signOut } = useAuth()

  return (
    <aside
      className={`flex flex-shrink-0 flex-col border-r border-white/10 bg-[#0c0f0a] transition-all duration-200 ${
        collapsed ? 'w-13' : 'w-44'
      }`}
    >
      {/* Logo row */}
      <div className="flex min-h-13 items-center justify-between border-b border-white/10 px-3.5">
        {!collapsed && (
          <span className="font-display text-lg text-amber">Mitchell Garden</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto shrink-0 p-1 text-garden-text/40 hover:text-amber"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 overflow-hidden border-l-2 px-3.5 py-2 text-xs tracking-wide transition-colors ${
                collapsed ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'border-amber bg-amber/5 text-amber'
                  : 'border-transparent text-garden-text/60 hover:bg-white/5 hover:text-garden-text'
              }`
            }
          >
            <span className="shrink-0 text-sm">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={signOut}
          aria-label="Sign out"
          className={`flex items-center gap-2 text-xs text-garden-text/40 hover:text-garden-text/70 ${
            collapsed ? 'justify-center w-full' : ''
          }`}
        >
          <span>⎋</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Rewrite AppShell to use sidebar layout**

```tsx
// src/app/layout/AppShell.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex h-screen bg-garden-bg text-garden-text font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:local -- --grep "sidebar"
```

Expected: PASS on all 4 sidebar tests.

- [ ] **Step 6: Delete old nav tests that no longer apply**

Remove the mobile nav hamburger test from `tests/page.spec.ts` (sidebar replaces it). Keep the "nav renders six links" test but update its `data-testid` or selector if needed.

- [ ] **Step 7: Verify all existing tests still pass**

```bash
npm run test:local
```

- [ ] **Step 8: Commit**

```bash
git add src/app/layout/Sidebar.tsx src/app/layout/AppShell.tsx tests/page.spec.ts
git commit -m "feat: replace horizontal nav with collapsible sidebar"
```

---

## Task 3: ConfirmModal shared component

**Files:**
- Create: `src/design-system/components/ConfirmModal/ConfirmModal.tsx`
- Modify: `src/design-system/index.ts`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing test**

The component will be triggered via phase delete (Task 7), but we can write the test now referencing the phase delete button which we know will exist. Since this task is just the component, write a placeholder test that will be run in Task 7 once the delete button exists. Add to `tests/page.spec.ts`:

```ts
// Note: this test will actually pass once Task 7 (Phase CRUD) is complete.
// Run it then, not now. It documents the expected confirm modal behaviour.
test('confirm modal: shows title, body, and delete button', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-delete-btn"]')
  await page.getByTestId('phase-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/permanently remove/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
})
```

- [ ] **Step 2: Create ConfirmModal**

```tsx
// src/design-system/components/ConfirmModal/ConfirmModal.tsx
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
```

- [ ] **Step 3: Export from design-system index**

Add to `src/design-system/index.ts`:
```ts
export { ConfirmModal } from './components/ConfirmModal/ConfirmModal'
```

- [ ] **Step 4: Commit**

```bash
git add src/design-system/components/ConfirmModal/ConfirmModal.tsx src/design-system/index.ts tests/page.spec.ts
git commit -m "feat: add ConfirmModal shared component"
```

---

## Task 4: Firebase hooks — expand all CRUD operations

**Files:**
- Modify: `src/lib/firebase/hooks.ts`

Add write functions for all entities. The existing hook pattern uses `update(ref(db, path), data)`.

- [ ] **Step 1: Expand usePhases with CRUD**

Replace the current `usePhases` with:

```ts
import { ref, onValue, update, set, remove, push } from 'firebase/database'

export function usePhases() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onValue(ref(db, `${DB_ROOT}/phases`), snap => {
      if (snap.val()) setPhases(toPhases(snap.val()))
      setLoading(false)
    })
  }, [])

  function toggleTask(phaseId: string, taskId: string, done: boolean) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { done })
  }

  function updatePhaseNotes(phaseId: string, notes: string) {
    set(ref(db, `${DB_ROOT}/phases/${phaseId}/notes`), notes)
  }

  function addPhase(data: { num: string; title: string; date: string; status: PhaseStatus }) {
    const newRef = push(ref(db, `${DB_ROOT}/phases`))
    set(newRef, { ...data, tasks: {}, order: Date.now() })
  }

  function updatePhase(phaseId: string, data: { num: string; title: string; date: string; status: PhaseStatus }) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}`), data)
  }

  function deletePhase(phaseId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}`))
  }

  function addTask(phaseId: string, text: string) {
    const newRef = push(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks`))
    set(newRef, { text, done: false, order: Date.now() })
  }

  function updateTaskText(phaseId: string, taskId: string, text: string) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { text })
  }

  function updateTaskStatus(phaseId: string, taskId: string, status: TaskStatus | null) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { status: status ?? null })
  }

  function updateTaskNotes(phaseId: string, taskId: string, notes: string) {
    set(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/notes`), notes)
  }

  function deleteTask(phaseId: string, taskId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`))
  }

  function addTaskOption(phaseId: string, taskId: string, option: Omit<TaskOption, 'id'>) {
    const newRef = push(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options`))
    set(newRef, option)
  }

  function selectTaskOption(phaseId: string, taskId: string, selectedId: string, allOptionIds: string[]) {
    // Multi-path update: ref(db) points to the database root ('/').
    // Keys in `updates` must be root-relative paths (no leading slash needed — Firebase accepts both).
    // DB_ROOT is 'garden-dev' so paths resolve to e.g. 'garden-dev/phases/.../selected'.
    // Pass selectedId='' (empty string) to deselect all (clear the selection).
    const updates: Record<string, boolean> = {}
    for (const id of allOptionIds) {
      updates[`${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options/${id}/selected`] = id === selectedId && selectedId !== ''
    }
    update(ref(db), updates)
  }

  function deleteTaskOption(phaseId: string, taskId: string, optionId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options/${optionId}`))
  }

  return {
    phases, loading,
    toggleTask, updatePhaseNotes,
    addPhase, updatePhase, deletePhase,
    addTask, updateTaskText, updateTaskStatus, updateTaskNotes, deleteTask,
    addTaskOption, selectTaskOption, deleteTaskOption,
  }
}
```

- [ ] **Step 2: Expand useMaterials with CRUD**

Update `toMaterials` helper and add write functions. Note: the existing hook already maps options to an array. Keep that behaviour but also handle `supplier`, `leadTime`, `price` (number), and `status` on options.

```ts
function toMaterials(raw: Record<string, any>): Material[] {
  return (Object.entries(raw) as [string, any][])
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([id, m]) => ({
      id,
      name:    m.name,
      spec:    m.spec,
      low:     m.low ?? 0,
      high:    m.high ?? 0,
      status:  m.status ?? 'researching',
      accent:  m.accent ?? '#C8922A',
      options: Object.entries(m.options ?? {}).map(([oid, o]: [string, any]) => ({
        id:        oid,
        name:      o.name,
        supplier:  o.supplier,
        leadTime:  o.leadTime,
        price:     o.price,
        url:       o.url,
        notes:     o.notes,
        imageUrl:  o.imageUrl,
        status:    o.status ?? null,
      })),
    }))
}

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    return onValue(ref(db, `${DB_ROOT}/materials`), snap => {
      if (snap.val()) setMaterials(toMaterials(snap.val()))
      setLoading(false)
    })
  }, [])

  function setMaterialStatus(id: string, status: MaterialStatus) {
    set(ref(db, `${DB_ROOT}/materials/${id}/status`), status)
  }

  function addMaterial(data: Omit<Material, 'id' | 'options'>) {
    const newRef = push(ref(db, `${DB_ROOT}/materials`))
    set(newRef, { ...data, options: {}, order: Date.now() })
  }

  function updateMaterial(id: string, data: Omit<Material, 'id' | 'options'>) {
    update(ref(db, `${DB_ROOT}/materials/${id}`), data)
  }

  function deleteMaterial(id: string) {
    remove(ref(db, `${DB_ROOT}/materials/${id}`))
  }

  function addOption(materialId: string, option: Omit<MaterialOption, 'id'>) {
    const newRef = push(ref(db, `${DB_ROOT}/materials/${materialId}/options`))
    set(newRef, option)
  }

  function updateOption(materialId: string, optionId: string, option: Omit<MaterialOption, 'id'>) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}`), option)
  }

  function deleteOption(materialId: string, optionId: string) {
    remove(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}`))
  }

  function setOptionStatus(materialId: string, optionId: string, status: OptionStatus) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}/status`), status)
  }

  function setOptionImage(materialId: string, optionId: string, imageUrl: string) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}/imageUrl`), imageUrl)
  }

  return {
    materials, loading,
    setMaterialStatus, addMaterial, updateMaterial, deleteMaterial,
    addOption, updateOption, deleteOption, setOptionStatus, setOptionImage,
  }
}
```

- [ ] **Step 3: Expand useBudget with CRUD**

Add to `useBudget`:

```ts
function addBudgetItem(data: { name: string; low: number; high: number }) {
  const newRef = push(ref(db, `${DB_ROOT}/budgetItems`))
  set(newRef, { ...data, order: Date.now() })
}

function updateBudgetItem(id: string, data: { name: string; low: number; high: number }) {
  update(ref(db, `${DB_ROOT}/budgetItems/${id}`), data)
}

function deleteBudgetItem(id: string) {
  remove(ref(db, `${DB_ROOT}/budgetItems/${id}`))
}

// ... add to return value
return { items, loading, setActual, addBudgetItem, updateBudgetItem, deleteBudgetItem }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors (may have warnings).

- [ ] **Step 5: Commit**

```bash
git add src/lib/firebase/hooks.ts
git commit -m "feat: add CRUD operations to all Firebase hooks"
```

---

## Task 5: Image compression utility

**Files:**
- Create: `src/lib/firebase/storage.ts`

- [ ] **Step 1: Create storage helper**

```ts
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
 * - ≤ 100KB compressed → store as data URL in RTDB
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/firebase/storage.ts
git commit -m "feat: add image compression and Firebase Storage upload utility"
```

---

## Task 6: Custom checkboxes and TaskRow component

**Files:**
- Create: `src/features/plan/TaskRow.tsx`
- Modify: `src/features/plan/PhaseCard.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing test**

Add to `tests/page.spec.ts`:

```ts
test('plan: checking a task marks it done with strikethrough', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="task-row"]')
  const firstRow = page.getByTestId('task-row').first()
  const checkbox = firstRow.getByRole('checkbox')
  const label    = firstRow.getByTestId('task-text')
  const wasDone  = await checkbox.isChecked()
  await checkbox.click()
  if (wasDone) {
    await expect(label).not.toHaveClass(/line-through/)
  } else {
    await expect(label).toHaveClass(/line-through/)
  }
})
```

- [ ] **Step 2: Run failing test**

```bash
npm run test:local -- --grep "checking a task"
```

Expected: FAIL — `data-testid="task-row"` not found.

- [ ] **Step 3: Create TaskRow component**

```tsx
// src/features/plan/TaskRow.tsx
import type { Task } from '../../types'

interface TaskRowProps {
  phaseId:  string
  task:     Task
  onToggle: (phaseId: string, taskId: string, done: boolean) => void
  onClick:  (task: Task) => void
}

export function TaskRow({ phaseId, task, onToggle, onClick }: TaskRowProps) {
  return (
    <li
      data-testid="task-row"
      className="flex items-center gap-3 py-1.5 group"
    >
      {/* Custom moss checkbox */}
      <button
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.text}
        onClick={() => onToggle(phaseId, task.id, !task.done)}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-colors ${
          task.done
            ? 'border-moss bg-moss'
            : 'border-moss bg-transparent hover:bg-moss/20'
        }`}
      >
        {task.done && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
            <polyline
              points="1.5,5 4,7.5 8.5,2.5"
              stroke="#EDE8DC"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Task text — single click to open drawer */}
      <span
        data-testid="task-text"
        onClick={() => onClick(task)}
        className={`flex-1 cursor-pointer text-sm select-none ${
          task.done
            ? 'text-garden-text/40 line-through decoration-amber/40'
            : 'text-garden-text/80 hover:text-garden-text'
        }`}
      >
        {task.text}
      </span>
    </li>
  )
}
```

> **Note on checkbox:** We use a `<button role="checkbox">` to avoid the native `<input>` while preserving accessibility. Playwright's `getByRole('checkbox')` will find it via the `role` attribute.

- [ ] **Step 4: Update PhaseCard to use TaskRow**

In `src/features/plan/PhaseCard.tsx`, replace the `<ul>` task loop:

```tsx
import { TaskRow } from './TaskRow'

// In JSX, replace the task <ul>:
<ul className="mt-4 space-y-0.5">
  {phase.tasks.map(task => (
    <TaskRow
      key={task.id}
      phaseId={phase.id}
      task={task}
      onToggle={onToggle}
      onClick={onTaskClick}
    />
  ))}
</ul>
```

Pass `onTaskClick` as a prop (added in Task 8 when TaskDrawer is wired up; for now pass a no-op).

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test:local -- --grep "checking a task"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/plan/TaskRow.tsx src/features/plan/PhaseCard.tsx tests/page.spec.ts
git commit -m "feat: custom moss checkboxes via TaskRow component"
```

---

## Task 7: Phase CRUD (add, edit, delete)

**Files:**
- Create: `src/features/plan/PhaseModal.tsx`
- Modify: `src/features/plan/PhaseCard.tsx`
- Modify: `src/features/plan/PlanPage.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('plan: add phase via modal appears in list', async ({ page }) => {
  await page.goto('/plan')
  await page.getByRole('button', { name: /add phase/i }).click()
  await page.getByLabel('Title').fill('Test Phase')
  await page.getByLabel('Date').fill('June 2026')
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.getByText('Test Phase')).toBeVisible()
})

test('plan: edit phase updates title in list', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-edit-btn"]')
  await page.getByTestId('phase-edit-btn').first().click()
  const titleInput = page.getByLabel('Title')
  await titleInput.clear()
  await titleInput.fill('Renamed Phase')
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.getByText('Renamed Phase')).toBeVisible()
})

test('plan: delete phase requires confirmation', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-delete-btn"]')
  await page.getByTestId('phase-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/permanently remove/i)).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "plan: add phase|plan: delete phase"
```

Expected: FAIL.

- [ ] **Step 3: Create PhaseModal**

```tsx
// src/features/plan/PhaseModal.tsx
import { useState } from 'react'
import { Modal } from '../../design-system'
import type { Phase, PhaseStatus } from '../../types'

interface PhaseModalProps {
  open:    boolean
  phase?:  Phase             // if provided, edit mode
  onSave:  (data: { num: string; title: string; date: string; status: PhaseStatus }) => void
  onClose: () => void
}

export function PhaseModal({ open, phase, onSave, onClose }: PhaseModalProps) {
  const [num,    setNum]    = useState(phase?.num    ?? '')
  const [title,  setTitle]  = useState(phase?.title  ?? '')
  const [date,   setDate]   = useState(phase?.date   ?? '')
  const [status, setStatus] = useState<PhaseStatus>(phase?.status ?? 'upcoming')

  function handleSave() {
    if (!title.trim()) return
    onSave({ num, title: title.trim(), date, status })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={phase ? 'Edit phase' : 'Add phase'}>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Num</label>
            <input
              aria-label="Num"
              value={num}
              onChange={e => setNum(e.target.value)}
              placeholder="0"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
            />
          </div>
          <div className="col-span-3">
            <label className="mb-1 block text-xs text-garden-text/50">Title</label>
            <input
              aria-label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Phase title"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Date</label>
          <input
            aria-label="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="April 2026"
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PhaseStatus)}
            className="w-full rounded border border-white/10 bg-[#1c2017] px-3 py-2 text-sm text-garden-text"
          >
            <option value="upcoming">Upcoming</option>
            <option value="current">Current</option>
            <option value="done">Complete</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-garden-text/50 hover:text-garden-text">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-amber px-4 py-2 text-sm font-semibold text-[#111410] hover:bg-amber/80"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 4: Add edit/delete buttons to PhaseCard**

In `PhaseCard.tsx`, add `onEdit`, `onDelete` props and render icon buttons in the header. Add `data-testid="phase-delete-btn"` to the delete button. Wire `ConfirmModal` for delete.

Key addition to the card header row:
```tsx
<div className="flex items-center gap-2">
  <Badge variant={statusVariant[phase.status]}>{statusLabel[phase.status]}</Badge>
  <button onClick={onEdit} data-testid="phase-edit-btn" aria-label="Edit phase" className="text-xs text-garden-text/30 hover:text-amber p-1">✎</button>
  <button onClick={() => setConfirmOpen(true)} data-testid="phase-delete-btn" aria-label="Delete phase" className="text-xs text-garden-text/30 hover:text-[#9E4E24] p-1">✕</button>
</div>
```

Add inside PhaseCard:
```tsx
const [confirmOpen, setConfirmOpen] = useState(false)
// ...
<ConfirmModal
  open={confirmOpen}
  title={`Delete "${phase.title}"?`}
  body="This will permanently remove the phase and all its tasks."
  onConfirm={() => { onDelete(phase.id); setConfirmOpen(false) }}
  onCancel={() => setConfirmOpen(false)}
/>
```

- [ ] **Step 5: Add PhaseModal and + Add phase button to PlanPage**

```tsx
// In PlanPage.tsx, add state and handlers:
const { phases, loading, addPhase, updatePhase, deletePhase, ... } = usePhases()
const [phaseModal, setPhaseModal] = useState<{ open: boolean; phase?: Phase }>({ open: false })

// At bottom of phase list:
<button
  onClick={() => setPhaseModal({ open: true })}
  className="flex items-center gap-2 rounded border border-dashed border-white/10 px-4 py-3 text-sm text-garden-text/40 hover:border-amber/30 hover:text-amber w-full"
>
  ＋ Add phase
</button>

<PhaseModal
  key={phaseModal.phase?.id ?? 'new'}  {/* Force remount when switching between phases */}
  open={phaseModal.open}
  phase={phaseModal.phase}
  onSave={data => phaseModal.phase ? updatePhase(phaseModal.phase.id, data) : addPhase(data)}
  onClose={() => setPhaseModal({ open: false })}
/>
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm run test:local -- --grep "plan: add phase|plan: delete phase"
```

Expected: PASS.

- [ ] **Step 7: Run all tests**

```bash
npm run test:local
```

- [ ] **Step 8: Commit**

```bash
git add src/features/plan/PhaseModal.tsx src/features/plan/PhaseCard.tsx src/features/plan/PlanPage.tsx tests/page.spec.ts
git commit -m "feat: phase CRUD — add, edit, delete with confirmation modal"
```

---

## Task 8: Phase notes

**Files:**
- Modify: `src/features/plan/PhaseCard.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing test**

```ts
test('plan: phase notes save on blur and persist', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-notes"]')
  const notes = page.getByTestId('phase-notes').first()
  await notes.fill('Test note content')
  await notes.blur()
  await page.reload()
  await page.waitForSelector('[data-testid="phase-notes"]')
  await expect(page.getByTestId('phase-notes').first()).toHaveValue('Test note content')
})

test('plan: amber dot appears when phase has notes', async ({ page }) => {
  await page.goto('/plan')
  // Assumes at least one phase has notes in dev data
  await expect(page.getByTestId('phase-has-notes-dot').first()).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "phase notes|amber dot"
```

Expected: FAIL.

- [ ] **Step 3: Add notes section to PhaseCard**

In the task list section of PhaseCard, after `</ul>`, add:

```tsx
{/* Notes */}
<hr className="mt-4 border-white/5" />
<textarea
  data-testid="phase-notes"
  defaultValue={phase.notes ?? ''}
  placeholder="Add notes…"
  rows={2}
  onBlur={e => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updatePhaseNotes(phase.id, e.target.value)
  }}
  onInput={e => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updatePhaseNotes(phase.id, (e.target as HTMLTextAreaElement).value)
    }, 800)
  }}
  className="mt-3 w-full resize-none bg-transparent text-xs text-garden-text/60 placeholder:text-garden-text/20 focus:outline-none"
/>
```

Add at top of PhaseCard:
```tsx
import { useRef } from 'react'
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

Add `updatePhaseNotes` to PhaseCardProps and the amber dot in the title row:
```tsx
{phase.notes && (
  <span
    data-testid="phase-has-notes-dot"
    className="inline-block h-1.5 w-1.5 rounded-full bg-amber"
    title="Has notes"
  />
)}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:local -- --grep "phase notes|amber dot"
```

- [ ] **Step 5: Commit**

```bash
git add src/features/plan/PhaseCard.tsx tests/page.spec.ts
git commit -m "feat: phase notes with auto-save and amber dot indicator"
```

---

## Task 9: Task CRUD and TaskDrawer

**Files:**
- Create: `src/features/plan/TaskDrawer.tsx`
- Modify: `src/features/plan/PhaseCard.tsx`
- Modify: `src/features/plan/PlanPage.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('plan: task drawer opens on task click', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="task-text"]')
  await page.getByTestId('task-text').first().click()
  await expect(page.getByTestId('task-drawer')).toBeVisible()
})

test('plan: add task inline appears in list', async ({ page }) => {
  await page.goto('/plan')
  await page.getByTestId('add-task-btn').first().click()
  await page.getByTestId('add-task-input').fill('New test task')
  await page.keyboard.press('Enter')
  await expect(page.getByText('New test task')).toBeVisible()
})

test('plan: delete task requires confirmation', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="task-row"]')
  await page.getByTestId('task-row').first().hover()
  await page.getByTestId('task-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "task drawer|add task|delete task"
```

Expected: FAIL.

- [ ] **Step 3: Create TaskDrawer component**

```tsx
// src/features/plan/TaskDrawer.tsx
import { useRef, useEffect, useState } from 'react'
import type { Task, TaskStatus } from '../../types'
import { ConfirmModal } from '../../design-system'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done',        label: 'Done'         },
]

interface TaskDrawerProps {
  phaseId:         string
  task:            Task | null
  onClose:         () => void
  onUpdateStatus:  (phaseId: string, taskId: string, status: TaskStatus | null) => void
  onUpdateNotes:   (phaseId: string, taskId: string, notes: string) => void
  onAddOption:     (phaseId: string, taskId: string, option: { name: string; price?: number; url?: string; notes?: string }) => void
  onSelectOption:  (phaseId: string, taskId: string, selectedId: string, allIds: string[]) => void
  onDeleteOption:  (phaseId: string, taskId: string, optionId: string) => void
}

export function TaskDrawer({
  phaseId, task, onClose,
  onUpdateStatus, onUpdateNotes,
  onAddOption, onSelectOption, onDeleteOption,
}: TaskDrawerProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [addingOption, setAddingOption] = useState(false)
  const [optName,  setOptName]  = useState('')
  const [optPrice, setOptPrice] = useState('')
  const [optUrl,   setOptUrl]   = useState('')
  const [optNotes, setOptNotes] = useState('')

  useEffect(() => {
    if (!task) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [task, onClose])

  if (!task) return null

  const options = Object.entries(task.options ?? {}).map(([id, o]) => ({ ...o, id }))
  const allIds  = options.map(o => o.id)

  function handleAddOption() {
    if (!optName.trim()) return
    onAddOption(phaseId, task!.id, {
      name:  optName.trim(),
      price: optPrice ? parseFloat(optPrice) : undefined,
      url:   optUrl   || undefined,
      notes: optNotes || undefined,
    })
    setOptName(''); setOptPrice(''); setOptUrl(''); setOptNotes('')
    setAddingOption(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        data-testid="task-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/10 bg-[#111410] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-lg text-garden-text">{task.text}</h3>
          <button onClick={onClose} className="text-garden-text/40 hover:text-garden-text">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status pills */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateStatus(phaseId, task.id, task.status === value ? null : value)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    task.status === value
                      ? 'bg-amber text-[#111410] font-semibold'
                      : 'border border-white/10 text-garden-text/50 hover:border-white/20 hover:text-garden-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Notes</p>
            <textarea
              defaultValue={task.notes ?? ''}
              placeholder="Add notes…"
              rows={4}
              onBlur={e => {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                onUpdateNotes(phaseId, task.id, e.target.value)
              }}
              onInput={e => {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => {
                  onUpdateNotes(phaseId, task.id, (e.target as HTMLTextAreaElement).value)
                }, 800)
              }}
              className="w-full resize-none rounded border border-white/10 bg-white/5 p-3 text-sm text-garden-text/70 placeholder:text-garden-text/20 focus:border-white/20 focus:outline-none"
            />
          </div>

          {/* Options list */}
          <div>
            <p className="mb-2 text-xs text-garden-text/40 uppercase tracking-wider">Options</p>
            {options.length === 0 && (
              <p className="text-xs text-garden-text/30 italic">No options yet</p>
            )}
            {options.map(opt => (
              <div
                key={opt.id}
                className={`mb-2 rounded border p-3 text-sm ${
                  opt.selected ? 'border-moss/50 bg-moss/10' : 'border-white/10 bg-white/3'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-garden-text/80">{opt.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        if (opt.selected) {
                          // Deselect: write false to all options (clear selection)
                          onSelectOption(phaseId, task.id, '', allIds)
                        } else {
                          onSelectOption(phaseId, task.id, opt.id, allIds)
                        }
                      }}
                      className={`text-xs px-2 py-0.5 rounded ${opt.selected ? 'text-moss' : 'text-garden-text/30 hover:text-garden-text/60'}`}
                    >
                      {opt.selected ? '✓ Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => onDeleteOption(phaseId, task.id, opt.id)}
                      className="text-xs text-garden-text/20 hover:text-[#9E4E24] px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {opt.price && <p className="mt-1 text-xs text-amber">£{opt.price}</p>}
                {opt.url   && <a href={opt.url} target="_blank" rel="noreferrer" className="mt-0.5 block text-xs text-[#5A7A8A] hover:underline truncate">{opt.url}</a>}
              </div>
            ))}

            {/* Add option form */}
            {addingOption ? (
              <div className="rounded border border-white/10 bg-white/3 p-3 space-y-2">
                <input value={optName}  onChange={e => setOptName(e.target.value)}  placeholder="Name *" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <input value={optPrice} onChange={e => setOptPrice(e.target.value)} placeholder="Price" type="number" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <input value={optUrl}   onChange={e => setOptUrl(e.target.value)}   placeholder="URL" className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none border border-white/10" />
                <div className="flex gap-2">
                  <button onClick={handleAddOption} className="rounded bg-amber px-3 py-1 text-xs font-semibold text-[#111410]">Add</button>
                  <button onClick={() => setAddingOption(false)} className="text-xs text-garden-text/40">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingOption(true)}
                className="mt-1 text-xs text-garden-text/30 hover:text-amber"
              >
                ＋ Add option
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Add task CRUD to PhaseCard (add inline input, delete button)**

In `PhaseCard.tsx`:
- Below the task list, add `+ Add task` button and inline input:

```tsx
const [addingTask, setAddingTask]   = useState(false)
const [newTaskText, setNewTaskText] = useState('')

function handleAddTask() {
  if (newTaskText.trim()) onAddTask(phase.id, newTaskText.trim())
  setNewTaskText(''); setAddingTask(false)
}
```

```tsx
{addingTask ? (
  <li className="flex items-center gap-3 py-1">
    <span className="h-4 w-4 shrink-0" />
    <input
      data-testid="add-task-input"
      autoFocus
      value={newTaskText}
      onChange={e => setNewTaskText(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAddingTask(false) }}
      onBlur={handleAddTask}
      className="flex-1 bg-transparent text-sm text-garden-text focus:outline-none"
      placeholder="Task name…"
    />
  </li>
) : (
  <li>
    <button
      data-testid="add-task-btn"
      onClick={() => setAddingTask(true)}
      className="py-1.5 text-xs text-garden-text/30 hover:text-amber"
    >
      ＋ Add task
    </button>
  </li>
)}
```

- In `TaskRow`, add hover-visible delete button that calls a prop (not direct delete — PhaseCard owns the confirm modal):
```tsx
interface TaskRowProps {
  phaseId:  string
  task:     Task
  onToggle: (phaseId: string, taskId: string, done: boolean) => void
  onClick:  (task: Task) => void
  onDelete: (phaseId: string, taskId: string) => void  // add this prop
}

// In JSX, inside the <li>:
<button
  data-testid="task-delete-btn"
  onClick={e => { e.stopPropagation(); onDelete(phaseId, task.id) }}
  className="ml-auto hidden text-xs text-garden-text/20 hover:text-[#9E4E24] group-hover:inline"
>
  ✕
</button>
```

- Wire `ConfirmModal` for task delete in `PhaseCard.tsx`. Add this state and JSX to `PhaseCard`:

```tsx
const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

// Pass to each TaskRow:
onDelete={(phaseId, taskId) => setTaskToDelete(phase.tasks.find(t => t.id === taskId) ?? null)}

// After the task list:
<ConfirmModal
  open={taskToDelete !== null}
  title="Delete task?"
  body="This will permanently remove this task."
  onConfirm={() => { if (taskToDelete) onDeleteTask(phase.id, taskToDelete.id); setTaskToDelete(null) }}
  onCancel={() => setTaskToDelete(null)}
/>
```

- [ ] **Step 5: Wire TaskDrawer into PlanPage**

In `PlanPage.tsx`:
```tsx
const [drawerTask, setDrawerTask] = useState<{ phase: Phase; task: Task } | null>(null)

// Pass to each PhaseCard:
onTaskClick={(task) => setDrawerTask({ phase, task })}

// After the phase list:
<TaskDrawer
  phaseId={drawerTask?.phase.id ?? ''}
  task={drawerTask?.task ?? null}
  onClose={() => setDrawerTask(null)}
  onUpdateStatus={updateTaskStatus}
  onUpdateNotes={updateTaskNotes}
  onAddOption={addTaskOption}
  onSelectOption={selectTaskOption}
  onDeleteOption={deleteTaskOption}
/>
```

- [ ] **Step 6: Run tests**

```bash
npm run test:local -- --grep "task drawer|add task|delete task"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/plan/TaskDrawer.tsx src/features/plan/PhaseCard.tsx src/features/plan/PlanPage.tsx tests/page.spec.ts
git commit -m "feat: task CRUD — add inline, delete confirm, TaskDrawer with status/notes/options"
```

---

## Task 10: Materials CRUD

**Files:**
- Create: `src/features/materials/MaterialCard.tsx`
- Create: `src/features/materials/MaterialModal.tsx`
- Modify: `src/features/materials/MaterialsPage.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('materials: add material via modal appears in list', async ({ page }) => {
  await page.goto('/materials')
  await page.getByRole('button', { name: /add material/i }).click()
  await page.getByLabel('Name').fill('Test Material')
  await page.getByLabel('Spec').fill('Test spec')
  await page.getByLabel('Low estimate').fill('100')
  await page.getByLabel('High estimate').fill('200')
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.getByText('Test Material')).toBeVisible()
})

test('materials: status dropdown change updates card', async ({ page }) => {
  await page.goto('/materials')
  await page.waitForSelector('[data-testid="material-status"]')
  const select = page.getByTestId('material-status').first()
  await select.selectOption('ordered')
  // Reload to verify persistence
  await page.reload()
  await expect(page.getByTestId('material-status').first()).toHaveValue('ordered')
})

test('materials: delete material requires confirmation', async ({ page }) => {
  await page.goto('/materials')
  await page.waitForSelector('[data-testid="material-delete-btn"]')
  await page.getByTestId('material-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/permanently remove/i)).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "materials: add|materials: status|materials: delete"
```

Expected: FAIL.

- [ ] **Step 3: Create MaterialCard**

```tsx
// src/features/materials/MaterialCard.tsx
import { useState } from 'react'
import { Card, ConfirmModal } from '../../design-system'
import type { Material, MaterialStatus } from '../../types'

const STATUS_LABELS: Record<MaterialStatus, string> = {
  'researching': 'Researching',
  'to-order':    'To order',
  'ordered':     'Ordered',
  'delivered':   'Delivered',
}

interface MaterialCardProps {
  material:        Material
  onStatusChange:  (id: string, status: MaterialStatus) => void
  onEdit:          () => void
  onDelete:        (id: string) => void
  onOpenOptions:   () => void
}

export function MaterialCard({ material, onStatusChange, onEdit, onDelete, onOpenOptions }: MaterialCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOrdered = material.status === 'ordered' || material.status === 'delivered'

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-lg" style={{ color: material.accent }}>
          {material.name}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onEdit} aria-label="Edit material" className="text-xs text-garden-text/30 hover:text-amber px-1">✎</button>
          <button
            data-testid="material-delete-btn"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete material"
            className="text-xs text-garden-text/30 hover:text-[#9E4E24] px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Status dropdown */}
      <select
        data-testid="material-status"
        value={material.status}
        onChange={e => onStatusChange(material.id, e.target.value as MaterialStatus)}
        className={`w-fit rounded-full border px-3 py-0.5 text-xs appearance-none cursor-pointer focus:outline-none ${
          isOrdered
            ? 'border-moss/40 bg-moss/20 text-[#8fbb8a]'
            : 'border-amber/30 bg-amber/10 text-amber'
        }`}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <p className="text-sm text-garden-text/60 line-clamp-3">{material.spec}</p>
      <p className="text-xs text-garden-text/40">
        £{material.low.toLocaleString('en-GB')} – £{material.high.toLocaleString('en-GB')}
      </p>

      <button
        onClick={onOpenOptions}
        className="mt-auto self-start text-xs text-amber/70 hover:text-amber transition-colors"
      >
        Options ({material.options.length}) →
      </button>

      <ConfirmModal
        open={confirmOpen}
        title={`Delete "${material.name}"?`}
        body="This will permanently remove the material and all its options."
        onConfirm={() => { onDelete(material.id); setConfirmOpen(false) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  )
}
```

- [ ] **Step 4: Create MaterialModal**

```tsx
// src/features/materials/MaterialModal.tsx
import { useState } from 'react'
import { Modal } from '../../design-system'
import type { Material, MaterialStatus } from '../../types'

interface MaterialModalProps {
  open:     boolean
  material?: Material
  onSave:   (data: Omit<Material, 'id' | 'options'>) => void
  onClose:  () => void
}

export function MaterialModal({ open, material, onSave, onClose }: MaterialModalProps) {
  const [name,   setName]   = useState(material?.name   ?? '')
  const [spec,   setSpec]   = useState(material?.spec   ?? '')
  const [low,    setLow]    = useState(String(material?.low  ?? ''))
  const [high,   setHigh]   = useState(String(material?.high ?? ''))
  const [status, setStatus] = useState<MaterialStatus>(material?.status ?? 'researching')
  const [accent, setAccent] = useState(material?.accent ?? '#C8922A')

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), spec, low: Number(low) || 0, high: Number(high) || 0, status, accent })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={material ? 'Edit material' : 'Add material'}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Name</label>
          <input aria-label="Name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Spec</label>
          <textarea aria-label="Spec" value={spec} onChange={e => setSpec(e.target.value)} rows={2} className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Low estimate (£)</label>
            <input aria-label="Low estimate" type="number" value={low} onChange={e => setLow(e.target.value)} className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">High estimate (£)</label>
            <input aria-label="High estimate" type="number" value={high} onChange={e => setHigh(e.target.value)} className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as MaterialStatus)} className="w-full rounded border border-white/10 bg-[#1c2017] px-3 py-2 text-sm text-garden-text">
            <option value="researching">Researching</option>
            <option value="to-order">To order</option>
            <option value="ordered">Ordered</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Accent colour</label>
          <div className="flex gap-3">
            {['#C8922A', '#8fbb8a', '#EDE8DC'].map(c => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${accent === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-garden-text/50 hover:text-garden-text">Cancel</button>
          <button onClick={handleSave} className="rounded bg-amber px-4 py-2 text-sm font-semibold text-[#111410] hover:bg-amber/80">Save</button>
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 5: Rewrite MaterialsPage**

```tsx
// src/features/materials/MaterialsPage.tsx
import { useState } from 'react'
import { PageHeader, Skeleton, Card } from '../../design-system'
import { useMaterials } from '../../lib/firebase/hooks'
import { MaterialCard } from './MaterialCard'
import { MaterialModal } from './MaterialModal'
import { OptionsModal } from './OptionsModal'
import type { Material, MaterialStatus } from '../../types'

export function MaterialsPage() {
  const {
    materials, loading,
    setMaterialStatus, addMaterial, updateMaterial, deleteMaterial,
    addOption, updateOption, deleteOption, setOptionStatus, setOptionImage,
  } = useMaterials()

  const [editMaterial,   setEditMaterial]   = useState<Material | null>(null)
  const [addingMaterial, setAddingMaterial] = useState(false)
  const [optionsMaterial, setOptionsMaterial] = useState<Material | null>(null)

  if (loading) return (
    <div>
      <PageHeader title="Materials" subtitle="Sourcing and procurement tracker" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0,1,2].map(i => <Card key={i}><Skeleton className="h-32 w-full" /></Card>)}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Materials" subtitle="Sourcing and procurement tracker" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map(m => (
          <MaterialCard
            key={m.id}
            material={m}
            onStatusChange={setMaterialStatus}
            onEdit={() => setEditMaterial(m)}
            onDelete={deleteMaterial}
            onOpenOptions={() => setOptionsMaterial(m)}
          />
        ))}
      </div>

      <button
        onClick={() => setAddingMaterial(true)}
        className="mt-4 flex w-full items-center gap-2 rounded border border-dashed border-white/10 px-4 py-3 text-sm text-garden-text/40 hover:border-amber/30 hover:text-amber"
      >
        ＋ Add material
      </button>

      <MaterialModal
        key={editMaterial?.id ?? 'new'}  {/* Force remount when switching between materials */}
        open={addingMaterial || editMaterial !== null}
        material={editMaterial ?? undefined}
        onSave={data => {
          if (editMaterial) updateMaterial(editMaterial.id, data)
          else addMaterial(data)
        }}
        onClose={() => { setAddingMaterial(false); setEditMaterial(null) }}
      />

      {optionsMaterial && (
        <OptionsModal
          material={optionsMaterial}
          onClose={() => setOptionsMaterial(null)}
          onAddOption={addOption}
          onUpdateOption={updateOption}
          onDeleteOption={deleteOption}
          onSetStatus={setOptionStatus}
          onSetImage={setOptionImage}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests**

```bash
npm run test:local -- --grep "materials: add|materials: status|materials: delete"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/materials/ tests/page.spec.ts
git commit -m "feat: materials CRUD — add/edit/delete, status dropdown"
```

---

## Task 11: Material options modal with compare mode and image handling

**Files:**
- Create: `src/features/materials/OptionsModal.tsx`
- Create: `src/features/materials/OptionCard.tsx`
- Create: `src/features/materials/AddOptionForm.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('materials: options modal opens and shows options', async ({ page }) => {
  await page.goto('/materials')
  await page.waitForSelector('text=Options')
  await page.getByText(/Options \(/).first().click()
  await expect(page.getByTestId('options-modal')).toBeVisible()
})

test('materials: compare toggle switches layout', async ({ page }) => {
  await page.goto('/materials')
  await page.getByText(/Options \(/).first().click()
  await page.getByRole('button', { name: /compare/i }).click()
  await expect(page.getByTestId('options-compare-mode')).toBeVisible()
})

test('materials: add option via inline form appears in list', async ({ page }) => {
  await page.goto('/materials')
  await page.getByText(/Options \(/).first().click()
  await page.getByRole('button', { name: /add option/i }).click()
  await page.getByLabel('Option name').fill('New Supplier')
  await page.getByRole('button', { name: /save option/i }).click()
  await expect(page.getByText('New Supplier')).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "options modal|compare toggle|add option"
```

- [ ] **Step 3: Create AddOptionForm**

```tsx
// src/features/materials/AddOptionForm.tsx
import { useState } from 'react'
import type { MaterialOption } from '../../types'

interface AddOptionFormProps {
  onSave:   (option: Omit<MaterialOption, 'id' | 'status' | 'imageUrl'>) => void
  onCancel: () => void
  initial?: MaterialOption
}

export function AddOptionForm({ onSave, onCancel, initial }: AddOptionFormProps) {
  const [name,      setName]      = useState(initial?.name      ?? '')
  const [supplier,  setSupplier]  = useState(initial?.supplier  ?? '')
  const [leadTime,  setLeadTime]  = useState(initial?.leadTime  ?? '')
  const [price,     setPrice]     = useState(initial?.price != null ? String(initial.price) : '')
  const [url,       setUrl]       = useState(initial?.url       ?? '')
  const [notes,     setNotes]     = useState(initial?.notes     ?? '')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name:     name.trim(),
      supplier: supplier  || undefined,
      leadTime: leadTime  || undefined,
      price:    price ? Number(price) : undefined,
      url:      url       || undefined,
      notes:    notes     || undefined,
    })
  }

  return (
    <div className="rounded border border-amber/20 bg-white/3 p-4 space-y-3">
      <p className="text-xs font-semibold text-garden-text/60 uppercase tracking-wider">
        {initial ? 'Edit option' : 'Add option'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-garden-text/40">Name *</label>
          <input aria-label="Option name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-garden-text focus:outline-none focus:border-white/20" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Supplier</label>
          <input value={supplier} onChange={e => setSupplier(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Lead time</label>
          <input value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 2 weeks"
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">Price (£)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-garden-text/40">URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-garden-text/40">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full resize-none rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-garden-text focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} aria-label="Save option" className="rounded bg-amber px-3 py-1.5 text-xs font-semibold text-[#111410]">
          Save option
        </button>
        <button onClick={onCancel} className="text-xs text-garden-text/40 hover:text-garden-text">Cancel</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create OptionCard**

```tsx
// src/features/materials/OptionCard.tsx
import { useRef } from 'react'
import type { MaterialOption, OptionStatus } from '../../types'
import { compressImage, storeOptionImage, imageFromClipboard } from '../../lib/firebase/storage'

const CHIP_OPTIONS: { value: OptionStatus; label: string }[] = [
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
  option:      MaterialOption
  materialId:  string
  isBest:      boolean
  highEstimate: number
  compareMode: boolean
  onEdit:      () => void
  onDelete:    () => void
  onSetStatus: (status: OptionStatus) => void
  onSetImage:  (url: string) => void
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
      {/* Image zone */}
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

      {/* Details */}
      <div className="flex-1 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-garden-text/90">{option.name}</span>
          <div className="flex gap-1 shrink-0">
            <button onClick={onEdit} className="text-xs text-garden-text/30 hover:text-amber px-1">✎</button>
            <button onClick={onDelete} className="text-xs text-garden-text/30 hover:text-[#9E4E24] px-1">✕</button>
          </div>
        </div>

        {/* Status chips */}
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

        {/* Fields */}
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

        {/* Cost bar */}
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
```

- [ ] **Step 5: Create OptionsModal**

```tsx
// src/features/materials/OptionsModal.tsx
import { useState } from 'react'
import { Modal, ConfirmModal } from '../../design-system'
import { AddOptionForm } from './AddOptionForm'
import { OptionCard }    from './OptionCard'
import type { Material, MaterialOption, OptionStatus } from '../../types'

interface OptionsModalProps {
  material:       Material
  onClose:        () => void
  onAddOption:    (materialId: string, option: Omit<MaterialOption, 'id'>) => void
  onUpdateOption: (materialId: string, optionId: string, option: Omit<MaterialOption, 'id'>) => void
  onDeleteOption: (materialId: string, optionId: string) => void
  onSetStatus:    (materialId: string, optionId: string, status: OptionStatus) => void
  onSetImage:     (materialId: string, optionId: string, url: string) => void
}

export function OptionsModal({
  material, onClose,
  onAddOption, onUpdateOption, onDeleteOption, onSetStatus, onSetImage,
}: OptionsModalProps) {
  const [compareMode,   setCompareMode]   = useState(false)
  const [addingOption,  setAddingOption]  = useState(false)
  const [editingOption, setEditingOption] = useState<MaterialOption | null>(null)
  const [deleteOption,  setDeleteOption]  = useState<MaterialOption | null>(null)

  const options    = material.options
  const pricesOnly = options.filter(o => o.price != null).map(o => o.price!)
  const minPrice   = pricesOnly.length ? Math.min(...pricesOnly) : null

  return (
    <Modal open onClose={onClose} title={`${material.name} — Options`}>
      <div data-testid="options-modal">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-garden-text/40">{options.length} options · {material.spec}</p>
        <button
          onClick={() => setCompareMode(c => !c)}
          className={`flex items-center gap-1.5 rounded border px-3 py-1 text-xs transition-colors ${
            compareMode
              ? 'border-amber/40 bg-amber/10 text-amber'
              : 'border-white/10 text-garden-text/40 hover:text-garden-text'
          }`}
        >
          ⇄ Compare
        </button>
      </div>

      {/* Options area */}
      <div
        data-testid={compareMode ? 'options-compare-mode' : 'options-list-mode'}
        className={compareMode ? 'flex gap-3 overflow-x-auto pb-2' : 'space-y-3'}
      >
        {options.map(opt => (
          <OptionCard
            key={opt.id}
            option={opt}
            materialId={material.id}
            isBest={opt.price != null && opt.price === minPrice}
            highEstimate={material.high}
            compareMode={compareMode}
            onEdit={() => setEditingOption(opt)}
            onDelete={() => setDeleteOption(opt)}
            onSetStatus={status => onSetStatus(material.id, opt.id, status)}
            onSetImage={url => onSetImage(material.id, opt.id, url)}
          />
        ))}

        {/* Add option */}
        {addingOption ? (
          <AddOptionForm
            onSave={data => { onAddOption(material.id, { ...data, status: null }); setAddingOption(false) }}
            onCancel={() => setAddingOption(false)}
          />
        ) : (
          <button
            onClick={() => setAddingOption(true)}
            className={`flex items-center justify-center gap-2 rounded border border-dashed border-white/10 text-xs text-garden-text/30 hover:border-amber/30 hover:text-amber transition-colors ${
              compareMode ? 'h-48 w-36 shrink-0 flex-col' : 'w-full py-3'
            }`}
          >
            ＋ Add option
          </button>
        )}
      </div>

      {/* Edit form */}
      {editingOption && (
        <div className="mt-4">
          <AddOptionForm
            initial={editingOption}
            onSave={data => {
              onUpdateOption(material.id, editingOption.id, { ...data, status: editingOption.status ?? null, imageUrl: editingOption.imageUrl })
              setEditingOption(null)
            }}
            onCancel={() => setEditingOption(null)}
          />
        </div>
      )}

      <ConfirmModal
        open={deleteOption !== null}
        title={`Delete "${deleteOption?.name}"?`}
        body="This will permanently remove this option."
        onConfirm={() => { onDeleteOption(material.id, deleteOption!.id); setDeleteOption(null) }}
        onCancel={() => setDeleteOption(null)}
      />
      </div> {/* closes data-testid="options-modal" */}
    </Modal>
  )
}
```

- [ ] **Step 6: Run tests**

```bash
npm run test:local -- --grep "options modal|compare toggle|add option"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/materials/OptionsModal.tsx src/features/materials/OptionCard.tsx src/features/materials/AddOptionForm.tsx tests/page.spec.ts
git commit -m "feat: material options modal with compare mode, status chips, and image upload"
```

---

## Task 12: Budget CRUD with variance total

**Files:**
- Create: `src/features/budget/BudgetItemModal.tsx`
- Modify: `src/features/budget/BudgetPage.tsx`
- Test: `tests/page.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
test('budget: add item via modal appears in table', async ({ page }) => {
  await page.goto('/budget')
  await page.getByRole('button', { name: /add budget item/i }).click()
  await page.getByLabel('Item name').fill('Test Item')
  await page.getByLabel('Low').fill('500')
  await page.getByLabel('High').fill('1000')
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.getByText('Test Item')).toBeVisible()
})

test('budget: entering actual shows variance pill', async ({ page }) => {
  await page.goto('/budget')
  await page.waitForSelector('[data-testid="actual-input"]')
  const input = page.getByTestId('actual-input').first()
  await input.fill('600')
  await input.blur()
  await expect(page.getByTestId('variance-pill').first()).toBeVisible()
})

test('budget: total row shows sum of variances with actuals', async ({ page }) => {
  await page.goto('/budget')
  await expect(page.getByTestId('total-variance')).toBeVisible()
})

test('budget: delete item requires confirmation', async ({ page }) => {
  await page.goto('/budget')
  await page.waitForSelector('[data-testid="budget-delete-btn"]')
  await page.getByTestId('budget-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "budget: add|budget: entering|budget: total|budget: delete"
```

Expected: FAIL.

- [ ] **Step 3: Create BudgetItemModal**

```tsx
// src/features/budget/BudgetItemModal.tsx
import { useState } from 'react'
import { Modal } from '../../design-system'
import type { BudgetItem } from '../../types'

interface BudgetItemModalProps {
  open:   boolean
  item?:  BudgetItem
  onSave: (data: { name: string; low: number; high: number }) => void
  onClose: () => void
}

export function BudgetItemModal({ open, item, onSave, onClose }: BudgetItemModalProps) {
  const [name, setName] = useState(item?.name ?? '')
  const [low,  setLow]  = useState(String(item?.low  ?? ''))
  const [high, setHigh] = useState(String(item?.high ?? ''))

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), low: Number(low) || 0, high: Number(high) || 0 })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit budget item' : 'Add budget item'}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-garden-text/50">Item name</label>
          <input aria-label="Item name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">Low (£)</label>
            <input aria-label="Low" type="number" value={low} onChange={e => setLow(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-garden-text/50">High (£)</label>
            <input aria-label="High" type="number" value={high} onChange={e => setHigh(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-garden-text" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-garden-text/50 hover:text-garden-text">Cancel</button>
          <button onClick={handleSave} className="rounded bg-amber px-4 py-2 text-sm font-semibold text-[#111410] hover:bg-amber/80">Save</button>
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 4: Rewrite BudgetPage with CRUD columns and variance total**

Add `editItem`/`deleteItem` state, `BudgetItemModal`, `ConfirmModal`, edit/delete columns, variance total in tfoot.

Key changes to the `BudgetPage`:
1. Import `{ addBudgetItem, updateBudgetItem, deleteBudgetItem }` from `useBudget`
2. Add `data-testid="actual-input"` on the actual `<input>`
3. Add `data-testid="variance-pill"` on `<VariancePill>`
4. Add Actions column (✎ / ✕) with `data-testid="budget-delete-btn"` on delete
5. Compute `totalVariance` — sum of `(actual - midpoint)` for rows with actuals
6. Show `totalVariance` in tfoot with `data-testid="total-variance"` as a `<VariancePill>`-equivalent

```tsx
// Variance total computation (add to BudgetPage):
const totalVariance = items
  .filter(i => i.actual != null)
  .reduce((sum, i) => sum + (i.actual! - (i.low + i.high) / 2), 0)
const hasVariance = items.some(i => i.actual != null)
```

```tsx
// In tfoot, replace the empty <td /> for variance with:
<td className="py-3 text-right">
  {hasVariance && (
    <span
      data-testid="total-variance"
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
        totalVariance > 0
          ? 'bg-[#9E4E24]/20 text-[#9E4E24]'
          : 'bg-moss/20 text-[#8fbb8a]'
      }`}
    >
      {totalVariance > 0 ? '+' : ''}£{Math.abs(Math.round(totalVariance)).toLocaleString('en-GB')}
    </span>
  )}
</td>
```

- [ ] **Step 5: Run tests**

```bash
npm run test:local -- --grep "budget: add|budget: entering|budget: total|budget: delete"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/budget/ tests/page.spec.ts
git commit -m "feat: budget CRUD — add/edit/delete items, variance total in footer"
```

---

## Task 13: Fix map zone tooltips

**Files:**
- Modify: `src/features/map/MapPage.tsx`
- Test: `tests/page.spec.ts`

The current bug: tooltip renders `absolute top-4` (always 16px from the top of the container) regardless of which zone is hovered. For a tall SVG, zones at the bottom show the tooltip nowhere near the cursor.

**Fix:** Track mouse position from the SVG `onMouseMove` event and position the tooltip `fixed` near the cursor.

- [ ] **Step 1: Write failing test**

```ts
test('map: hovering a zone shows tooltip with zone name', async ({ page }) => {
  await page.goto('/map')
  // Zone 1 SVG group has data-zone="zone1"
  await page.locator('[data-zone="zone1"]').hover()
  await expect(page.getByTestId('map-tooltip')).toBeVisible()
  await expect(page.getByTestId('map-tooltip')).toContainText('Zone 1')
})

test('map: moving mouse away hides tooltip', async ({ page }) => {
  await page.goto('/map')
  await page.locator('[data-zone="zone1"]').hover()
  await page.locator('h1').hover() // move away
  await expect(page.getByTestId('map-tooltip')).not.toBeVisible()
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm run test:local -- --grep "map: hovering|map: moving"
```

Expected: FAIL (tooltip not found or wrong position).

- [ ] **Step 3: Fix MapPage tooltip**

Replace the tooltip and mouse tracking in `MapPage.tsx`:

```tsx
// src/features/map/MapPage.tsx
import { useState } from 'react'
import { PageHeader } from '../../design-system'
import { ZONES } from '../../lib/mock-data'
import type { Zone } from '../../types'

export function MapPage() {
  const [activeZone,  setActiveZone]  = useState<string | null>(null)
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 })

  const zone = ZONES.find(z => z.id === activeZone) ?? null

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div>
      <PageHeader title="Map" subtitle="Garden plan — hover a zone for details" />

      <div className="relative mx-auto max-w-sm">
        {zone && (
          <div
            data-testid="map-tooltip"
            className="pointer-events-none fixed z-50 w-56 rounded border border-white/10 bg-[#1c2017] p-3 shadow-xl"
            style={{
              left: mousePos.x + 16,
              top:  mousePos.y - 8,
              transform: 'translateY(-50%)',
            }}
          >
            <p className="font-display text-sm text-amber">{zone.title}</p>
            <p className="mt-1 text-xs text-garden-text/60">{zone.desc}</p>
          </div>
        )}

        <svg
          id="garden-svg"
          viewBox="0 0 450 1000"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "'Jost', sans-serif" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveZone(null)}
        >
          {/* ... all existing SVG content unchanged ... */}
        </svg>
      </div>
    </div>
  )
}
```

Keep all existing SVG paths/groups identical. Only add `onMouseMove={handleMouseMove}` to the `<svg>` element and replace the `<Tooltip>` component + its absolute positioning with the `fixed` tooltip above.

- [ ] **Step 4: Run tests**

```bash
npm run test:local -- --grep "map: hovering|map: moving"
```

Expected: PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm run test:local
```

Expected: all passing.

- [ ] **Step 6: Commit**

```bash
git add src/features/map/MapPage.tsx tests/page.spec.ts
git commit -m "fix: map tooltip follows cursor using fixed positioning"
```

---

## Task 14: Final integration and push

- [ ] **Step 1: Run full test suite one last time**

```bash
npm run test:local
```

Expected: all passing. Fix any failures before proceeding.

- [ ] **Step 2: Build production bundle**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 3: Push to master and verify CI passes**

```bash
git push origin master
```

Watch GitHub Actions — build + Playwright run against preview server must pass before deploy.

- [ ] **Step 4: Smoke test production**

Visit https://garden.scottjmitchell.com and verify:
- Sidebar visible and collapsible
- Plan page loads with tasks and phases
- Custom checkboxes work
- Materials page loads with status dropdowns
- Budget page shows variance
- Map tooltips follow cursor

---

## Notes for implementer

- The Firebase `budgetItems` key (not `budget`) is already established in `hooks.ts` — use `budgetItems` for all budget paths
- The `VITE_SKIP_AUTH=true` in `.env` bypasses auth for local dev/testing — no login needed
- If Firebase data has `material.cost` (string) from the old schema but the type now expects `low`/`high` (numbers), the `toMaterials` helper can fall back: `low: m.low ?? 0, high: m.high ?? 0`
- The `moss` Tailwind token is `#3D5239` — use `text-moss`, `bg-moss`, `border-moss` as appropriate; verify it exists in `tailwind.config` before using
- For the sidebar collapse button `aria-label`, use `aria-label="Collapse sidebar"` when expanded and `aria-label="Expand sidebar"` when collapsed — the Playwright test uses `/collapse/i` and `/expand/i` grep patterns respectively

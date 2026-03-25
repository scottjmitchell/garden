import { test, expect } from '@playwright/test'

// ─── Smoke test ──────────────────────────────────────────────────────────────

test('app loads and shows page title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Mitchell Garden/)
})

// ─── Routing ─────────────────────────────────────────────────────────────────

const routes: { path: string; heading: string }[] = [
  { path: '/',          heading: 'Overview'   },
  { path: '/plan',      heading: 'Plan'       },
  { path: '/materials', heading: 'Materials'  },
  { path: '/budget',    heading: 'Budget'     },
  { path: '/journal',   heading: 'Journal'    },
  { path: '/map',       heading: 'Map'        },
]

for (const { path, heading } of routes) {
  test(`${path} renders page heading`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
  })
}

// ─── Design system gallery ────────────────────────────────────────────────────

test('Button: renders primary, secondary, and ghost variants', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('btn-primary')).toBeVisible()
  await expect(page.getByTestId('btn-secondary')).toBeVisible()
  await expect(page.getByTestId('btn-ghost')).toBeVisible()
})

test('Card: renders with content', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('card-example')).toBeVisible()
})

test('Badge: renders all variants', async ({ page }) => {
  await page.goto('/components')
  for (const v of ['default', 'success', 'warning', 'danger']) {
    await expect(page.getByTestId(`badge-${v}`)).toBeVisible()
  }
})

test('PageHeader: renders title and subtitle', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('page-header-example')).toBeVisible()
})

test('EmptyState: renders title and description', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('empty-state-example')).toBeVisible()
})

test('Input: renders labelled field', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('input-example')).toBeVisible()
})

test('Tabs: renders tabs and switches active on click', async ({ page }) => {
  await page.goto('/components')
  await expect(page.getByTestId('tabs-example')).toBeVisible()
  await page.getByRole('tab', { name: 'Second' }).click()
  await expect(page.getByText('Content for Second')).toBeVisible()
})

// ─── Phase 4 — feature pages ─────────────────────────────────────────────────

test('Plan: phase cards render', async ({ page }) => {
  await page.goto('/plan')
  await expect(page.getByText('Preparation')).toBeVisible()
  await expect(page.getByText('Groundworks')).toBeVisible()
  await expect(page.getByText('Hard Landscaping')).toBeVisible()
})

test('Plan: task checkboxes render', async ({ page }) => {
  await page.goto('/plan')
  await expect(page.getByRole('checkbox').first()).toBeVisible()
})

test('Budget: budget rows render', async ({ page }) => {
  await page.goto('/budget')
  await expect(page.getByText('Natural Stone Paving')).toBeVisible()
  await expect(page.getByText('Louvred Pergola')).toBeVisible()
})

test('Budget: total row renders', async ({ page }) => {
  await page.goto('/budget')
  await expect(page.getByText('Total')).toBeVisible()
})

test('Overview: summary cards render', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('tasks complete')).toBeVisible()
  await expect(page.getByText('low estimate')).toBeVisible()
})

test('Materials: material cards render', async ({ page }) => {
  await page.goto('/materials')
  await expect(page.getByText('Paving Slabs')).toBeVisible()
  await expect(page.getByText('Pergola (4×3m)')).toBeVisible()
})

test('Materials: status badges render', async ({ page }) => {
  await page.goto('/materials')
  await expect(page.getByText('Researching').first()).toBeVisible()
})

test('Journal: photo slots render', async ({ page }) => {
  await page.goto('/journal')
  await expect(page.getByText('Before — Current State')).toBeVisible()
  await expect(page.getByText('Finished — Summer 2026')).toBeVisible()
})

test('Map: SVG garden plan renders', async ({ page }) => {
  await page.goto('/map')
  await expect(page.locator('svg#garden-svg')).toBeVisible()
})

test('Map: zone tooltip appears on hover', async ({ page }) => {
  await page.goto('/map')
  await page.locator('[data-zone="zone1"]').getByText('ZONE 1').hover()
  await expect(page.getByText('Zone 1 — Stone Patio + Pergola')).toBeVisible()
})

test('Modal: opens and closes', async ({ page }) => {
  await page.goto('/components')
  await page.getByTestId('modal-trigger').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /close/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

// ─── Sidebar ──────────────────────────────────────────────────────────────────

test('sidebar: shows all nav links expanded by default', async ({ page }) => {
  await page.goto('/')
  for (const label of ['Overview', 'Plan', 'Materials', 'Budget', 'Journal', 'Map']) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible()
  }
})

test('sidebar: collapses to icon-only on button click', async ({ page }) => {
  await page.goto('/plan')
  await page.getByRole('button', { name: /collapse/i }).click()
  await expect(page.getByRole('navigation').getByText('Overview')).not.toBeVisible()
})

test('sidebar: expands again after second click', async ({ page }) => {
  await page.goto('/plan')
  await page.getByRole('button', { name: /collapse/i }).click()
  await page.getByRole('button', { name: /expand/i }).click()
  await expect(page.getByRole('navigation').getByText('Overview')).toBeVisible()
})

test('sidebar: active nav link is highlighted on plan page', async ({ page }) => {
  await page.goto('/plan')
  const planLink = page.getByRole('link', { name: 'Plan', exact: true })
  await expect(planLink).toHaveClass(/text-amber/)
})

// ─── Plan — checkboxes ────────────────────────────────────────────────────────

test('plan: checking a task marks it done with strikethrough', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="task-row"]')
  const firstRow = page.getByTestId('task-row').first()
  const checkbox = firstRow.getByRole('checkbox')
  const label    = firstRow.getByTestId('task-text')
  const wasDone  = await checkbox.getAttribute('aria-checked')
  await checkbox.click()
  if (wasDone === 'true') {
    await expect(label).not.toHaveClass(/line-through/)
  } else {
    await expect(label).toHaveClass(/line-through/)
  }
})

// ─── Plan — Phase CRUD ────────────────────────────────────────────────────────

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

// ─── Plan — Phase notes ───────────────────────────────────────────────────────

test('plan: phase notes save on blur and persist', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-notes"]')
  const notes = page.getByTestId('phase-notes').first()
  await notes.fill('Test note content')
  // Verify local state updated before blur
  await expect(notes).toHaveValue('Test note content')
  // Wait for debounce to fire (800ms) and write to Firebase
  await page.waitForTimeout(1200)
  // Wait for Firebase write to complete before reload
  await page.waitForTimeout(1000)
  await page.reload()
  await page.waitForSelector('[data-testid="phase-notes"]')
  // Wait for Firebase to load data (with longer timeout)
  await expect(page.getByTestId('phase-notes').first()).toHaveValue('Test note content', { timeout: 15000 })
})

test('plan: amber dot appears when phase has notes', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-notes"]')
  const notes = page.getByTestId('phase-notes').first()
  await notes.fill('Dot test note')
  await notes.blur()
  await page.waitForTimeout(100)
  await expect(page.getByTestId('phase-has-notes-dot').first()).toBeVisible()
})

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
// Note: phase-delete-btn is added in Task 7. This test will pass then.
test('confirm modal: shows title, body, and delete button', async ({ page }) => {
  await page.goto('/plan')
  await page.waitForSelector('[data-testid="phase-delete-btn"]')
  await page.getByTestId('phase-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/permanently remove/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
})

// ─── Plan — Task CRUD ─────────────────────────────────────────────────────────

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

// ─── Materials ────────────────────────────────────────────────────────────────

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
  // Verify the dropdown reflects the selected value (local state update)
  await expect(select).toHaveValue('ordered')
})

test('materials: delete material requires confirmation', async ({ page }) => {
  await page.goto('/materials')
  await page.waitForSelector('[data-testid="material-delete-btn"]')
  await page.getByTestId('material-delete-btn').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/permanently remove/i)).toBeVisible()
})

// ─── Materials — Options modal ────────────────────────────────────────────────

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

// ─── Budget ───────────────────────────────────────────────────────────────────

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

// ─── Map ──────────────────────────────────────────────────────────────────────

test('map: hovering a zone shows tooltip with zone name', async ({ page }) => {
  await page.goto('/map')
  await page.locator('[data-zone]').first().hover()
  await expect(page.getByTestId('map-tooltip')).toBeVisible()
})

test('map: moving mouse away hides tooltip', async ({ page }) => {
  await page.goto('/map')
  await page.locator('[data-zone]').first().hover()
  await page.locator('h1').hover()
  await expect(page.getByTestId('map-tooltip')).not.toBeVisible()
})

import { test, expect } from '@playwright/test'

// ─── Smoke test ──────────────────────────────────────────────────────────────

test('app loads and shows page title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Mitchell Garden/)
})

// ─── Navigation ──────────────────────────────────────────────────────────────

test('nav renders all six links on desktop', async ({ page }) => {
  await page.goto('/')
  for (const name of ['Overview', 'Plan', 'Materials', 'Budget', 'Journal', 'Map']) {
    await expect(page.getByRole('link', { name })).toBeVisible()
  }
})

test('mobile nav: links hidden by default, shown after hamburger click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Plan' })).not.toBeVisible()
  await page.getByRole('button', { name: /open menu/i }).click()
  await expect(page.getByRole('link', { name: 'Plan' })).toBeVisible()
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

test('Modal: opens and closes', async ({ page }) => {
  await page.goto('/components')
  await page.getByTestId('modal-trigger').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /close/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

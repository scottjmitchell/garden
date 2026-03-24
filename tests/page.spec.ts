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

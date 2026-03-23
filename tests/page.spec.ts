import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 20000;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Materials are rendered after Firebase resolves — use as load signal
  await page.waitForSelector('#materials-container .material-card', { timeout: LOAD_TIMEOUT });
});

// ─── Page load ───────────────────────────────────────────────────────────────

test('page loads with correct title', async ({ page }) => {
  await expect(page).toHaveTitle('The Mitchell Garden Project');
});

test('hero section shows project title', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Mitchell');
});

test('no console errors on load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.reload();
  await page.waitForSelector('#materials-container .material-card', { timeout: LOAD_TIMEOUT });
  expect(errors).toHaveLength(0);
});

test('hero images load without error', async ({ page }) => {
  const images = page.locator('.photo-placeholder img');
  for (const img of await images.all()) {
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  }
});

// ─── Navigation ──────────────────────────────────────────────────────────────

test('nav links are present', async ({ page }) => {
  for (const label of ['Phases', 'Plan', 'Materials', 'Notes', 'Budget']) {
    await expect(page.locator(`nav a:has-text("${label}")`)).toBeVisible();
  }
});

// ─── Phase tracker ───────────────────────────────────────────────────────────

test('phase tracker renders phases', async ({ page }) => {
  const phases = page.locator('.phases-grid .phase-header');
  await expect(phases.first()).toBeVisible();
  expect(await phases.count()).toBeGreaterThanOrEqual(6);
});

test('phase 0 shows as current', async ({ page }) => {
  await expect(page.locator('.phases-grid').first()).toContainText('Current');
});

test('clicking a collapsed phase expands its task list', async ({ page }) => {
  // Phase 1 (index 1) should be collapsed — click its header to expand
  const phase1Header = page.locator('.phase-header').nth(1);
  await phase1Header.click();
  await expect(page.locator('.phase-tasks').nth(1)).toBeVisible();
});

test('checking a task marks it complete', async ({ page }) => {
  const firstUnchecked = page.locator('.phase-tasks').first()
    .locator('.task-item:not(.done)').first();
  const taskId = await firstUnchecked.getAttribute('data-id');
  // Click the checkbox div (has the onclick handler)
  await firstUnchecked.locator('.task-checkbox').click();
  const byId = page.locator(`.task-item[data-id="${taskId}"]`);
  await expect(byId).toHaveClass(/done/, { timeout: 5000 });
  // Revert
  await byId.locator('.task-checkbox').click();
  await expect(byId).not.toHaveClass(/done/, { timeout: 5000 });
});

test('phase notes textarea is visible in expanded phase', async ({ page }) => {
  await expect(page.locator('.phase-notes-input').first()).toBeVisible();
});

// ─── Materials ───────────────────────────────────────────────────────────────

test('materials section renders cards', async ({ page }) => {
  const cards = page.locator('#materials-container .material-card');
  expect(await cards.count()).toBeGreaterThan(0);
});

test('options button opens the compare modal', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await expect(page.locator('#mat-options-modal')).toHaveClass(/open/);
  await page.locator('#mat-options-modal .mat-modal-close').click();
  await expect(page.locator('#mat-options-modal')).not.toHaveClass(/open/);
});

test('material status picker opens on status button click', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('.material-status').click();
  await expect(page.locator('.mat-status-picker.visible')).toBeVisible();
});

// ─── Photo journal ───────────────────────────────────────────────────────────

test('journal shows 5 photo cards', async ({ page }) => {
  await expect(page.locator('#journal .journal-card')).toHaveCount(5);
});

test('journal cards have upload buttons', async ({ page }) => {
  await expect(page.locator('#journal .journal-upload-btn')).toHaveCount(5);
});

test('journal subtitle mentions syncing across devices', async ({ page }) => {
  await expect(page.locator('#journal .journal-note')).toContainText('Syncs to all devices');
});

// ─── Budget tracker ──────────────────────────────────────────────────────────

test('budget section shows total range', async ({ page }) => {
  await expect(page.locator('.budget-total-range')).toBeVisible();
  await expect(page.locator('.budget-total-range')).toContainText('£');
});

test('budget add item button is present', async ({ page }) => {
  await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
});

test('entering a budget actual shows variance', async ({ page }) => {
  const firstInput = page.locator('.budget-actual-input').first();
  await firstInput.fill('100');
  await firstInput.blur();
  await expect(page.locator('.budget-variance').first()).toBeVisible();
});

// ─── Garden plan ─────────────────────────────────────────────────────────────

test('garden plan section renders', async ({ page }) => {
  await expect(page.locator('#map')).toBeVisible();
});

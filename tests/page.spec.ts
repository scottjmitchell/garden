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

// ─── Materials options modal enhancements (issue #10) ────────────────────────

async function openModalAndAddOption(page: any) {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await expect(page.locator('#mat-options-modal')).toHaveClass(/open/);
  await page.locator('#mat-modal-add-btn').click();
  await expect(page.locator('#mat-modal-body .mat-opt-card').first()).toBeVisible();
}

test('option cards show image upload area', async ({ page }) => {
  await openModalAndAddOption(page);
  await expect(page.locator('#mat-modal-body .mat-opt-img-area').first()).toBeVisible();
});

test('status chips show shortlisted, ordered, and rejected', async ({ page }) => {
  await openModalAndAddOption(page);
  const chips = page.locator('#mat-modal-body .mat-opt-chips').first();
  await expect(chips.locator('button:has-text("Shortlisted")')).toBeVisible();
  await expect(chips.locator('button:has-text("Ordered")')).toBeVisible();
  await expect(chips.locator('button:has-text("Rejected")')).toBeVisible();
});

test('compare mode toggle expands modal and switches layout', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await expect(page.locator('#mat-options-modal')).toHaveClass(/open/);
  await page.locator('#mat-modal-compare-btn').click();
  await expect(page.locator('#mat-options-modal')).toHaveClass(/compare-mode/);
  await page.locator('#mat-modal-compare-btn').click();
  await expect(page.locator('#mat-options-modal')).not.toHaveClass(/compare-mode/);
});

test('cost bar element is present in option cards', async ({ page }) => {
  await openModalAndAddOption(page);
  await expect(page.locator('#mat-modal-body .mat-opt-cost-bar').first()).toBeAttached();
});

test('clicking image zone arms it for paste', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await expect(page.locator('#mat-options-modal')).toHaveClass(/open/);
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  await zone.click();
  await expect(zone).toHaveClass(/armed/);
});

test('armed state clears when clicking outside image zone', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  await zone.click();
  await expect(zone).toHaveClass(/armed/);
  // Click somewhere else in the modal body that isn't an image zone
  await page.locator('#mat-modal-body .mat-opt-name').first().click();
  await expect(zone).not.toHaveClass(/armed/);
});

test('drag over image zone adds drag-over highlight class', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  await zone.dispatchEvent('dragover');
  await expect(zone).toHaveClass(/drag-over/);
});

test('dragleave with relatedTarget inside zone does not remove drag-over', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  // Arm the drag-over state first
  await zone.dispatchEvent('dragover');
  await expect(zone).toHaveClass(/drag-over/);
  // Simulate dragleave where relatedTarget is a child element (placeholder icon) inside the zone
  await zone.evaluate((el) => {
    const child = el.querySelector('svg') || el.firstElementChild || el;
    const event = new DragEvent('dragleave', { bubbles: true, relatedTarget: child });
    el.dispatchEvent(event);
  });
  // drag-over should remain because relatedTarget is inside the zone
  await expect(zone).toHaveClass(/drag-over/);
});

test('compare mode resets scroll position to top', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  // Scroll the body down in list mode
  await page.locator('#mat-modal-body').evaluate(el => { el.scrollTop = 200; });
  const scrollBefore = await page.locator('#mat-modal-body').evaluate(el => el.scrollTop);
  expect(scrollBefore).toBeGreaterThan(0);
  // Toggle compare mode
  await page.locator('#mat-modal-compare-btn').click();
  const scrollAfter = await page.locator('#mat-modal-body').evaluate(el => el.scrollTop);
  expect(scrollAfter).toBe(0);
});

test('image zone height is at least 180px', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  const height = await zone.evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(180);
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

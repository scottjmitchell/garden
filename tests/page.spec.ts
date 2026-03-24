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

// ─── Budget variance labels (issue #14) ──────────────────────────────────────

test('budget variance shows On target when actual equals midpoint', async ({ page }) => {
  const firstRow = page.locator('#budget-items-body .budget-row').first();
  // Read low and high from the DOM to compute midpoint
  const low  = await firstRow.locator('.budget-low').evaluate(el => parseFloat(el.textContent!.replace(/[^0-9.]/g, '')));
  const high = await firstRow.locator('.budget-high').evaluate(el => parseFloat(el.textContent!.replace(/[^0-9.]/g, '')));
  const mid  = Math.round((low + high) / 2);
  const input = firstRow.locator('.budget-actual-input');
  await input.fill(String(mid));
  await input.dispatchEvent('input');
  await expect(firstRow.locator('.budget-variance')).toHaveText('On target');
});

test('budget variance does not show 0% under', async ({ page }) => {
  const firstRow = page.locator('#budget-items-body .budget-row').first();
  const low  = await firstRow.locator('.budget-low').evaluate(el => parseFloat(el.textContent!.replace(/[^0-9.]/g, '')));
  const high = await firstRow.locator('.budget-high').evaluate(el => parseFloat(el.textContent!.replace(/[^0-9.]/g, '')));
  const mid  = Math.round((low + high) / 2);
  const input = firstRow.locator('.budget-actual-input');
  await input.fill(String(mid));
  await input.dispatchEvent('input');
  const text = await firstRow.locator('.budget-variance').textContent();
  expect(text).not.toBe('0% under');
});

test('budget variance under label shows for values below midpoint', async ({ page }) => {
  const input = page.locator('.budget-actual-input').first();
  await input.fill('1');
  await input.dispatchEvent('input');
  const text = await page.locator('.budget-variance').first().textContent();
  expect(text).toContain('under');
});

// ─── Garden plan ─────────────────────────────────────────────────────────────

test('garden plan section renders', async ({ page }) => {
  await expect(page.locator('#map')).toBeVisible();
});

// ─── Nav logo link ────────────────────────────────────────────────────────────

test('nav logo is a link to the top of the page', async ({ page }) => {
  const logo = page.locator('.nav-logo');
  await expect(logo).toHaveAttribute('href', '#');
});

test('nav logo has pointer cursor', async ({ page }) => {
  const logo = page.locator('.nav-logo');
  const cursor = await logo.evaluate(el => getComputedStyle(el).cursor);
  expect(cursor).toBe('pointer');
});

test('nav logo scrolls to top on click', async ({ page }) => {
  // Scroll down first
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForFunction(() => window.scrollY > 0);
  await page.locator('.nav-logo').click();
  await page.waitForFunction(() => window.scrollY === 0, { timeout: 3000 });
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
});

// ─── Material option URL link (issue #11) ────────────────────────────────────

test('url link is hidden when option has no url', async ({ page }) => {
  await openModalAndAddOption(page);
  await expect(page.locator('#mat-modal-body .mat-opt-url-link').first()).toBeHidden();
});

test('entering a url shows a link with the correct domain label', async ({ page }) => {
  await openModalAndAddOption(page);
  const urlInput = page.locator('#mat-modal-body .mat-opt-field[type="url"]').first();
  await urlInput.fill('https://www.wickes.co.uk/some-product');
  await urlInput.dispatchEvent('input');
  const link = page.locator('#mat-modal-body .mat-opt-url-link').first();
  await expect(link).toBeVisible();
  await expect(link).toContainText('wickes.co.uk');
});

test('url link has target blank and rel noopener', async ({ page }) => {
  await openModalAndAddOption(page);
  const urlInput = page.locator('#mat-modal-body .mat-opt-field[type="url"]').first();
  await urlInput.fill('https://www.wickes.co.uk/some-product');
  await urlInput.dispatchEvent('input');
  const link = page.locator('#mat-modal-body .mat-opt-url-link').first();
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener');
});

test('mat-print-options is hidden in screen mode', async ({ page }) => {
  // Open modal, add option with a URL, close modal — then check print block is hidden
  await openModalAndAddOption(page);
  const urlInput = page.locator('#mat-modal-body .mat-opt-field[type="url"]').first();
  await urlInput.fill('https://www.wickes.co.uk/some-product');
  await urlInput.dispatchEvent('input');
  await page.locator('#mat-options-modal .mat-modal-close').click();
  // re-render fires on close — check the print block is in DOM but hidden
  const printBlock = page.locator('.material-card .mat-print-options').first();
  // either not present or hidden
  const count = await printBlock.count();
  if (count > 0) {
    const display = await printBlock.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  }
});

// ─── Hero layout ─────────────────────────────────────────────────────────────

test('hero text is centred', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const textAlign = await page.locator('.hero-title').evaluate(el => getComputedStyle(el).textAlign);
  expect(textAlign).toBe('center');
});

test('hero photo strip sits below the text zone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const textBottom = await page.locator('.hero-text').evaluate(el => el.getBoundingClientRect().bottom);
  const photoTop   = await page.locator('.hero-photo-strip').evaluate(el => el.getBoundingClientRect().top);
  expect(photoTop).toBeGreaterThanOrEqual(textBottom - 1);
});

test('hero photo strip is full width of the hero section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const heroWidth  = await page.locator('#hero').evaluate(el => el.getBoundingClientRect().width);
  const stripWidth = await page.locator('.hero-photo-strip').evaluate(el => el.getBoundingClientRect().width);
  // Strip should be at least 80% of the hero section width (full-bleed)
  expect(stripWidth).toBeGreaterThan(heroWidth * 0.8);
});

// ─── Budget total variance ────────────────────────────────────────────────────

test('budget total variance is hidden when no actuals entered', async ({ page }) => {
  // Clear any pre-filled actuals
  for (const input of await page.locator('.budget-actual-input').all()) {
    await input.fill('');
    await input.blur();
  }
  await expect(page.locator('#budget-total-variance')).toBeHidden();
});

test('budget total variance shows under budget when actual is below midpoint', async ({ page }) => {
  const firstInput = page.locator('.budget-actual-input').first();
  await firstInput.fill('1');
  await firstInput.blur();
  await expect(page.locator('#budget-total-variance')).toBeVisible();
  await expect(page.locator('#budget-total-variance')).toContainText('under budget');
});

test('budget total variance shows over budget when actual is above midpoint', async ({ page }) => {
  const firstInput = page.locator('.budget-actual-input').first();
  await firstInput.fill('999999');
  await firstInput.blur();
  await expect(page.locator('#budget-total-variance')).toBeVisible();
  await expect(page.locator('#budget-total-variance')).toContainText('over budget');
});

test('budget total variance updates when a second actual is entered', async ({ page }) => {
  const inputs = page.locator('.budget-actual-input');
  await inputs.nth(0).fill('1');
  await inputs.nth(0).blur();
  const textBefore = await page.locator('#budget-total-variance').textContent();
  await inputs.nth(1).fill('1');
  await inputs.nth(1).blur();
  const textAfter = await page.locator('#budget-total-variance').textContent();
  // Both values are tiny so should still be "under budget", but the amount changes
  expect(textBefore).toContain('under budget');
  expect(textAfter).toContain('under budget');
  expect(textBefore).not.toBe(textAfter);
});

// ─── Budget table mobile layout (issue #20) ───────────────────────────────────

test('budget header row is hidden at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const display = await page.locator('.budget-row.header').evaluate(el => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('budget low estimate is visible at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const firstRow = page.locator('#budget-items-body .budget-row').first();
  await expect(firstRow.locator('.budget-low')).toBeVisible();
});

test('budget action buttons are at least 44px tall at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const firstRow = page.locator('#budget-items-body .budget-row').first();
  const btn = firstRow.locator('.budget-action-btn').first();
  const height = await btn.evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(44);
});

test('budget actual input is at least 120px wide at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const input = page.locator('.budget-actual-input').first();
  const width = await input.evaluate(el => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThanOrEqual(120);
});

# Image Paste Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clipboard paste (Cmd+V) and drag-and-drop support to material option image zones so users can copy an image from a supplier webpage and paste it directly into a card.

**Architecture:** All changes are in `index.html` (single-file vanilla JS/CSS app). A new `matPasteTargetIdx` state variable tracks which card is "armed" for paste. CSS handles armed/drag-over visual states. A scoped paste event listener is attached/detached with the modal lifecycle. Drag-and-drop handlers are added inline during `renderModalOptions`.

**Tech Stack:** Vanilla JS, custom CSS, Firebase Storage (existing `uploadOptionImage` function reused), Playwright for automated tests.

---

## File map

| File | Changes |
|------|---------|
| `index.html` | CSS (~line 1307 area), JS modal section (~line 5493), existing keydown listener (~line 5488), existing click listener (~line 5759) |
| `tests/page.spec.ts` | 3 new automated tests (paste tests are manual-only) |

---

### Task 1: Write failing tests

**Files:**
- Modify: `tests/page.spec.ts`

- [ ] **Step 1.1: Add 4 failing tests after the existing material options tests**

```typescript
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
  await zone.dispatchEvent('dragover', { dataTransfer: {} });
  await expect(zone).toHaveClass(/drag-over/);
});

test('dragleave with relatedTarget inside zone does not remove drag-over', async ({ page }) => {
  await page.locator('#materials-container .material-card').first()
    .locator('button.mat-options-btn').click();
  await page.locator('#mat-modal-add-btn').click();
  const zone = page.locator('#mat-modal-body .mat-opt-img-area').first();
  // Arm the drag-over state first
  await zone.dispatchEvent('dragover', { dataTransfer: {} });
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
```

- [ ] **Step 1.2: Run tests to confirm they all fail**

```bash
cd /Users/scottmitchell/ai/garden
npx playwright test --grep "clicking image zone arms|armed state clears|drag over image zone|dragleave with relatedTarget"
```

Expected: 4 failures (`armed` class doesn't exist yet, `drag-over` class not implemented).

- [ ] **Step 1.3: Commit the failing tests**

```bash
git add tests/page.spec.ts
git commit -m "test: add failing tests for paste-arm and drag-over states"
```

> **Note:** `getMaterialOptions(key)` already exists at `index.html:5513` — it returns `migrateMaterialOptions(DB_STATE.materialOpts[key] || [])`. Safe to call in `handleModalPaste`.

---

### Task 2: CSS — armed and drag-over states

**Files:**
- Modify: `index.html` — CSS section, inside the `/* Option cards inside modal */` block (~line 1307)

- [ ] **Step 2.1: Add armed and drag-over styles**

Find the existing `.mat-opt-img-area:hover` rule (added in issue #10) and add these rules directly after it:

```css
.mat-opt-img-area.armed {
  border-style: solid;
  border-color: rgba(94, 117, 88, 0.6);
  background: rgba(61, 82, 57, 0.12);
  box-shadow: 0 0 0 3px rgba(94, 117, 88, 0.12);
}
.mat-opt-img-area.drag-over {
  border-style: solid;
  border-color: rgba(200, 146, 42, 0.5);
  background: rgba(200, 146, 42, 0.06);
}
```

- [ ] **Step 2.2: Run all tests (CSS-only change, all should still pass)**

```bash
cd /Users/scottmitchell/ai/garden && npx playwright test
```

Expected: same pass/fail counts as before (the 3 new tests still fail, everything else passes).

- [ ] **Step 2.3: Commit**

```bash
git add index.html
git commit -m "style: add armed and drag-over CSS states for image zones"
```

---

### Task 3: Update image zone template — armed placeholder + file link

**Files:**
- Modify: `index.html` — `renderModalOptions` function (~line 5555)

The current template renders the image zone with a static placeholder. We need to:
1. Wire the zone click to `armImageZone(key, idx)` instead of `document.getElementById(...).click()`
2. Show a "or pick a file" link inside the armed state (rendered via JS since armed state is toggled dynamically, not re-rendered)

- [ ] **Step 3.1: Update the image zone HTML in `renderModalOptions`**

Find this block in `renderModalOptions` (the `mat-opt-img-area` div):

```js
    const imgHtml = opt.imageUrl
      ? `<img src="${escHtml(opt.imageUrl)}" alt="">`
      : `<svg class="mat-opt-img-placeholder-icon" ...>...
         <span class="mat-opt-img-placeholder-text">Add photo</span>`;
    return `
      ...
      <div class="mat-opt-img-area${opt.imageUrl ? ' has-image' : ''}"
        onclick="document.getElementById('mat-opt-img-input-${key}-${idx}').click()">
        ${imgHtml}
        <input class="mat-opt-img-input" id="mat-opt-img-input-${key}-${idx}" ...>
      </div>
```

Replace with:

```js
    const imgHtml = opt.imageUrl
      ? `<img src="${escHtml(opt.imageUrl)}" alt="">`
      : `<svg class="mat-opt-img-placeholder-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
           <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
           <polyline points="21,15 16,10 5,21"/>
         </svg>
         <span class="mat-opt-img-placeholder-text">Add photo</span>`;
    return `
      ...
      <div class="mat-opt-img-area${opt.imageUrl ? ' has-image' : ''}"
        id="mat-opt-img-area-${key}-${idx}"
        onclick="armImageZone('${key}', ${idx})"
        ondragover="event.preventDefault(); this.classList.add('drag-over')"
        ondragleave="if(!this.contains(event.relatedTarget)) this.classList.remove('drag-over')"
        ondrop="event.preventDefault(); this.classList.remove('drag-over'); if(event.dataTransfer.files[0]) uploadOptionImage('${key}', ${idx}, event.dataTransfer.files[0])">
        ${imgHtml}
        <input class="mat-opt-img-input" id="mat-opt-img-input-${key}-${idx}" type="file" accept="image/*"
          onchange="uploadOptionImage('${key}', ${idx}, this.files[0])">
      </div>
```

Key changes:
- `onclick` now calls `armImageZone` instead of directly opening the file picker
- Added `id` to the zone so `setArmedZone` can find it by key+idx
- Added inline `ondragover`, `ondragleave`, `ondrop` handlers

- [ ] **Step 3.2: Run tests**

```bash
npx playwright test
```

Expected: drag-over test now passes (3 → 2 failures). Armed tests still fail (function not yet defined).

- [ ] **Step 3.3: Commit**

```bash
git add index.html
git commit -m "feat: wire image zone click to arm handler and add drag-and-drop"
```

---

### Task 3b: CSS — armed-state placeholder content

The armed zone needs to show different placeholder content (clipboard icon + "Cmd+V to paste" + file fallback link). Because the zone's inner HTML is static after render, we swap content via CSS `display` toggling rather than a JS re-render — this avoids resetting file inputs mid-interaction.

**Files:**
- Modify: `index.html` — CSS section and `renderModalOptions` template

- [ ] **Step 3b.1: Add always-present armed-content div to the image zone template in `renderModalOptions`**

Inside the image zone div (after the `${imgHtml}` and `<input>` lines), add:

```html
<div class="mat-opt-img-armed-content">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
  <span class="mat-opt-img-armed-label">Cmd+V to paste</span>
  <button class="mat-opt-img-file-link"
    onclick="event.stopPropagation(); document.getElementById('mat-opt-img-input-${key}-${idx}').click()">
    or pick a file
  </button>
</div>
```

This div is hidden by default and shown only when the zone has the `armed` class.

- [ ] **Step 3b.2: Add CSS to show/hide the armed content**

Add these rules after the `.mat-opt-img-area.armed` rule added in Task 2:

```css
.mat-opt-img-armed-content {
  display: none;
  position: absolute;
  inset: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  pointer-events: none;
}
.mat-opt-img-area.armed .mat-opt-img-armed-content {
  display: flex;
}
.mat-opt-img-area.armed .mat-opt-img-armed-content { pointer-events: auto; }
/* Hide default placeholder when armed */
.mat-opt-img-area.armed .mat-opt-img-placeholder-icon,
.mat-opt-img-area.armed .mat-opt-img-placeholder-text {
  display: none;
}
.mat-opt-img-armed-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: #8fad88;
  letter-spacing: 0.04em;
}
.mat-opt-img-file-link {
  font-family: var(--font-sans);
  font-size: 9px;
  color: #5e7558;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  letter-spacing: 0.04em;
}
.mat-opt-img-file-link:hover { color: #8fad88; }
```

Note: the `onclick` on the file link uses `event.stopPropagation()` to prevent the click from bubbling up to the zone's `armImageZone` handler (which would re-arm instead of opening the picker).

- [ ] **Step 3b.3: Run all tests — no regressions expected**

```bash
npx playwright test
```

- [ ] **Step 3b.4: Commit**

```bash
git add index.html
git commit -m "feat: show paste instructions in armed image zone state"
```

---

### Task 4: JS — `armImageZone` and `setArmedZone`

**Files:**
- Modify: `index.html` — just after `let matModalKey = null;` declaration (~line 5518)

- [ ] **Step 4.1: Add state variable and helper functions**

Find `let matModalKey = null;` and add directly after it:

```js
let matPasteTargetIdx = null;

function setArmedZone(idx) {
  // Remove armed class from previously armed zone
  if (matPasteTargetIdx !== null && matModalKey) {
    const prev = document.getElementById(`mat-opt-img-area-${matModalKey}-${matPasteTargetIdx}`);
    if (prev) prev.classList.remove('armed');
  }
  matPasteTargetIdx = idx;
  if (idx !== null && matModalKey) {
    const zone = document.getElementById(`mat-opt-img-area-${matModalKey}-${idx}`);
    if (zone) zone.classList.add('armed');
  }
}

function armImageZone(key, idx) {
  setArmedZone(idx);
}
```

- [ ] **Step 4.2: Run the armed-state tests**

```bash
npx playwright test --grep "clicking image zone arms|armed state clears"
```

Expected: "clicking image zone arms it" now passes. "armed state clears" may still fail (disarm on outside click not wired yet).

---

### Task 5: JS — disarm on outside click and Escape

**Files:**
- Modify: `index.html` — existing `document.addEventListener('click', ...)` at ~line 5759, and existing `document.addEventListener('keydown', ...)` at ~line 5488

- [ ] **Step 5.1: Add disarm to the existing click listener**

Find this block (~line 5759):

```js
document.addEventListener('click', (e) => {
  if (!e.target.closest('.material-status') && !e.target.closest('.mat-status-picker')) {
    document.querySelectorAll('.mat-status-picker').forEach(p => p.classList.remove('visible'));
  }
});
```

Add one line inside it:

```js
document.addEventListener('click', (e) => {
  if (!e.target.closest('.material-status') && !e.target.closest('.mat-status-picker')) {
    document.querySelectorAll('.mat-status-picker').forEach(p => p.classList.remove('visible'));
  }
  if (matModalKey && !e.target.closest('.mat-opt-img-area')) {
    setArmedZone(null);
  }
});
```

- [ ] **Step 5.2: Add disarm to the existing keydown listener**

Find this block (~line 5488):

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && matModalKey) closeMaterialOptions();
  else if (e.key === 'Escape') closeTaskDrawer();
});
```

Change to:

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && matModalKey) {
    if (matPasteTargetIdx !== null) {
      setArmedZone(null); // first Escape disarms; second Escape closes modal
    } else {
      closeMaterialOptions();
    }
  } else if (e.key === 'Escape') {
    closeTaskDrawer();
  }
});
```

- [ ] **Step 5.3: Also reset arm state in `closeMaterialOptions`**

Find `closeMaterialOptions()` and add `setArmedZone(null);` before the classList removes:

```js
function closeMaterialOptions() {
  setArmedZone(null);
  matModalKey = null;
  document.getElementById('mat-options-backdrop').classList.remove('open');
  const modal = document.getElementById('mat-options-modal');
  modal.classList.remove('open');
  modal.classList.remove('compare-mode');
  const btn = document.getElementById('mat-modal-compare-btn');
  if (btn) btn.classList.remove('active');
}
```

- [ ] **Step 5.4: Run the armed-state tests — both should now pass**

```bash
npx playwright test --grep "clicking image zone arms|armed state clears"
```

Expected: both pass.

- [ ] **Step 5.5: Commit**

```bash
git add index.html
git commit -m "feat: add arm/disarm logic for image zone paste targeting"
```

---

### Task 6: JS — clipboard paste handler

**Files:**
- Modify: `index.html` — `openMaterialOptions` and `closeMaterialOptions` functions, plus new `handleModalPaste` function

- [ ] **Step 6.1: Add `handleModalPaste` function**

Add this function right after `armImageZone`:

```js
function handleModalPaste(e) {
  if (!matModalKey) return;
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  let imageFile = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      imageFile = items[i].getAsFile();
      break;
    }
  }
  if (!imageFile) return;
  e.preventDefault();
  // Determine target: armed card, or first card without an image
  const options = getMaterialOptions(matModalKey);
  let targetIdx = matPasteTargetIdx;
  if (targetIdx === null) {
    targetIdx = options.findIndex(o => !o.imageUrl);
  }
  if (targetIdx === -1 || targetIdx === null) return;
  setArmedZone(null);
  uploadOptionImage(matModalKey, targetIdx, imageFile);
}
```

- [ ] **Step 6.2: Attach/detach paste listener in `openMaterialOptions` and `closeMaterialOptions`**

Find `openMaterialOptions`:

```js
function openMaterialOptions(key) {
  const mEntry = Object.values(DB_STATE.materials).find(m => escapeMaterialKey(m.name) === key);
  matModalKey = key;
  document.getElementById('mat-modal-eyebrow').textContent = (mEntry ? mEntry.name : key) + ' — Options';
  document.getElementById('mat-modal-add-btn').onclick = () => addModalOption(key);
  renderModalOptions(key);
  document.getElementById('mat-options-backdrop').classList.add('open');
  document.getElementById('mat-options-modal').classList.add('open');
}
```

Add `document.addEventListener('paste', handleModalPaste);` at the end:

```js
function openMaterialOptions(key) {
  const mEntry = Object.values(DB_STATE.materials).find(m => escapeMaterialKey(m.name) === key);
  matModalKey = key;
  document.getElementById('mat-modal-eyebrow').textContent = (mEntry ? mEntry.name : key) + ' — Options';
  document.getElementById('mat-modal-add-btn').onclick = () => addModalOption(key);
  renderModalOptions(key);
  document.getElementById('mat-options-backdrop').classList.add('open');
  document.getElementById('mat-options-modal').classList.add('open');
  document.addEventListener('paste', handleModalPaste);
}
```

In `closeMaterialOptions`, add `document.removeEventListener('paste', handleModalPaste);`:

```js
function closeMaterialOptions() {
  setArmedZone(null);
  matModalKey = null;
  document.removeEventListener('paste', handleModalPaste);
  document.getElementById('mat-options-backdrop').classList.remove('open');
  const modal = document.getElementById('mat-options-modal');
  modal.classList.remove('open');
  modal.classList.remove('compare-mode');
  const btn = document.getElementById('mat-modal-compare-btn');
  if (btn) btn.classList.remove('active');
}
```

- [ ] **Step 6.3: Run all tests**

```bash
npx playwright test
```

Expected: all 27 tests pass (paste itself is not automatable, but no regressions).

- [ ] **Step 6.4: Commit**

```bash
git add index.html
git commit -m "feat: add clipboard paste support for option image zones"
```

---

### Task 7: Deploy and verify

- [ ] **Step 7.1: Push to deploy**

```bash
git push origin master
```

- [ ] **Step 7.2: Wait for GitHub Pages deployment**

```bash
gh run list --limit 1
# Wait for status: completed success
```

- [ ] **Step 7.3: Run tests against live site**

```bash
npx playwright test
```

Expected: all 27 tests pass.

- [ ] **Step 7.4: Manual smoke test**

1. Open `https://garden.scottjmitchell.com`
2. Open any material's options modal, add an option if empty
3. Go to a supplier page in another tab, right-click a product image → Copy Image
4. Return to the modal, click an image zone — verify it turns green with "Cmd+V to paste"
5. Press Cmd+V — verify the image uploads and appears in the card
6. Test Escape to disarm without pasting
7. Test drag-and-drop: drag an image file from Finder onto a zone

- [ ] **Step 7.5: Close GitHub issue if applicable**

```bash
# If this work is tracked in a GitHub issue:
gh issue close <number> --repo scottjmitchell/garden --comment "Clipboard paste and drag-and-drop added for option image zones."
```

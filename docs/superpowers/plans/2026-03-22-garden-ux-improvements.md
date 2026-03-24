# Garden Site UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-card material options panel with a centred modal, add a per-option status chip system, and apply four smaller UX polish improvements found during audit.

**Architecture:** All changes are to the single file `garden/index.html` which contains HTML, CSS, and JS inline. The modal follows the same fixed-overlay pattern as the existing task detail drawer. No build tools, no test framework — verification is done by opening in Safari and testing interactions manually.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage for persistence, no dependencies.

---

## File Map

| File | Changes |
|------|---------|
| `garden/index.html` | All changes — CSS additions/removals, HTML additions, JS additions/removals |

---

### Task 1: Data migration helper

Add a migration function that converts legacy `selected: boolean` to `optionStatus: string` on read, so existing data isn't lost.

**Files:**
- Modify: `garden/index.html` — JS section (MATERIAL OPTIONS block, around line 3851)

- [ ] **Step 1: Add `migrateMaterialOptions` function**

Find the `getMaterialOptions` function (around line 3851). Add the migration helper immediately above it, then call it inside `getMaterialOptions`:

```js
function migrateMaterialOptions(options) {
  return options.map(opt => {
    if ('selected' in opt && !('optionStatus' in opt)) {
      return { ...opt, optionStatus: opt.selected ? 'favourite' : null };
    }
    return opt;
  });
}

function getMaterialOptions(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(`garden-material-opts-${key}`)) || [];
    return migrateMaterialOptions(raw);
  }
  catch { return []; }
}
```

Replace the existing `getMaterialOptions` function entirely.

- [ ] **Step 2: Verify in browser**

Open `garden/index.html` in Safari. Open DevTools console. Run:
```js
localStorage.setItem('garden-material-opts-test', JSON.stringify([{label:'Test',selected:true,url:'',price:'',notes:''}]));
getMaterialOptions('test');
```
Expected: `[{label:'Test', selected:true, optionStatus:'favourite', url:'', price:'', notes:''}]`

- [ ] **Step 3: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: add material option data migration (selected → optionStatus)"
```

---

### Task 2: Modal HTML + backdrop

Add the modal shell and backdrop to the DOM. No logic yet — just the structure.

**Files:**
- Modify: `garden/index.html` — end of `<body>`, after the task drawer elements

- [ ] **Step 1: Add modal HTML**

Find the closing `</body>` tag. The task drawer backdrop and drawer will be just above it. After the task drawer `</div>` blocks, add:

```html
<!-- Material Options Modal -->
<div id="mat-options-backdrop" onclick="closeMaterialOptions()"></div>
<div id="mat-options-modal" role="dialog" aria-modal="true" aria-labelledby="mat-modal-title">
  <div class="mat-modal-header">
    <div>
      <div class="mat-modal-eyebrow" id="mat-modal-eyebrow"></div>
      <div class="mat-modal-title" id="mat-modal-title">Compare choices</div>
    </div>
    <button class="mat-modal-close" onclick="closeMaterialOptions()" title="Close" aria-label="Close options">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
        <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
      </svg>
    </button>
  </div>
  <div class="mat-modal-body" id="mat-modal-body"></div>
  <div class="mat-modal-footer">
    <button class="mat-modal-add-btn" id="mat-modal-add-btn">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
        <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
      </svg>
      Add option
    </button>
    <span class="mat-modal-autosave">Saves automatically</span>
  </div>
</div>
```

- [ ] **Step 2: Verify HTML exists**

Open in Safari, open DevTools Elements panel. Confirm `#mat-options-modal` and `#mat-options-backdrop` exist as direct children of `<body>`.

- [ ] **Step 3: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: add material options modal HTML shell"
```

---

### Task 3: Modal CSS

Add all CSS for the modal and remove the old inline options CSS.

**Files:**
- Modify: `garden/index.html` — `<style>` block

- [ ] **Step 1: Remove old inline options CSS**

Find and delete these CSS rules (around line 1075–1106):
- `.mat-options-toggle { ... }`
- `.mat-options-toggle:hover { ... }`
- `.mat-options-toggle.open { ... }`
- `.mat-options-panel { ... }`
- `.mat-options-list { ... }`

- [ ] **Step 2: Add modal CSS**

Add the following CSS block after the `/* MATERIALS */` section CSS (after the `.material-suppliers` rules, around line 1040):

```css
/* ============================================================
   MATERIAL OPTIONS MODAL
============================================================ */
#mat-options-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(11, 14, 10, 0.75);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 909;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}
#mat-options-backdrop.open { opacity: 1; pointer-events: auto; }

#mat-options-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%) scale(0.97);
  width: calc(100% - 48px);
  max-width: 560px;
  max-height: 82vh;
  background: var(--bg-raised);
  border: 1px solid rgba(200, 146, 42, 0.18);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  z-index: 910;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
  overflow: hidden;
}
#mat-options-modal.open {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}

.mat-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.mat-modal-eyebrow {
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 4px;
}
.mat-modal-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-style: italic;
  font-weight: 300;
  color: var(--text);
  line-height: 1.2;
}
.mat-modal-close {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: border-color 0.15s, color 0.15s;
  padding: 0;
}
.mat-modal-close:hover { border-color: var(--border-strong); color: var(--text); }

.mat-modal-body {
  overflow-y: auto;
  padding: 20px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}

.mat-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.mat-modal-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 7px 14px;
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s;
}
.mat-modal-add-btn:hover { border-color: rgba(200, 146, 42, 0.4); color: var(--amber-light); }
.mat-modal-autosave {
  font-family: var(--font-sans);
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

/* Option cards inside modal */
.mat-opt-card {
  background: rgba(168, 155, 120, 0.03);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  transition: border-color 0.18s;
  flex-shrink: 0;
}
.mat-opt-card.status-favourite {
  border-color: rgba(200, 146, 42, 0.3);
  background: rgba(200, 146, 42, 0.035);
}
.mat-opt-card.status-rejected {
  opacity: 0.55;
}

.mat-opt-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.mat-opt-name {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  padding: 3px 0;
  outline: none;
  transition: border-color 0.15s;
  min-width: 0;
}
.mat-opt-card.status-rejected .mat-opt-name {
  text-decoration: line-through;
  text-decoration-color: rgba(168, 155, 120, 0.4);
  color: var(--text-dim);
}
.mat-opt-name:focus { border-bottom-color: rgba(200, 146, 42, 0.4); }
.mat-opt-name::placeholder { color: var(--text-dim); }

.mat-opt-chips {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.mat-opt-chip {
  font-family: var(--font-sans);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 2px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.mat-opt-chip:hover { border-color: var(--border-strong); color: var(--text-muted); }
.mat-opt-chip.chip-considering { border-color: rgba(94,117,88,0.5); color: var(--moss-light); background: rgba(61,82,57,0.15); }
.mat-opt-chip.chip-favourite   { border-color: rgba(200,146,42,0.45); color: var(--amber-light); background: var(--amber-glow); }
.mat-opt-chip.chip-rejected    { border-color: rgba(158,78,36,0.4); color: #b07060; background: rgba(158,78,36,0.1); }

.mat-opt-delete {
  width: 24px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  transition: border-color 0.15s, color 0.15s;
}
.mat-opt-delete:hover { border-color: rgba(158, 78, 36, 0.4); color: #b07060; }

.mat-opt-row-fields {
  display: grid;
  grid-template-columns: 1fr 90px;
  gap: 8px;
  margin-bottom: 8px;
}
.mat-opt-field {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 300;
  padding: 6px 9px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.mat-opt-field:focus { border-color: rgba(200, 146, 42, 0.35); color: var(--text); }
.mat-opt-field::placeholder { color: var(--text-dim); }

.mat-opt-notes {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 300;
  padding: 6px 9px;
  outline: none;
  resize: none;
  width: 100%;
  min-height: 44px;
  field-sizing: content;
  line-height: 1.6;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.mat-opt-notes:focus { border-color: rgba(200, 146, 42, 0.35); color: var(--text); }
.mat-opt-notes::placeholder { color: var(--text-dim); }

/* Options button on material card */
.mat-options-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s;
  margin-top: 12px;
}
.mat-options-btn:hover { border-color: rgba(200, 146, 42, 0.35); color: var(--amber-light); }
.mat-options-btn.has-favourite {
  border-color: rgba(200, 146, 42, 0.3);
  color: var(--amber-light);
}
.mat-options-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--amber);
  flex-shrink: 0;
}
```

- [ ] **Step 3: Verify in browser**

Open in Safari. The page should look identical to before (modal is hidden). No visual regressions on the materials grid.

- [ ] **Step 4: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: add material options modal CSS, remove old inline-options CSS"
```

---

### Task 4: Modal open/close + keyboard JS

Wire up the modal open/close logic.

**Files:**
- Modify: `garden/index.html` — MATERIAL OPTIONS JS section (around line 3844)

- [ ] **Step 1: Add `openMaterialOptions` and `closeMaterialOptions`**

Find the `/* MATERIAL OPTIONS */` comment block. Replace the existing `toggleMaterialOptions` function with these two functions:

```js
let matModalKey = null;
let matModalSaveTimers = {};

function openMaterialOptions(key, name) {
  matModalKey = key;
  document.getElementById('mat-modal-eyebrow').textContent = name + ' — Options';
  document.getElementById('mat-modal-add-btn').onclick = () => addModalOption(key);
  renderModalOptions(key);
  document.getElementById('mat-options-backdrop').classList.add('open');
  document.getElementById('mat-options-modal').classList.add('open');
  document.getElementById('mat-options-modal').focus();
}

function closeMaterialOptions() {
  matModalKey = null;
  document.getElementById('mat-options-backdrop').classList.remove('open');
  document.getElementById('mat-options-modal').classList.remove('open');
}
```

- [ ] **Step 2: Add Escape key listener**

Find the `window.addEventListener('keydown', ...)` block near the bottom of the JS, or add a new one after the `closeMaterialOptions` function:

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && matModalKey) closeMaterialOptions();
});
```

- [ ] **Step 3: Verify in browser**

Open in Safari. Temporarily add `openMaterialOptions('test', 'Test Material')` to the console. The modal should animate in. Press Escape — it should close. Click the backdrop — it should close.

- [ ] **Step 4: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: wire material options modal open/close and keyboard dismiss"
```

---

### Task 5: Render options + CRUD functions

Implement `renderModalOptions` and all add/delete/update/status-toggle functions.

**Files:**
- Modify: `garden/index.html` — MATERIAL OPTIONS JS section

- [ ] **Step 1: Add `renderModalOptions`**

Add after `closeMaterialOptions`:

```js
function renderModalOptions(key) {
  const body = document.getElementById('mat-modal-body');
  if (!body) return;
  const options = getMaterialOptions(key);
  if (!options.length) {
    body.innerHTML = '<p style="font-family:var(--font-sans);font-size:12px;color:var(--text-dim);text-align:center;padding:32px 0;">No options yet — add one below.</p>';
    return;
  }
  body.innerHTML = options.map((opt, idx) => {
    const st = opt.optionStatus || null;
    return `
      <div class="mat-opt-card${st ? ' status-' + st : ''}" data-opt-idx="${idx}">
        <div class="mat-opt-row-top">
          <input class="mat-opt-name" type="text" placeholder="Option name…"
            value="${escHtml(opt.label || '')}"
            oninput="updateModalOption('${key}', ${idx}, 'label', this.value)">
          <div class="mat-opt-chips">
            <button class="mat-opt-chip${st === 'considering' ? ' chip-considering' : ''}"
              onclick="toggleModalOptionStatus('${key}', ${idx}, 'considering')">Considering</button>
            <button class="mat-opt-chip${st === 'favourite' ? ' chip-favourite' : ''}"
              onclick="toggleModalOptionStatus('${key}', ${idx}, 'favourite')">Favourite</button>
            <button class="mat-opt-chip${st === 'rejected' ? ' chip-rejected' : ''}"
              onclick="toggleModalOptionStatus('${key}', ${idx}, 'rejected')">Rejected</button>
          </div>
          <button class="mat-opt-delete" onclick="deleteModalOption('${key}', ${idx})" title="Remove">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>
        <div class="mat-opt-row-fields">
          <input class="mat-opt-field" type="text" placeholder="URL…"
            value="${escHtml(opt.url || '')}"
            oninput="updateModalOption('${key}', ${idx}, 'url', this.value)">
          <input class="mat-opt-field" type="text" placeholder="Price…"
            value="${escHtml(opt.price || '')}"
            oninput="updateModalOption('${key}', ${idx}, 'price', this.value)">
        </div>
        <textarea class="mat-opt-notes" placeholder="Notes…"
          oninput="updateModalOption('${key}', ${idx}, 'notes', this.value)">${escHtml(opt.notes || '')}</textarea>
      </div>`;
  }).join('');
}
```

- [ ] **Step 2: Add CRUD functions**

```js
function addModalOption(key) {
  const options = getMaterialOptions(key);
  options.unshift({ label: '', url: '', price: '', notes: '', optionStatus: null });
  saveMaterialOptions(key, options);
  renderModalOptions(key);
  updateMaterialCardBtn(key);
  const first = document.querySelector('#mat-modal-body .mat-opt-name');
  if (first) first.focus();
}

function deleteModalOption(key, idx) {
  const options = getMaterialOptions(key);
  options.splice(idx, 1);
  saveMaterialOptions(key, options);
  renderModalOptions(key);
  updateMaterialCardBtn(key);
}

function toggleModalOptionStatus(key, idx, status) {
  const options = getMaterialOptions(key);
  if (!options[idx]) return;
  options[idx].optionStatus = options[idx].optionStatus === status ? null : status;
  saveMaterialOptions(key, options);
  renderModalOptions(key);
  updateMaterialCardBtn(key);
}

function updateModalOption(key, idx, field, value) {
  clearTimeout(matModalSaveTimers[key + idx]);
  matModalSaveTimers[key + idx] = setTimeout(() => {
    const options = getMaterialOptions(key);
    if (options[idx]) {
      options[idx][field] = value;
      saveMaterialOptions(key, options);
    }
  }, 500);
}
```

- [ ] **Step 3: Verify in browser**

Open in Safari, open a material card, click Options. The modal should open. Add an option, fill in fields. Reload page — options should persist. Set a status chip — card should visually update. Delete an option.

- [ ] **Step 4: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: render modal options with status chips and CRUD"
```

---

### Task 6: Update material card button + `updateMaterialCardBtn`

Replace the old `.mat-options-toggle` button in the card render with the new `.mat-options-btn`, and add the helper that keeps it in sync.

**Files:**
- Modify: `garden/index.html` — `renderMaterials` JS function (around line 3234)

- [ ] **Step 1: Add `updateMaterialCardBtn` helper**

Add after `updateModalOption`:

```js
function updateMaterialCardBtn(key) {
  const btn = document.getElementById(`mat-opts-btn-${key}`);
  if (!btn) return;
  const options = getMaterialOptions(key);
  const hasFavourite = options.some(o => o.optionStatus === 'favourite');
  const count = options.length;
  if (hasFavourite) {
    btn.className = 'mat-options-btn has-favourite';
    btn.innerHTML = `<span class="mat-options-dot"></span> Options (${count})`;
  } else if (count > 0) {
    btn.className = 'mat-options-btn';
    btn.innerHTML = `Options (${count})`;
  } else {
    btn.className = 'mat-options-btn';
    btn.innerHTML = `Options`;
  }
}
```

- [ ] **Step 2: Update card render to use new button**

In the `renderMaterials` function, find the `mat-options-toggle` button HTML inside `card.innerHTML`. Replace:

```html
<button class="mat-options-toggle" onclick="toggleMaterialOptions('${escapeMaterialKey(m.name)}', this)">
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
    <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
  </svg>
  Options
</button>
<div class="mat-options-panel" id="mat-opts-${escapeMaterialKey(m.name)}" style="display:none;">
  <div class="mat-options-list" id="mat-opts-list-${escapeMaterialKey(m.name)}"></div>
  <button class="btn-add-option" style="margin-top:8px;" onclick="addMaterialOption('${escapeMaterialKey(m.name)}')">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
      <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
    </svg>
    Add option
  </button>
</div>
```

With:

```js
// Build initial button state
const matKey = escapeMaterialKey(m.name);
const matOpts = getMaterialOptions(matKey);
const matHasFav = matOpts.some(o => o.optionStatus === 'favourite');
const matCount = matOpts.length;
const optBtnClass = matHasFav ? 'mat-options-btn has-favourite' : 'mat-options-btn';
const optBtnInner = matHasFav
  ? `<span class="mat-options-dot"></span> Options (${matCount})`
  : matCount > 0 ? `Options (${matCount})` : `Options`;
```

Declare the variables immediately **before** the `card.innerHTML = \`...\`` assignment (not inside the template string). Then inside the template string, replace the old button block with:

```html
<button id="mat-opts-btn-${matKey}" class="${optBtnClass}"
  onclick="openMaterialOptions('${matKey}', ${JSON.stringify(m.name)})">
  ${optBtnInner}
</button>
```

Note: `JSON.stringify(m.name)` produces a safely quoted string for the inline handler.

- [ ] **Step 3: Remove old `toggleMaterialOptions`, `renderMaterialOptions`, `addMaterialOption`, `deleteMaterialOption`, `toggleMaterialOptionSelected`, `updateMaterialOption` functions**

These are all now replaced by the modal versions. Search for each function definition and delete it. Functions to delete:
- `toggleMaterialOptions(key, btn)`
- `renderMaterialOptions(key)`
- `addMaterialOption(key)`
- `deleteMaterialOption(key, idx)`
- `toggleMaterialOptionSelected(key, idx)`
- `updateMaterialOption(key, idx, field, value)` (the old one — keep the new `updateModalOption`)

Also delete the `let matSaveTimers = {};` variable (replaced by `matModalSaveTimers`).

- [ ] **Step 4: Verify in browser**

Open in Safari. Each material card should show an "Options" button. Click it — modal opens with correct material name. Add options, mark one as Favourite — the button on the card should update to amber with count. Close and reopen — state should persist.

- [ ] **Step 5: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: wire material card Options button to modal, update count/favourite indicator"
```

---

### Task 7: Phase expand/collapse animation

Smooth the phase task list open/close.

**Files:**
- Modify: `garden/index.html` — CSS (`.phase-tasks` rule around line 701) and `togglePhase` JS

- [ ] **Step 1: Update `.phase-tasks` CSS**

Find the `.phase-tasks` rule (around line 701). Replace:

```css
.phase-tasks {
  display: none;
  padding: 0 28px 24px;
  border-top: 1px solid var(--border);
}

.phase-card.expanded .phase-tasks {
  display: block;
}
```

With:

```css
.phase-tasks {
  padding: 0 28px 24px;
  border-top: 1px solid var(--border);
  overflow: hidden;
  max-height: 0;
  border-top-width: 0;
  transition: max-height 0.3s ease, border-top-width 0.3s ease;
}

.phase-card.expanded .phase-tasks {
  max-height: 2000px;
  border-top-width: 1px;
}
```

- [ ] **Step 2: Verify in browser**

Click a phase card to expand it. The task list should animate open smoothly. Click again — it should animate closed. No content should be visible when collapsed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: animate phase task list expand/collapse"
```

---

### Task 8: Status picker open/close animation

Replace the abrupt `style.display` toggle on the material status picker with a CSS transition.

**Files:**
- Modify: `garden/index.html` — CSS (`.mat-status-picker`) and `toggleMatStatusPicker` / `setMatStatus` JS

- [ ] **Step 1: Update `.mat-status-picker` CSS**

Find the `.mat-status-picker` rule. Check if it contains `display: none` — if so, remove that line (it will block the CSS transition). Then merge in the transition properties:

```css
.mat-status-picker {
  /* existing properties stay — remove any display:none — add these: */
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mat-status-picker.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
```

Also remove `style="display:none;"` from the `mat-status-picker` div in `card.innerHTML` inside `renderMaterials` — the CSS now controls visibility.

- [ ] **Step 2: Update `toggleMatStatusPicker` JS**

Find `toggleMatStatusPicker`. Replace `style.display` toggling with class toggling:

```js
function toggleMatStatusPicker(key, btn) {
  document.querySelectorAll('.mat-status-picker').forEach(p => {
    if (p.id !== `mat-status-picker-${key}`) p.classList.remove('visible');
  });
  const picker = document.getElementById(`mat-status-picker-${key}`);
  if (!picker) return;
  picker.classList.toggle('visible');
}
```

- [ ] **Step 3: Update `setMatStatus` to use class toggle**

Find `setMatStatus`. Replace `picker.style.display = 'none'` with `picker.classList.remove('visible')`.

- [ ] **Step 4: Verify in browser**

Click the status badge on a material card — the picker should fade in. Click a status — picker fades out. Click outside — other pickers close.

- [ ] **Step 5: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: animate material status picker open/close"
```

---

### Task 9: `prefers-reduced-motion` CSS

Disable animations for users who prefer reduced motion.

**Files:**
- Modify: `garden/index.html` — `<style>` block, end of CSS section

- [ ] **Step 1: Add `@media (prefers-reduced-motion: reduce)` block**

Add at the very end of the `<style>` block, just before `</style>`:

```css
/* ============================================================
   REDUCED MOTION
============================================================ */
@media (prefers-reduced-motion: reduce) {
  .status-badge .pulse::after { animation: none; }
  .fade-in, .fade-in-stagger {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .phase-tasks { transition: none; }
  #mat-options-modal, #mat-options-backdrop { transition: none; }
  .mat-status-picker { transition: none; }
}
```

- [ ] **Step 2: Verify**

In Safari DevTools, enable "Prefers reduced motion" via the Accessibility tab in Device emulation settings. Reload the page. Scroll animations should be instant. The pulsing dot on the hero should be static.

- [ ] **Step 3: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: add prefers-reduced-motion CSS fallbacks"
```

---

### Task 10: Mobile nav animation

Animate the hamburger menu open/close.

**Files:**
- Modify: `garden/index.html` — CSS (`.nav-links` mobile rule) and `toggleMenu` JS

- [ ] **Step 1: Update mobile nav CSS**

Find the `@media (max-width: 768px)` block that contains `.nav-links { display: none; }`. Replace:

```css
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
```

With:

```css
@media (max-width: 768px) {
  .nav-links {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 52px;
    left: 0;
    right: 0;
    background: rgba(17, 20, 16, 0.97);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    gap: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease, padding 0.25s ease;
  }
  .nav-links.open {
    max-height: 300px;
    padding: 12px 24px;
  }
  .nav-links a { padding: 10px 0; }
  .hamburger { display: flex; }
}
```

- [ ] **Step 2: Update `toggleMenu` JS**

Find `toggleMenu`. Replace entirely:

```js
function toggleMenu(btn) {
  document.querySelector('.nav-links').classList.toggle('open');
}
```

- [ ] **Step 3: Verify in browser**

In Safari DevTools, set viewport to 375px width. Click the hamburger — nav links should animate down. Click again — should animate closed.

- [ ] **Step 4: Commit**

```bash
git -C /Users/scottmitchell/AI/garden add index.html
git -C /Users/scottmitchell/AI/garden commit -m "feat: animate mobile nav open/close"
```

---

## Completion Checklist

- [ ] All 10 tasks committed
- [ ] Material options modal opens/closes correctly for every card
- [ ] Status chips work: Considering (green), Favourite (amber + card border), Rejected (faded + strikethrough)
- [ ] Options button on card shows count and amber dot when Favourite is set
- [ ] Legacy `selected: true` data migrates to `optionStatus: 'favourite'` on first load
- [ ] No old `.mat-options-panel` or `.mat-options-toggle` code remaining
- [ ] Phase cards expand/collapse with animation
- [ ] Status picker animates in/out
- [ ] Reduced motion CSS in place
- [ ] Mobile nav animates open/close

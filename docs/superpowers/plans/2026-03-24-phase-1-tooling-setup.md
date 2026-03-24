# Phase 1: Tooling Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file vanilla JS site with a Vite + React + TypeScript + Tailwind project, configure GitHub Actions for automated deployment, archive the legacy site to a safe branch, and establish project conventions.

**Architecture:** Scaffold a fresh Vite+React+TS project in the existing repo. The current `index.html` is archived to a `legacy` branch (stays live there as a safety net). The new app renders a minimal shell — just enough to prove the stack is wired up correctly. GitHub Actions builds `dist/` on push to `main` and deploys to GitHub Pages. Playwright is rewired to hit the Vite dev server (`localhost:5173`).

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, React Router v6, Playwright (existing)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `vite.config.ts` | Vite config — base path, React plugin |
| Create | `tsconfig.json` | Root TypeScript config — references app + node configs |
| Create | `tsconfig.app.json` | TypeScript config for app source code |
| Create | `tsconfig.node.json` | TypeScript config for Vite config itself |
| Create | `tailwind.config.ts` | Tailwind — content paths, custom theme tokens |
| Create | `postcss.config.js` | PostCSS — Tailwind + autoprefixer |
| Modify | `package.json` | Replace serve script with Vite scripts, add all deps |
| Create | `index.html` | Vite entry point (replaces current 6,500-line file) |
| Create | `src/main.tsx` | React entry — mounts App to #root |
| Create | `src/App.tsx` | Root component — minimal shell, BrowserRouter |
| Create | `src/index.css` | Tailwind directives |
| Create | `public/404.html` | GitHub Pages SPA redirect workaround |
| Create | `.env.local` | Local dev → `garden-dev` Firebase DB |
| Create | `.env.production` | Prod build → `garden` Firebase DB |
| Create | `.env.test` | Playwright → `garden-test` Firebase DB |
| Modify | `playwright.config.ts` | Point BASE_URL to `localhost:5173` |
| Create | `.github/workflows/deploy.yml` | Build + deploy to GitHub Pages on push to `main` |
| Create | `.github/ISSUE_TEMPLATE/feature.md` | Standard issue template |
| Create | `.github/PULL_REQUEST_TEMPLATE.md` | Standard PR template |
| Create | `CLAUDE.md` | Project conventions, tech stack, folder structure |
| Modify | `.gitignore` | Add `dist/`, `.env.local` |

---

## Task 1: Archive legacy site

**Goal:** Preserve the current working site on a `legacy` branch before touching anything.

- [ ] **Step 1: Create and push legacy branch**

```bash
cd /Users/scottmitchell/ai/garden
git checkout -b legacy
git push origin legacy
```

Expected: `legacy` branch pushed to GitHub. The old `index.html` is safe here.

- [ ] **Step 2: Return to main**

```bash
git checkout main
```

- [ ] **Step 3: Verify legacy site is accessible**

Open `https://github.com/scottjmitchell/garden/tree/legacy` and confirm `index.html` is there.

---

## Task 2: Update package.json and install dependencies

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Replace package.json**

```json
{
  "name": "garden",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "npx playwright test",
    "test:local": "BASE_URL=http://localhost:5173 npx playwright test"
  },
  "dependencies": {
    "firebase": "^10.14.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@types/node": "^25.5.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^5.4.11"
  }
}
```

- [ ] **Step 2: Update .gitignore**

Add these lines to `.gitignore`:
```
dist/
.env.local
.env*.local
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` populated, no errors.

---

## Task 3: Configure Vite, TypeScript, Tailwind

**Files:**
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
})
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 3: Create tsconfig.app.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#C8922A',
        },
        moss: {
          DEFAULT: '#3D5239',
        },
        garden: {
          bg: '#111410',
          text: '#EDE8DC',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Task 4: Write the smoke test first (TDD)

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/page.spec.ts`

We write one minimal test that verifies the new React app loads. All old tests are cleared — they were written for the vanilla JS site and will be rebuilt feature-by-feature in Phases 4–6.

- [ ] **Step 1: Update playwright.config.ts**

Replace the full file:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://garden.scottjmitchell.com',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

- [ ] **Step 2: Replace tests/page.spec.ts with a single smoke test**

```typescript
import { test, expect } from '@playwright/test'

test('app loads and shows page title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Mitchell Garden/)
})
```

- [ ] **Step 3: Run the test to confirm it fails (nothing is served yet)**

```bash
BASE_URL=http://localhost:5173 npm run test
```

Expected: FAIL — `localhost:5173` is not running. This is correct.

---

## Task 5: Scaffold the minimal React app

**Files:**
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `public/404.html`

- [ ] **Step 1: Create index.html (Vite entry point)**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Mitchell Garden</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
    <script>
      // GitHub Pages SPA redirect: restore path from ?redirect= param
      const redirect = new URLSearchParams(window.location.search).get('redirect')
      if (redirect) {
        window.history.replaceState(null, '', redirect)
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Create src/App.tsx**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-garden-bg text-garden-text font-sans">
        <Routes>
          <Route path="/" element={<div className="p-8"><h1 className="font-display text-3xl text-amber">The Mitchell Garden</h1><p className="mt-2 text-sm opacity-60">App shell coming in Phase 2.</p></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 5: Create public/404.html (GitHub Pages SPA fallback)**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>The Mitchell Garden</title>
    <script>
      // Redirect deep links back to index.html so React Router can handle them
      const path = window.location.pathname + window.location.search + window.location.hash
      window.location.replace('/?redirect=' + encodeURIComponent(path))
    </script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 6: Start the dev server**

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` — you should see "The Mitchell Garden" in amber on a dark background.

- [ ] **Step 7: Run the smoke test (dev server must be running in a separate terminal)**

Keep `npm run dev` running in one terminal. In a second terminal:

```bash
BASE_URL=http://localhost:5173 npm run test
```

Expected: PASS — 1 test passing.

- [ ] **Step 8: Verify the build works**

```bash
npm run build
```

Expected: `dist/` folder created, no TypeScript or build errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind

- Vite 5, React 18, TypeScript 5, Tailwind 3
- Minimal App shell renders on dark bg with amber heading
- Smoke test passing against local dev server
- Legacy site preserved on legacy branch"
```

---

## Task 6: Set up environment files

**Files:**
- Create: `.env.local`
- Create: `.env.production`
- Create: `.env.test`

These files configure which Firebase database root each environment uses. They are read at build time by Vite (prefix `VITE_` makes them available in the browser bundle).

- [ ] **Step 1: Create .env.local**

```
VITE_FIREBASE_DB_ROOT=garden-dev
```

- [ ] **Step 2: Create .env.production**

```
VITE_FIREBASE_DB_ROOT=garden
```

- [ ] **Step 3: Create .env.test**

```
VITE_FIREBASE_DB_ROOT=garden-test
```

Note: `.env.local` is already in `.gitignore`. `.env.production` and `.env.test` contain no secrets (just the DB root string) so they can be committed safely.

- [ ] **Step 4: Commit env files**

```bash
git add .env.production .env.test
git commit -m "chore: add environment config files

.env.local → garden-dev (gitignored, set manually)
.env.production → garden (prod build)
.env.test → garden-test (Playwright)"
```

---

## Task 7: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: Update GitHub Pages source to Actions**

Go to `https://github.com/scottjmitchell/garden/settings/pages` and change the Source to **GitHub Actions** (not a branch). This is a one-time settings change in the browser.

- [ ] **Step 3: Commit and push to trigger deployment**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy workflow

Builds with Vite on push to main, deploys to GitHub Pages.
Pages source must be set to GitHub Actions in repo settings."
git push origin main
```

- [ ] **Step 4: Verify deployment**

Watch the Actions tab at `https://github.com/scottjmitchell/garden/actions`. Both `build` and `deploy` jobs should go green. Then open `https://garden.scottjmitchell.com` — you should see the minimal React shell.

**Note:** During this phase, `garden.scottjmitchell.com` will show the new minimal React app (amber heading, dark background). The old site is preserved on the `legacy` branch and can be viewed at `https://github.com/scottjmitchell/garden/tree/legacy`.

---

## Task 8: Write CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

The Mitchell Garden app — a planning and tracking tool for the Mitchell garden renovation project. Built by Scott Mitchell as a learning project to practice React, TypeScript, Tailwind, and modern frontend toolchain patterns.

Live site: https://garden.scottjmitchell.com
Firebase project: mitchell-garden (europe-west1)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 5 |
| UI | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Data | Firebase Realtime Database (modular v9 SDK) |
| Storage | Firebase Storage |
| Testing | Playwright |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## Folder Structure

```
src/
  app/           # App shell, routing, layout, providers
  design-system/ # Generic reusable UI (knows nothing about gardens)
  features/      # Garden-specific features (plan, materials, budget, journal, map, overview)
  lib/           # Firebase config + helpers, utilities
  types/         # Shared TypeScript types
```

## Architecture Rules

1. `design-system/` components must NOT know about the garden domain. `Card` is generic. `PhaseCard` lives in `features/plan/` and uses `Card`.
2. Feature components import from `design-system/` and `lib/` — never the reverse.
3. Each feature folder is self-contained: its own components, hooks, and local types.
4. Shared TypeScript types live in `src/types/index.ts`.

## Design System

**Colour palette (Tailwind tokens):**
- `bg-garden-bg` (#111410) — page background
- `text-garden-text` (#EDE8DC) — body text
- `text-amber` / `border-amber` (#C8922A) — accent
- `bg-moss` (#3D5239) — secondary accent

**Typography:**
- `font-display` — Cormorant Garamond (headings)
- `font-sans` — Jost (body, UI)

**Component rule:** Every design system component has a Storybook story before it is used in a feature.

## Environments

| Env file | Firebase DB root | When used |
|----------|-----------------|-----------|
| `.env.local` | `garden-dev` | Local development (`npm run dev`) |
| `.env.production` | `garden` | Production build (GitHub Actions) |
| `.env.test` | `garden-test` | Playwright tests |

Access in code: `import.meta.env.VITE_FIREBASE_DB_ROOT`

## Testing

- Framework: Playwright (Chrome desktop)
- Test file: `tests/page.spec.ts`
- Run locally: `BASE_URL=http://localhost:5173 npm run test`
- Run against prod: `npm run test`
- TDD: write the failing test before writing the component

## GitHub Conventions

**Branches:** Feature branches off `main`, named `phase-X/short-description`

**Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`

**Issues:** One GitHub Issue per task. Use the issue template. Reference in commits: `feat: add PhaseCard component (#12)`

**PRs:** One PR per phase task. Fill out the PR template. Must pass CI before merging.

**Milestones:** One GitHub Milestone per phase (Phase 1 through Phase 8).

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # TypeScript check + Vite build → dist/
npm run preview      # Preview the built app locally
npm run test         # Playwright tests (against prod URL)
npm run test:local   # Playwright tests (against localhost:5173)
```

## Current Phase

**Phase 1 — Tooling Setup** (active)

See `docs/superpowers/plans/2026-03-24-phase-1-tooling-setup.md`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project conventions and architecture guide"
```

---

## Task 9: GitHub Issue and PR templates + Milestones

**Files:**
- Create: `.github/ISSUE_TEMPLATE/feature.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Create .github/ISSUE_TEMPLATE/feature.md**

```markdown
---
name: Feature / Task
about: A planned task within a phase
labels: ''
assignees: scottjmitchell
---

## Summary

<!-- One sentence describing what this builds -->

## Phase

<!-- Which phase does this belong to? -->
Phase X — [name]

## Acceptance Criteria

- [ ] <!-- What must be true for this to be done? -->
- [ ] Tests written and passing
- [ ] PR reviewed and merged
- [ ] CI green

## Notes

<!-- Any implementation notes, links, or context -->
```

- [ ] **Step 2: Create .github/PULL_REQUEST_TEMPLATE.md**

```markdown
## Summary

<!-- What does this PR do? One sentence. -->

## Phase

Phase X — [name] | Issue #[n]

## Changes

<!-- Bullet points of what changed -->
-

## Test Evidence

<!-- Screenshot or test output showing this works -->

## Checklist

- [ ] Tests written and passing (`BASE_URL=http://localhost:5173 npm run test`)
- [ ] CI build green
- [ ] No TypeScript errors (`npm run build`)
- [ ] CLAUDE.md updated if conventions changed
```

- [ ] **Step 3: Create GitHub Milestones via CLI**

```bash
gh milestone create "Phase 1 — Tooling Setup" --description "Vite + React + TS + Tailwind scaffold, GitHub Actions CI/CD, project conventions"
gh milestone create "Phase 2 — App Shell" --description "React Router, layout, navigation, empty page stubs"
gh milestone create "Phase 3 — Design System" --description "Tailwind tokens, core components, Storybook"
gh milestone create "Phase 4 — Feature Migration" --description "All features rebuilt in React with mocked data"
gh milestone create "Phase 5 — Data Migration" --description "Hardcoded data written to Firebase, full data snapshot"
gh milestone create "Phase 6 — Firebase Reconnect" --description "Modular Firebase SDK, real data hooks"
gh milestone create "Phase 7 — Auth" --description "Firebase Auth, route guard, locked Firebase rules"
gh milestone create "Phase 8 — Flip & Polish" --description "DNS flip, Playwright prod pass, legacy archived"
```

Expected: 8 milestones created.

- [ ] **Step 4: Commit templates**

```bash
git add .github/
git commit -m "chore: add GitHub issue/PR templates and create milestones"
git push origin main
```

---

## Verification Checklist

Phase 1 is complete when all of the following are true:

- [ ] `npm run dev` starts Vite at `localhost:5173`, app renders amber heading on dark bg
- [ ] `npm run build` completes with no TypeScript errors
- [ ] `BASE_URL=http://localhost:5173 npm run test` — smoke test passes
- [ ] GitHub Actions workflow runs green on push to `main`
- [ ] `https://garden.scottjmitchell.com` serves the new React app
- [ ] `legacy` branch exists and contains the original `index.html`
- [ ] `CLAUDE.md` exists in repo root
- [ ] 8 GitHub Milestones exist
- [ ] GitHub Issue + PR templates exist in `.github/`

# Garden Site — Claude Code Guide

## Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v3
- React Router v6
- Firebase Realtime Database + Storage
- Playwright (E2E tests)
- GitHub Pages (hosting via `gh-pages` branch)

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Local dev server at http://localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build at http://localhost:4173 |
| `npm test` | Playwright tests against https://garden.scottjmitchell.com |
| `npm run test:local` | Playwright tests against local dev server |

## Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Shared Firebase config + dev DB root | Yes |
| `.env.local` | Local overrides (gitignored) | No |
| `.env.production` | Prod DB root (`garden`) | Yes |

`VITE_DB_ROOT` controls which Firebase path is used: `garden` (prod), `garden-dev` (local), `garden-test` (CI).

## Architecture

```
src/
  app/
    App.tsx                   # Root component, routes
    layout/
      AppShell.tsx            # Nav + layout wrapper
      Nav.tsx                 # Responsive navigation
    providers/
      FirebaseProvider.tsx    # Firebase app context

  design-system/
    tokens/                   # colors.ts, typography.ts, spacing.ts
    components/               # Button, Card, Badge, Modal, Input, Tabs, PageHeader, EmptyState
    index.ts                  # Re-exports

  features/
    overview/                 # Dashboard — project summary
    plan/                     # Phase tracker, tasks, notes
    materials/                # Material cards + compare modal
    budget/                   # Budget table + variance
    journal/                  # Photo upload slots
    map/                      # SVG garden plan + zone tooltips

  lib/
    firebase/
      config.ts               # Firebase app init
      db.ts                   # Realtime Database helpers
      storage.ts              # Firebase Storage helpers
    utils/
      html.ts

  types/
    index.ts                  # Phase, Task, Material, BudgetItem, etc.
```

## Key Boundary

`design-system/` components are domain-agnostic. `Card` is generic. `PhaseCard` lives in `features/plan/` and uses `Card`. Never import garden domain knowledge into `design-system/`.

## Design Tokens (Tailwind)

| Token | Value |
|-------|-------|
| `amber` | #C8922A |
| `moss` | #3D5239 |
| `garden-bg` | #111410 |
| `garden-text` | #EDE8DC |
| `font-display` | Cormorant Garamond |
| `font-sans` | Jost |

## Testing (TDD — mandatory)

1. Write a failing Playwright test in `tests/page.spec.ts`
2. Verify it fails for the right reason (`npm run test:local`)
3. Implement the change
4. All tests pass
5. Commit and push

## CI/CD

Push to `master` → GitHub Actions builds → Playwright tests against preview server → deploys to `gh-pages` branch.

**One-time setup required:** GitHub Pages must be configured to deploy from the `gh-pages` branch (Settings → Pages → Source).

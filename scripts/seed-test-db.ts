/**
 * Seed the CI test Firebase path with mock data.
 *
 * Uses the Firebase REST API with a Database Secret to bypass security rules.
 * The secret must be provided via FIREBASE_DB_SECRET env var.
 *
 * Usage:
 *   VITE_DB_ROOT=garden-test FIREBASE_DB_SECRET=<secret> npx tsx scripts/seed-test-db.ts
 */

import { PHASES, BUDGET_ITEMS, MATERIALS } from '../src/lib/mock-data'

const DB_ROOT   = process.env.VITE_DB_ROOT ?? 'garden-test'
const SECRET    = process.env.FIREBASE_DB_SECRET
const BASE_URL  = 'https://mitchell-garden-default-rtdb.europe-west1.firebasedatabase.app'

if (!SECRET) {
  console.error('FIREBASE_DB_SECRET env var is required')
  process.exit(1)
}

async function put(path: string, data: object) {
  const url = `${BASE_URL}/${DB_ROOT}/${path}.json?auth=${SECRET}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT ${path} failed: ${res.status} ${text}`)
  }
}

// Clear previous test data before seeding
const clearRes = await fetch(`${BASE_URL}/${DB_ROOT}.json?auth=${SECRET}`, { method: 'DELETE' })
if (!clearRes.ok) throw new Error(`DELETE ${DB_ROOT} failed: ${clearRes.status}`)

console.log(`Seeding ${DB_ROOT}...`)

// Phases
for (const [i, p] of PHASES.entries()) {
  const tasks: Record<string, object> = {}
  for (const [j, t] of p.tasks.entries()) {
    tasks[t.id] = { ...t, order: j }
  }
  await put(`phases/${p.id}`, {
    id: p.id, num: p.num, title: p.title, date: p.date, status: p.status, tasks, order: i,
  })
}
console.log(`  ✓ ${DB_ROOT}/phases (${PHASES.length} phases)`)

// Budget items — first item gets an actual so total-variance renders in CI
for (const [i, item] of BUDGET_ITEMS.entries()) {
  const data = i === 0
    ? { ...item, actual: Math.round((item.low + item.high) / 2) }
    : { ...item }
  await put(`budgetItems/${item.id}`, data)
}
console.log(`  ✓ ${DB_ROOT}/budgetItems (${BUDGET_ITEMS.length} items)`)

// Materials
for (const [i, m] of MATERIALS.entries()) {
  const { options: _opts, ...rest } = m as any
  await put(`materials/${m.id}`, { ...rest, options: {}, order: i })
}
console.log(`  ✓ ${DB_ROOT}/materials (${MATERIALS.length} materials)`)

// Journal — seed two entries so tests can exercise the lightbox flow
// (open, prev/next, caption edit, delete-with-confirm).
const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
const journalEntries = [
  // Older first; newest-first sort means the second entry shows at index 0
  { id: 'test-entry-old', imageUrl: PIXEL, caption: 'First test photo',  createdAt: 1_700_000_000_000 },
  { id: 'test-entry-new', imageUrl: PIXEL, caption: 'Second test photo', createdAt: 1_700_000_001_000 },
]
for (const e of journalEntries) {
  await put(`journal/${e.id}`, { imageUrl: e.imageUrl, caption: e.caption, createdAt: e.createdAt })
}
console.log(`  ✓ ${DB_ROOT}/journal (${journalEntries.length} entries)`)

console.log('Done.')

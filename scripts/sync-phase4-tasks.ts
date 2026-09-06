/**
 * Sync Phase 4 (Soft Landscaping) tasks from canonical mock-data into live Firebase.
 *
 * Written for the September 2026 turf -> seeding change. Phase 4's three turf
 * tasks are replaced by the seeding sequence, and the phase date is retimed.
 *
 * Safe by design:
 *   - Dry run by default. Prints a diff and writes nothing without --commit.
 *   - Preserves the `done` flag of every task that already exists live.
 *   - Preserves any task found live but absent from mock-data (appended at the
 *     end rather than deleted), so hand-added tasks are never lost.
 *   - Touches only phases/phase4. No other path is read or written.
 *
 * Usage:
 *   npx tsx scripts/sync-phase4-tasks.ts                      # dry run against prod
 *   FIREBASE_DB_SECRET=<secret> npx tsx scripts/sync-phase4-tasks.ts --commit
 *
 *   VITE_DB_ROOT=garden-dev npx tsx scripts/sync-phase4-tasks.ts   # target dev instead
 *
 * The secret is read from the environment and never printed.
 */

import { PHASES } from '../src/lib/mock-data'

const DB_ROOT  = process.env.VITE_DB_ROOT ?? 'garden'
const SECRET   = process.env.FIREBASE_DB_SECRET
const BASE_URL = 'https://mitchell-garden-default-rtdb.europe-west1.firebasedatabase.app'
const COMMIT   = process.argv.slice(2).includes('--commit')

const phase4 = PHASES.find(p => p.id === 'phase4')
if (!phase4) throw new Error('phase4 not found in mock-data PHASES')

/**
 * Only the lawn/seeding tasks are synced, in this order. Every other Phase 4
 * task is left exactly as the app has it.
 *
 * This allowlist matters: the planting tasks have diverged from mock-data in
 * the app (p4t5 clematis and p4t6 hydrangea were deleted and replaced by a
 * single hand-added "Planting the climbers"). Syncing the whole phase would
 * resurrect them as duplicates.
 */
const LAWN_TASK_IDS = [
  'p4t1',  // hard landscaping traffic finished
  'p4t3',  // soil moisture check before working it
  'p4t15', // spread + incorporate compost (before firming)
  'p4t2',  // firm the fresh topsoil layer
  'p4t8',  // level against EverEdge
  'p4t9',  // EverEdge (already installed)
  'p4t16', // watering plan confirmed before sowing
  'p4t10', // pre-seed fertiliser, same session as sowing
  'p4t11', // sow
  'p4t12', // rake in + firm
  'p4t13', // keep moist 3 weeks
  'p4t14', // first cut
]

const lawnTasks = LAWN_TASK_IDS.map(id => {
  const t = phase4.tasks.find(x => x.id === id)
  if (!t) throw new Error(`LAWN_TASK_IDS references ${id}, absent from mock-data phase4`)
  return t
})

// ─── Read live state ─────────────────────────────────────────────────────────

const res = await fetch(`${BASE_URL}/${DB_ROOT}/phases/phase4.json`)
if (!res.ok) throw new Error(`GET phases/phase4 failed: ${res.status}`)
const live = (await res.json()) ?? {}
const liveTasks: Record<string, any> = live.tasks ?? {}

console.log(`\nTarget: ${DB_ROOT}/phases/phase4`)
console.log(`  live date:  ${live.date ?? '(none)'}  ->  ${phase4.date}`)
console.log(`  live tasks: ${Object.keys(liveTasks).length}`)

// ─── Build merged task set ───────────────────────────────────────────────────

const canonicalIds = new Set(lawnTasks.map(t => t.id))
const merged: Record<string, object> = {}
const added: string[] = []
const retexted: [string, string, string][] = []
const kept: string[] = []

lawnTasks.forEach((t, i) => {
  const existing = liveTasks[t.id]
  if (!existing) {
    added.push(t.text)
  } else if (existing.text !== t.text) {
    retexted.push([t.id, existing.text, t.text])
  }
  merged[t.id] = {
    id:    t.id,
    text:  t.text,
    // Never clobber progress already recorded in the app.
    done:  existing?.done ?? t.done ?? false,
    order: i,
    ...(existing?.status !== undefined ? { status: existing.status } : {}),
    ...(existing?.notes  !== undefined ? { notes:  existing.notes  } : {}),
    ...(existing?.options !== undefined ? { options: existing.options } : {}),
  }
})

// Every non-lawn task is preserved untouched, keeping its relative order,
// renumbered to sit after the lawn block.
let tail = lawnTasks.length
const others = Object.entries(liveTasks)
  .filter(([id]) => !canonicalIds.has(id))
  .sort((a, b) => (a[1].order ?? 99) - (b[1].order ?? 99))
for (const [id, t] of others) {
  merged[id] = { ...t, order: tail++ }
  kept.push(t.text ?? id)
}

// ─── Report ──────────────────────────────────────────────────────────────────

console.log(`\n  ${added.length} new task(s):`)
added.forEach(t => console.log(`    + ${t}`))

if (retexted.length) {
  console.log(`\n  ${retexted.length} task(s) re-texted (done flag preserved):`)
  retexted.forEach(([id, from, to]) => {
    console.log(`    ~ ${id}`)
    console.log(`        was: ${from}`)
    console.log(`        now: ${to}`)
  })
}

if (kept.length) {
  console.log(`\n  ${kept.length} non-lawn task(s) PRESERVED untouched, re-ordered after the lawn block:`)
  kept.forEach(t => console.log(`    = ${t}`))
}

const doneCount = Object.values(merged).filter((t: any) => t.done).length
console.log(`\n  Result: ${Object.keys(merged).length} tasks, ${doneCount} marked done.`)

// ─── Write ───────────────────────────────────────────────────────────────────

if (!COMMIT) {
  console.log('\nDRY RUN — nothing written. Re-run with --commit to apply:')
  console.log('  FIREBASE_DB_SECRET=<secret> npx tsx scripts/sync-phase4-tasks.ts --commit\n')
  process.exit(0)
}

if (!SECRET) {
  console.error('\nFIREBASE_DB_SECRET env var is required with --commit.')
  console.error('Firebase console -> Project settings -> Service accounts -> Database secrets\n')
  process.exit(1)
}

async function patch(path: string, data: object) {
  const r = await fetch(`${BASE_URL}/${DB_ROOT}/${path}.json?auth=${SECRET}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!r.ok) throw new Error(`PATCH ${path} failed: ${r.status} ${await r.text()}`)
}

await patch('phases/phase4', { date: phase4.date })
await patch('phases/phase4/tasks', merged)

console.log(`\n✓ Written to ${DB_ROOT}/phases/phase4\n`)

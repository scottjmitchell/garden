/**
 * Phase 5 — Data Migration
 *
 * Reads current live Firebase state via REST API, merges with canonical
 * mock-data, and outputs a JSON snapshot ready for Firebase console import.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts             # writes snapshot to scripts/migrate-snapshot.json
 *   npx tsx scripts/migrate.ts --print     # print to stdout instead
 *
 * Then in Firebase console:
 *   Realtime Database → (select garden-dev path) → ⋮ menu → Import JSON
 *   Upload scripts/migrate-snapshot.json
 *   Verify, then repeat for the garden (prod) path.
 */

import { writeFileSync } from 'node:fs'
import { MATERIALS, BUDGET_ITEMS, JOURNAL_SLOTS } from '../src/lib/mock-data'

const args  = process.argv.slice(2)
const print = args.includes('--print')

const DB_URL = 'https://mitchell-garden-default-rtdb.europe-west1.firebasedatabase.app'

async function get(path: string) {
  const res = await fetch(`${DB_URL}/${path}.json`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

// ─── Read current state (reads are public) ───────────────────────────────────

console.log('\nReading current Firebase state from garden/ …')
const current = await get('garden')

const existingPhases  = current?.phases        ?? {}
const existingPhotos  = current?.photos         ?? {}
const existingActuals = current?.budgetActuals  ?? {}

console.log(`  phases:        ${Object.keys(existingPhases).length} found`)
console.log(`  photos:        ${Object.keys(existingPhotos).length} found`)
console.log(`  budgetActuals: ${Object.keys(existingActuals).length} found`)

// ─── Map legacy budget actuals to new IDs ────────────────────────────────────

const ACTUALS_MAP: Record<string, string> = {
  'Breaker_Hire_(2_weekends)':             'breaker',
  'Natural_Stone_Paving_(~50_sqm)':        'paving',
  'Louvred_Pergola_(motorised_aluminium)': 'pergola',
  'MOT_Type_1_Hardcore_(~8_tonnes)':       'mot',
  'Mini-Digger_Hire_(1_day)':              'digger',
  'Skip_Hire_(~8_yard)':                   'skip',
}

const remappedActuals: Record<string, number> = {}
for (const [oldKey, value] of Object.entries(existingActuals as Record<string, string>)) {
  const newId = ACTUALS_MAP[oldKey]
  if (newId) {
    remappedActuals[newId] = parseInt(value, 10)
    console.log(`  Mapped actual: ${oldKey} → ${newId} = £${value}`)
  } else {
    console.log(`  Unmapped actual (skipped): ${oldKey}`)
  }
}

// ─── Build snapshot ───────────────────────────────────────────────────────────

// Phases — use existing Firebase data (already correctly structured)
const phases = existingPhases

// Materials — fresh seed from mock-data
const materials: Record<string, object> = {}
for (const [i, m] of MATERIALS.entries()) {
  materials[m.id] = {
    id:          m.id,
    name:        m.name,
    spec:        m.spec,
    cost:        m.cost,
    status:      m.status,
    statusLabel: m.statusLabel,
    accent:      m.accent,
    order:       i,
    options:     {},
  }
}

// Budget items — seed from mock-data, merge preserved actuals
const budgetItems: Record<string, object> = {}
for (const [i, item] of BUDGET_ITEMS.entries()) {
  budgetItems[item.id] = {
    id:     item.id,
    name:   item.name,
    low:    item.low,
    high:   item.high,
    actual: remappedActuals[item.id] ?? null,
    order:  i,
  }
}

// Journal — seed from mock-data, merge photo URLs
const journal: Record<string, object> = {}
for (const slot of JOURNAL_SLOTS) {
  journal[slot.id] = {
    id:       slot.id,
    label:    slot.label,
    phase:    slot.phase,
    imageUrl: (existingPhotos as Record<string, string>)[slot.id] ?? null,
  }
}
const preserved = JOURNAL_SLOTS.filter(s => (existingPhotos as Record<string, string>)[s.id])
if (preserved.length) {
  console.log(`  Preserved photos: ${preserved.map(s => s.id).join(', ')}`)
}

// ─── Output ───────────────────────────────────────────────────────────────────

const snapshot = { phases, materials, budgetItems, journal }

console.log(`\nSnapshot ready:`)
console.log(`  phases:      ${Object.keys(phases).length}`)
console.log(`  materials:   ${Object.keys(materials).length}`)
console.log(`  budgetItems: ${Object.keys(budgetItems).length}`)
console.log(`  journal:     ${Object.keys(journal).length}`)

if (print) {
  console.log('\n' + JSON.stringify(snapshot, null, 2))
} else {
  const outPath = 'scripts/migrate-snapshot.json'
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2))
  console.log(`\nSnapshot written to ${outPath}`)
  console.log('\nNext steps:')
  console.log('  1. Firebase console → Realtime Database')
  console.log('  2. Navigate to the garden-dev node (or create it)')
  console.log('  3. ⋮ menu → Import JSON → upload scripts/migrate-snapshot.json')
  console.log('  4. Verify the data looks correct')
  console.log('  5. Repeat for the garden (prod) node')
}

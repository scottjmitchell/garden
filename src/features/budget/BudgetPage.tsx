import { useState } from 'react'
import { PageHeader, ConfirmModal } from '../../design-system'
import { useBudget } from '../../lib/firebase/hooks'
import { BudgetItemModal } from './BudgetItemModal'
import type { BudgetItem } from '../../types'

function fmt(n: number) {
  return '£' + n.toLocaleString('en-GB')
}

function VariancePill({ actual, low, high }: { actual: number | undefined; low: number; high: number }) {
  if (actual === undefined) return null
  const mid  = (low + high) / 2
  const diff = actual - mid
  const over = diff > 0
  return (
    <span
      data-testid="variance-pill"
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        over ? 'bg-red-900/40 text-red-300' : 'bg-moss/40 text-green-300'
      }`}
    >
      {over ? '+' : ''}{fmt(Math.round(diff))}
    </span>
  )
}

export function BudgetPage() {
  const { items, loading, setActual, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useBudget()

  const [editItem,     setEditItem]     = useState<BudgetItem | null>(null)
  const [addingItem,   setAddingItem]   = useState(false)
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null)

  // Local actual values — updated immediately on blur, synced to Firebase
  const [localActuals, setLocalActuals] = useState<Record<string, number | undefined>>({})

  function getDisplayValue(item: BudgetItem): string {
    const local = localActuals[item.id]
    if (local !== undefined) return String(local)
    return item.actual !== undefined ? String(item.actual) : ''
  }

  function getEffectiveActual(item: BudgetItem): number | undefined {
    if (item.id in localActuals) return localActuals[item.id]
    return item.actual
  }

  function handleActualBlur(item: BudgetItem, value: string) {
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10)
    const actual = isNaN(n) ? undefined : n
    setLocalActuals(prev => ({ ...prev, [item.id]: actual }))
    setActual(item.id, actual)
  }

  // Merge Firebase items with local actuals for display/totals
  const mergedItems = items.map(i => ({
    ...i,
    actual: getEffectiveActual(i),
  }))

  const totalLow    = mergedItems.reduce((s, i) => s + i.low, 0)
  const totalHigh   = mergedItems.reduce((s, i) => s + i.high, 0)
  const totalActual = mergedItems.filter(i => i.actual !== undefined).reduce((s, i) => s + (i.actual ?? 0), 0)
  const hasActuals  = mergedItems.some(i => i.actual !== undefined)

  const totalVariance = mergedItems
    .filter(i => i.actual != null)
    .reduce((sum, i) => sum + (i.actual! - (i.low + i.high) / 2), 0)

  if (loading) return (
    <div>
      <PageHeader title="Budget" subtitle="All DIY — supply costs only" />
      <div className="animate-pulse space-y-2">
        {[0,1,2,3].map(i => <div key={i} className="h-10 rounded bg-white/5" />)}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Budget" subtitle="All DIY — supply costs only" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-garden-text/40">
              <th className="pb-2 pr-4 font-normal">Item</th>
              <th className="pb-2 pr-4 text-right font-normal">Low</th>
              <th className="pb-2 pr-4 text-right font-normal">High</th>
              <th className="pb-2 pr-4 text-right font-normal">Actual</th>
              <th className="pb-2 text-right font-normal">Variance</th>
              <th className="pb-2 pl-2 font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mergedItems.map(item => (
              <tr key={item.id} className="group">
                <td className="py-2.5 pr-4 text-garden-text/80">{item.name}</td>
                <td className="py-2.5 pr-4 text-right text-garden-text/50">{fmt(item.low)}</td>
                <td className="py-2.5 pr-4 text-right text-garden-text/50">{fmt(item.high)}</td>
                <td className="py-2.5 pr-4 text-right">
                  <input
                    data-testid="actual-input"
                    type="text"
                    placeholder="—"
                    value={getDisplayValue(item)}
                    onChange={e => {
                      const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
                      setLocalActuals(prev => ({ ...prev, [item.id]: isNaN(n) ? undefined : n }))
                    }}
                    onBlur={e => handleActualBlur(item, e.target.value)}
                    className="w-24 rounded border border-transparent bg-transparent px-2 py-0.5 text-right text-garden-text/70 transition focus:border-white/20 focus:bg-white/5 focus:outline-none"
                  />
                </td>
                <td className="py-2.5 text-right">
                  <VariancePill actual={item.actual} low={item.low} high={item.high} />
                </td>
                <td className="py-2.5 pl-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditItem(items.find(i => i.id === item.id) ?? null)}
                      className="text-xs text-garden-text/20 hover:text-amber px-1"
                      aria-label="Edit budget item"
                    >✎</button>
                    <button
                      data-testid="budget-delete-btn"
                      onClick={() => setItemToDelete(items.find(i => i.id === item.id) ?? null)}
                      className="text-xs text-garden-text/20 hover:text-[#9E4E24] px-1"
                      aria-label="Delete budget item"
                    >✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-white/20 font-medium">
              <td className="py-3 pr-4 text-garden-text">Total</td>
              <td className="py-3 pr-4 text-right text-garden-text/70">{fmt(totalLow)}</td>
              <td className="py-3 pr-4 text-right text-garden-text/70">{fmt(totalHigh)}</td>
              <td className="py-3 pr-4 text-right text-amber">
                {hasActuals ? fmt(totalActual) : '—'}
              </td>
              <td className="py-3 text-right">
                {hasActuals && (
                  <span
                    data-testid="total-variance"
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      totalVariance > 0
                        ? 'bg-[#9E4E24]/20 text-[#9E4E24]'
                        : 'bg-moss/20 text-[#8fbb8a]'
                    }`}
                  >
                    {totalVariance > 0 ? '+' : ''}£{Math.abs(Math.round(totalVariance)).toLocaleString('en-GB')}
                  </span>
                )}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        onClick={() => setAddingItem(true)}
        className="mt-4 flex w-full items-center gap-2 rounded border border-dashed border-white/10 px-4 py-3 text-sm text-garden-text/40 hover:border-amber/30 hover:text-amber"
      >
        ＋ Add budget item
      </button>

      <BudgetItemModal
        key={editItem?.id ?? 'new'}
        open={addingItem || editItem !== null}
        item={editItem ?? undefined}
        onSave={data => {
          if (editItem) updateBudgetItem(editItem.id, data)
          else addBudgetItem(data)
        }}
        onClose={() => { setAddingItem(false); setEditItem(null) }}
      />

      <ConfirmModal
        open={itemToDelete !== null}
        title={`Delete "${itemToDelete?.name}"?`}
        body="This will permanently remove this budget item."
        onConfirm={() => { if (itemToDelete) deleteBudgetItem(itemToDelete.id); setItemToDelete(null) }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  )
}

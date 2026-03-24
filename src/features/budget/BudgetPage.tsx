import { useState } from 'react'
import { PageHeader, Badge } from '../../design-system'
import { BUDGET_ITEMS } from '../../lib/mock-data'
import type { BudgetItem } from '../../types'

function fmt(n: number) {
  return '£' + n.toLocaleString('en-GB')
}

function VariancePill({ item }: { item: BudgetItem }) {
  if (item.actual === undefined) return null
  const mid  = (item.low + item.high) / 2
  const diff = item.actual - mid
  const over = diff > 0
  return (
    <Badge variant={over ? 'danger' : 'success'}>
      {over ? '+' : ''}{fmt(Math.round(diff))}
    </Badge>
  )
}

export function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>(BUDGET_ITEMS)

  function setActual(id: string, value: string) {
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10)
    setItems(prev =>
      prev.map(item => item.id !== id ? item : {
        ...item,
        actual: isNaN(n) ? undefined : n,
      })
    )
  }

  const totalLow    = items.reduce((s, i) => s + i.low, 0)
  const totalHigh   = items.reduce((s, i) => s + i.high, 0)
  const totalActual = items.filter(i => i.actual !== undefined).reduce((s, i) => s + (i.actual ?? 0), 0)
  const hasActuals  = items.some(i => i.actual !== undefined)

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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="group">
                <td className="py-2.5 pr-4 text-garden-text/80">{item.name}</td>
                <td className="py-2.5 pr-4 text-right text-garden-text/50">{fmt(item.low)}</td>
                <td className="py-2.5 pr-4 text-right text-garden-text/50">{fmt(item.high)}</td>
                <td className="py-2.5 pr-4 text-right">
                  <input
                    type="text"
                    placeholder="—"
                    defaultValue={item.actual !== undefined ? String(item.actual) : ''}
                    onBlur={e => setActual(item.id, e.target.value)}
                    className="w-24 rounded border border-transparent bg-transparent px-2 py-0.5 text-right text-garden-text/70 transition focus:border-white/20 focus:bg-white/5 focus:outline-none"
                  />
                </td>
                <td className="py-2.5 text-right">
                  <VariancePill item={item} />
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
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

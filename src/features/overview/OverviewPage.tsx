import { Link } from 'react-router-dom'
import { PageHeader, Card, Badge, Skeleton } from '../../design-system'
import { usePhases, useBudget, useMaterials } from '../../lib/firebase/hooks'

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map(i => (
        <Card key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  )
}

function fmt(n: number) {
  return '£' + n.toLocaleString('en-GB')
}

export function OverviewPage() {
  const { phases, loading: phasesLoading }            = usePhases()
  const { items: budgetItems, loading: budgetLoading } = useBudget()
  const { materials, loading: materialsLoading }       = useMaterials()

  const loading = phasesLoading || budgetLoading || materialsLoading

  const totalTasks   = phases.reduce((n, p) => n + p.tasks.length, 0)
  const doneTasks    = phases.reduce((n, p) => n + p.tasks.filter(t => t.done).length, 0)
  const currentPhase = phases.find(p => p.status === 'current')

  const budgetLow  = budgetItems.reduce((s, i) => s + i.low, 0)
  const budgetHigh = budgetItems.reduce((s, i) => s + i.high, 0)

  const orderedMaterials = materials.filter(m => m.status === 'ordered' || m.status === 'delivered').length

  if (loading) return (
    <div>
      <PageHeader title="Overview" subtitle="Mitchell Garden — Summer 2026" />
      <OverviewSkeleton />
    </div>
  )

  return (
    <div>
      <PageHeader title="Overview" subtitle="Mitchell Garden — Summer 2026" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Tasks */}
        <Link to="/plan">
          <Card className="hover:border-white/20 transition-colors">
            <p className="text-xs text-garden-text/40 uppercase tracking-widest">Tasks</p>
            <p className="mt-2 font-display text-3xl text-amber">{doneTasks}<span className="text-base text-garden-text/40">/{totalTasks}</span></p>
            <p className="mt-1 text-sm text-garden-text/60">tasks complete</p>
            {currentPhase && (
              <div className="mt-3">
                <Badge variant="warning">Phase {currentPhase.num} — {currentPhase.title}</Badge>
              </div>
            )}
          </Card>
        </Link>

        {/* Budget */}
        <Link to="/budget">
          <Card className="hover:border-white/20 transition-colors">
            <p className="text-xs text-garden-text/40 uppercase tracking-widest">Budget</p>
            <p className="mt-2 font-display text-3xl text-amber">{fmt(budgetLow)}</p>
            <p className="mt-1 text-sm text-garden-text/60">low estimate</p>
            <p className="mt-1 text-xs text-garden-text/40">up to {fmt(budgetHigh)}</p>
          </Card>
        </Link>

        {/* Materials */}
        <Link to="/materials">
          <Card className="hover:border-white/20 transition-colors">
            <p className="text-xs text-garden-text/40 uppercase tracking-widest">Materials</p>
            <p className="mt-2 font-display text-3xl text-amber">{orderedMaterials}<span className="text-base text-garden-text/40">/{materials.length}</span></p>
            <p className="mt-1 text-sm text-garden-text/60">ordered or delivered</p>
          </Card>
        </Link>

      </div>

      {/* Next actions */}
      {currentPhase && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-garden-text/40">Next up — Phase {currentPhase.num}</h2>
          <Card>
            <ul className="space-y-2">
              {currentPhase.tasks.filter(t => !t.done).slice(0, 5).map(task => (
                <li key={task.id} className="flex items-start gap-2 text-sm text-garden-text/70">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber/60" />
                  {task.text}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}

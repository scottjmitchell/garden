// src/app/layout/Sidebar.tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',          label: 'Overview',  icon: '⊞' },
  { to: '/plan',      label: 'Plan',      icon: '✓' },
  { to: '/materials', label: 'Materials', icon: '◈' },
  { to: '/budget',    label: 'Budget',    icon: '£' },
  { to: '/journal',   label: 'Journal',   icon: '▣' },
  { to: '/map',       label: 'Map',       icon: '⬡' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-shrink-0 flex-col border-r border-white/10 bg-[#0c0f0a] transition-all duration-200 ${
        collapsed ? 'w-13' : 'w-44'
      }`}
    >
      {/* Logo row */}
      <div className="flex min-h-13 items-center justify-between border-b border-white/10 px-3.5">
        {!collapsed && (
          <span className="font-display text-lg text-amber">Mitchell Garden</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto shrink-0 p-1 text-garden-text/40 hover:text-amber"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 overflow-hidden border-l-2 px-3.5 py-2 text-xs tracking-wide transition-colors ${
                collapsed ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'border-amber bg-amber/5 text-amber'
                  : 'border-transparent text-garden-text/60 hover:bg-white/5 hover:text-garden-text'
              }`
            }
          >
            <span className="shrink-0 text-sm" aria-hidden="true">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 p-3">
        <button
          aria-label="Sign out"
          className={`flex items-center gap-2 text-xs text-garden-text/40 hover:text-garden-text/70 ${
            collapsed ? 'justify-center w-full' : ''
          }`}
        >
          <span>⎋</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

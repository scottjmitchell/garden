import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Overview'  },
  { to: '/plan',      label: 'Plan'      },
  { to: '/materials', label: 'Materials' },
  { to: '/budget',    label: 'Budget'    },
  { to: '/journal',   label: 'Journal'   },
  { to: '/map',       label: 'Map'       },
]

function linkClass({ isActive }: { isActive: boolean }) {
  return `text-sm transition-colors ${
    isActive ? 'text-amber' : 'text-garden-text/60 hover:text-garden-text'
  }`
}

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b border-white/10 bg-garden-bg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="font-display text-xl text-amber">
          The Mitchell Garden
        </NavLink>

        {/* Desktop links — hidden below md breakpoint */}
        <div className="hidden gap-6 md:flex">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Hamburger — visible only below md */}
        <button
          className="p-2 text-garden-text md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-white/10 md:hidden">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm ${isActive ? 'text-amber' : 'text-garden-text/60'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

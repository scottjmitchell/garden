// src/app/layout/AppShell.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex h-screen bg-garden-bg text-garden-text font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

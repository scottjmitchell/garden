import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-garden-bg text-garden-text font-sans">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

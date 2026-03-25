import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { AuthProvider, useAuth } from './AuthProvider'
import { OverviewPage }   from '../features/overview/OverviewPage'
import { PlanPage }       from '../features/plan/PlanPage'
import { MaterialsPage }  from '../features/materials/MaterialsPage'
import { BudgetPage }     from '../features/budget/BudgetPage'
import { JournalPage }    from '../features/journal/JournalPage'
import { MapPage }        from '../features/map/MapPage'
import { ComponentsPage } from '../features/components/ComponentsPage'
import { LoginPage }      from '../features/login/LoginPage'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/"           element={<OverviewPage />}   />
            <Route path="/plan"       element={<PlanPage />}       />
            <Route path="/materials"  element={<MaterialsPage />}  />
            <Route path="/budget"     element={<BudgetPage />}     />
            <Route path="/journal"    element={<JournalPage />}    />
            <Route path="/map"        element={<MapPage />}        />
            <Route path="/components" element={<ComponentsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

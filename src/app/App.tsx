import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OverviewPage }   from '../features/overview/OverviewPage'
import { PlanPage }       from '../features/plan/PlanPage'
import { MaterialsPage }  from '../features/materials/MaterialsPage'
import { BudgetPage }     from '../features/budget/BudgetPage'
import { JournalPage }    from '../features/journal/JournalPage'
import { MapPage }        from '../features/map/MapPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"          element={<OverviewPage />}  />
          <Route path="/plan"      element={<PlanPage />}      />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/budget"    element={<BudgetPage />}    />
          <Route path="/journal"   element={<JournalPage />}   />
          <Route path="/map"       element={<MapPage />}       />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

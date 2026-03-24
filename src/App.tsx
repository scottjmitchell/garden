import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-garden-bg text-garden-text font-sans">
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-8">
                <h1 className="font-display text-3xl text-amber">The Mitchell Garden</h1>
                <p className="mt-2 text-sm opacity-60">App shell coming in Phase 2.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

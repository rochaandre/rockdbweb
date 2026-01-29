import { SessionsView } from '@/components/sessions/sessions-view'
import { DashboardView } from '@/pages/dashboard-view'
import { DatabasesView } from '@/pages/databases-view'
import { SettingsView } from '@/pages/settings-view'
import { AppProvider } from '@/context/app-context'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/databases" element={<DatabasesView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App

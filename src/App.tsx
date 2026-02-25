import { SessionsView } from '@/components/sessions/sessions-view'
import { DashboardView } from '@/pages/dashboard-view'
import { DatabasesView } from '@/pages/databases-view'
import { SettingsView } from '@/pages/settings-view'
import { BackupsView } from '@/pages/backups-view'
import { StorageView } from '@/pages/storage-view'
import { LogsView } from '@/pages/logs-view'
import { ConfigurationView } from '@/pages/configuration-view'
import { ExplainPlanView } from '@/pages/explain-plan-view'
import { StatisticsView } from '@/pages/statistics-view'
import { SqlDetailsView } from '@/pages/sql-details-view'
import { SqlCentralView } from '@/pages/sql-central-view'
import { SqlDashboardView } from '@/pages/sql-dashboard-view'
import { SqlReportView } from '@/pages/sql-report-view'
import { BlockExplorerView } from '@/pages/block-explorer-view'
import { AsmExplorerView } from '@/pages/asm-explorer-view'
import { RedoLogView } from '@/pages/redo-log-view'
import { JobsView } from '@/pages/jobs-view'
import { HealthcheckView } from '@/pages/healthcheck-view'
import { TimeMachineView } from '@/pages/time-machine-view'
import { ServersView } from '@/pages/servers-view'
import { LongOperationsView } from '@/pages/long-operations-view'
import { ToolsView } from '@/pages/tools-view'
import { AppProvider } from '@/context/app-context'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppProvider>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/backups" element={<BackupsView />} />
          <Route path="/databases" element={<DatabasesView />} />
          <Route path="/storage" element={<StorageView />} />
          <Route path="/logs" element={<LogsView />} />
          <Route path="/long-operations" element={<LongOperationsView />} />
          <Route path="/tools" element={<ToolsView />} />
          <Route path="/configuration" element={<ConfigurationView />} />
          <Route path="/statistics" element={<StatisticsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/explain-plan" element={<ExplainPlanView />} />
          <Route path="/explain-plan/:sqlId" element={<ExplainPlanView />} />
          <Route path="/sql-details/:sqlId" element={<SqlDetailsView />} />
          <Route path="/sql-central/*" element={<SqlCentralView />} />
          <Route path="/sql-dashboard" element={<SqlDashboardView />} />
          <Route path="/sql-report/:reportType/:sqlId" element={<SqlReportView />} />
          <Route path="/block-explorer/:sid" element={<BlockExplorerView />} />
          <Route path="/asm-explorer" element={<AsmExplorerView />} />
          <Route path="/redo-log" element={<RedoLogView />} />
          <Route path="/jobs" element={<JobsView />} />
          <Route path="/healthcheck" element={<HealthcheckView />} />
          <Route path="/timemachine" element={<TimeMachineView />} />
          <Route path="/servers" element={<ServersView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App

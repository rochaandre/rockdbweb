/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: App.tsx
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 *
 * TERMS:
 * 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
 * 2. YOU MAY NOT MODIFY, transform, or build upon this code.
 * 3. You must maintain this header and original naming/ownership information.
 *
 * This software is provided "AS IS", without warranty of any kind.
 * Copyright (c) 2026 Andre Rocha. All rights reserved.
 * ==============================================================================
 */
import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardPage } from '@/pages/dashboard-page'
import { StoragePage } from '@/pages/storage-page'
import { SessionsPage } from '@/pages/sessions-page'
import { DatabasesPage } from '@/pages/databases-page'
import { ServersPage } from '@/pages/servers-page'
import { LogsPage } from '@/pages/logs-page'
import { ConfigPage } from '@/pages/config-page'
import { BackupsPage } from '@/pages/backups-page'
import { SqlCentralPage } from '@/pages/sql-central-page'
import { MonitoringPage } from '@/pages/monitoring-page'
import { AppProvider } from '@/context/app-context'

export function App() {
  return (
    <AppProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/databases" element={<DatabasesPage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/backups" element={<BackupsPage />} />
            <Route path="/sql-central" element={<SqlCentralPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </AppProvider>
  )
}

export default App

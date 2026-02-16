/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: logs-view.tsx
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
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertLogPanel, DatabaseParamsPanel, OutstandingAlertsPanel } from '@/components/logs/log-panels'
import { API_URL } from '@/context/app-context'

export function LogsView() {
    const [activeTab, setActiveTab] = useState('alert')
    const [alertLogs, setAlertLogs] = useState<any[]>([])
    const [params, setParams] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])

    const fetchLogs = async () => {
        try {
            const [logsRes, paramsRes, alertsRes] = await Promise.all([
                fetch(`${API_URL}/logs/alert`),
                fetch(`${API_URL}/logs/parameters`),
                fetch(`${API_URL}/logs/outstanding`)
            ])
            if (logsRes.ok) setAlertLogs(await logsRes.json())
            if (paramsRes.ok) setParams(await paramsRes.json())
            if (alertsRes.ok) setAlerts(await alertsRes.json())
        } catch (error) {
            console.error('Error fetching logs:', error)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Diagnostics & Logs</h1>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="alert"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Alert Log
                            </TabsTrigger>
                            <TabsTrigger
                                value="alerts"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Outstanding Alerts
                            </TabsTrigger>
                            <TabsTrigger
                                value="params"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                DB Parameters
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="alert" className="flex-1 mt-4 overflow-auto">
                        <AlertLogPanel logs={alertLogs} />
                    </TabsContent>
                    <TabsContent value="alerts" className="flex-1 mt-4 overflow-auto">
                        <OutstandingAlertsPanel alerts={alerts} />
                    </TabsContent>
                    <TabsContent value="params" className="flex-1 mt-4 overflow-auto">
                        <DatabaseParamsPanel params={params} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

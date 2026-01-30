import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogViewer, OutstandingAlertsTable } from '@/components/logs/logs-components'
import { Button } from '@/components/ui/button'

import { RefreshCw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { API_URL } from '@/context/app-context'

export function LogsView() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [logs, setLogs] = useState<any[]>([])
    const [outstandingAlerts, setOutstandingAlerts] = useState<any[]>([])

    const fetchLogs = async () => {
        setIsRefreshing(true)
        try {
            const [logsRes, alertsRes] = await Promise.all([
                fetch(`${API_URL}/logs/alert`),
                fetch(`${API_URL}/logs/outstanding`)
            ])
            if (logsRes.ok) setLogs(await logsRes.json())
            if (alertsRes.ok) setOutstandingAlerts(await alertsRes.json())
        } catch (error) {
            console.error('Error fetching alert logs:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const handleRefresh = () => {
        fetchLogs()
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Logs & Alerts</h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={twMerge("size-4", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                </div>

                <Tabs defaultValue="alerts" className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="alerts"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Outstanding Alerts
                            </TabsTrigger>
                            <TabsTrigger
                                value="log"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Alert Log
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="alerts" className="flex-1 mt-4 overflow-auto">
                        <OutstandingAlertsTable alerts={outstandingAlerts} />
                    </TabsContent>

                    <TabsContent value="log" className="flex-1 mt-4 overflow-hidden flex flex-col">
                        <LogViewer logs={logs} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

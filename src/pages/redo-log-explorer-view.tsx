/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: redo-log-explorer-view.tsx
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
import {
    RedoGroupsTable,
    RedoFilesTable,
    RedoHistoryTable,
    LogBufferStats,
    RedoThreadsTable,
    ArchivesTable,
    StandbyGroupsTable,
    RedoChartsTab,
    RedoResizeTab
} from '@/components/redo/redo-components'
import { API_URL, useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw, RotateCw } from 'lucide-react'

export function RedoLogExplorerView() {
    const { logAction } = useApp()
    const [activeTab, setActiveTab] = useState('groups')
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<any>({
        groups: [],
        files: [],
        history: [],
        buffer: [],
        threads: [],
        archives: [],
        standby: []
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [g, f, h, b, t, a, s] = await Promise.all([
                fetch(`${API_URL}/redo/groups`),
                fetch(`${API_URL}/redo/files`),
                fetch(`${API_URL}/redo/history`),
                fetch(`${API_URL}/redo/buffer`),
                fetch(`${API_URL}/redo/threads`),
                fetch(`${API_URL}/redo/archives`),
                fetch(`${API_URL}/redo/standby`)
            ])

            setData({
                groups: g.ok ? await g.json() : [],
                files: f.ok ? await f.json() : [],
                history: h.ok ? await h.json() : [],
                buffer: b.ok ? await b.json() : [],
                threads: t.ok ? await t.json() : [],
                archives: a.ok ? await a.json() : [],
                standby: s.ok ? await s.json() : []
            })
        } catch (error) {
            console.error('Error fetching redo data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSwitchLog = async () => {
        if (!confirm('Are you sure you want to force a log switch?')) return
        try {
            const res = await fetch(`${API_URL}/redo/switch`, { method: 'POST' })
            if (res.ok) {
                alert('Log switch triggered successfully.')
                logAction('Action', 'RedoLog', 'Forced log switch')
                fetchData()
            }
        } catch (error) {
            console.error('Error switching log:', error)
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Redo Log Explorer</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSwitchLog} className="gap-2">
                            <RotateCw className="size-4" />
                            Switch Log
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="gap-2">
                            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6 overflow-x-auto justify-start h-auto pb-1 flex-nowrap">
                            <TabsTrigger value="groups" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Groups</TabsTrigger>
                            <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Files</TabsTrigger>
                            <TabsTrigger value="standby" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Standby</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">History</TabsTrigger>
                            <TabsTrigger value="archives" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Archives</TabsTrigger>
                            <TabsTrigger value="buffer" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Latch/Buffer</TabsTrigger>
                            <TabsTrigger value="threads" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Threads</TabsTrigger>
                            <TabsTrigger value="graphics" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Graphics</TabsTrigger>
                            <TabsTrigger value="resize" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Resize Group</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 mt-4 overflow-auto min-h-0">
                        <TabsContent value="groups" className="m-0"><RedoGroupsTable groups={data.groups} /></TabsContent>
                        <TabsContent value="files" className="m-0"><RedoFilesTable files={data.files} /></TabsContent>
                        <TabsContent value="standby" className="m-0"><StandbyGroupsTable groups={data.standby} /></TabsContent>
                        <TabsContent value="history" className="m-0"><RedoHistoryTable history={data.history} /></TabsContent>
                        <TabsContent value="archives" className="m-0"><ArchivesTable archives={data.archives} /></TabsContent>
                        <TabsContent value="buffer" className="m-0"><LogBufferStats stats={data.buffer} /></TabsContent>
                        <TabsContent value="threads" className="m-0"><RedoThreadsTable threads={data.threads} /></TabsContent>
                        <TabsContent value="graphics" className="m-0 h-full"><RedoChartsTab history={data.history} /></TabsContent>
                        <TabsContent value="resize" className="m-0 h-full"><RedoResizeTab groups={data.groups} history={data.history} /></TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

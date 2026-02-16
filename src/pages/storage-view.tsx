/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: storage-view.tsx
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
import { TablespacesPanel, TempPanel, UndoPanel, SysauxPanel, ControlFilesPanel, FraPanel } from '@/components/storage/storage-panels'
import { API_URL, useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database } from 'lucide-react'

export function StorageView() {
    const { logAction } = useApp()
    const [activeTab, setActiveTab] = useState('tbs')
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<any>({
        tbs: [],
        fra: [],
        sysaux: { occupants: [], optstat: [], topObjects: [] },
        undo: { stats: [], config: {} },
        temp: [],
        controlfiles: []
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [tbs, fra, sysaux, undo, temp, ctrl] = await Promise.all([
                fetch(`${API_URL}/storage/tablespaces`),
                fetch(`${API_URL}/storage/fra`),
                fetch(`${API_URL}/storage/sysaux`),
                fetch(`${API_URL}/storage/undo`),
                fetch(`${API_URL}/storage/temp`),
                fetch(`${API_URL}/storage/controlfiles`)
            ])

            setData({
                tbs: tbs.ok ? await tbs.json() : [],
                fra: fra.ok ? await fra.json() : [],
                sysaux: sysaux.ok ? await sysaux.json() : { occupants: [], optstat: [], topObjects: [] },
                undo: undo.ok ? await undo.json() : { stats: [], config: {} },
                temp: temp.ok ? await temp.json() : [],
                controlfiles: ctrl.ok ? await ctrl.json() : []
            })
            logAction('Browse', 'Storage', 'Refreshed storage data')
        } catch (error) {
            console.error('Error fetching storage data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Storage Management</h1>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="gap-2">
                        <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger value="tbs" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Tablespaces</TabsTrigger>
                            <TabsTrigger value="fra" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">FRA Usage</TabsTrigger>
                            <TabsTrigger value="sysaux" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">SYSAUX</TabsTrigger>
                            <TabsTrigger value="undo" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">UNDO</TabsTrigger>
                            <TabsTrigger value="temp" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">TEMP</TabsTrigger>
                            <TabsTrigger value="ctrl" className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Control Files</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 mt-4 overflow-auto">
                        <TabsContent value="tbs" className="m-0"><TablespacesPanel data={data.tbs} onRefresh={fetchData} /></TabsContent>
                        <TabsContent value="fra" className="m-0"><FraPanel data={data.fra} /></TabsContent>
                        <TabsContent value="sysaux" className="m-0"><SysauxPanel data={data.sysaux} /></TabsContent>
                        <TabsContent value="undo" className="m-0"><UndoPanel data={data.undo} /></TabsContent>
                        <TabsContent value="temp" className="m-0"><TempPanel data={data.temp} /></TabsContent>
                        <TabsContent value="ctrl" className="m-0"><ControlFilesPanel data={data.controlfiles} /></TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: configuration-view.tsx
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
import { HostInfoPanel, ParametersPanel, ResourceLimitsPanel } from '@/components/configuration/config-panels'
import { API_URL } from '@/context/app-context'

export function ConfigurationView() {
    const [activeTab, setActiveTab] = useState('host')
    const [parameters, setParameters] = useState<any[]>([])

    useEffect(() => {
        const fetchParams = async () => {
            try {
                const res = await fetch(`${API_URL}/configuration/parameters`)
                if (res.ok) setParameters(await res.json())
            } catch (error) {
                console.error('Error fetching parameters:', error)
            } finally {
                // done
            }
        }
        fetchParams()
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Configuration</h1>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="host"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Host Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="params"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Parameters
                            </TabsTrigger>
                            <TabsTrigger
                                value="memory"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Memory Params
                            </TabsTrigger>
                            <TabsTrigger
                                value="altered"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Altered Params
                            </TabsTrigger>
                            <TabsTrigger
                                value="resources"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Resource Limits
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="host" className="flex-1 mt-4 overflow-auto">
                        <HostInfoPanel />
                    </TabsContent>
                    <TabsContent value="params" className="flex-1 mt-4 overflow-auto">
                        <ParametersPanel filterType="ALL" parameters={parameters} />
                    </TabsContent>
                    <TabsContent value="memory" className="flex-1 mt-4 overflow-auto">
                        <ParametersPanel filterType="MEMORY" parameters={parameters} />
                    </TabsContent>
                    <TabsContent value="altered" className="flex-1 mt-4 overflow-auto">
                        <ParametersPanel filterType="ALTERED" parameters={parameters} />
                    </TabsContent>
                    <TabsContent value="resources" className="flex-1 mt-4 overflow-auto">
                        <ResourceLimitsPanel />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

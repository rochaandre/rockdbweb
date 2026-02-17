/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sessions-view.tsx
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
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { SessionsTable } from '@/components/sessions/sessions-table'
import { SQLDetailsPanel } from '@/components/sessions/sql-details'
import { BlockingPanel } from '@/components/sessions/blocking-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Search, Users, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { useApp, API_URL } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'

export function SessionsView() {
    const { logAction } = useApp()
    const [activeTab, setActiveTab] = usePersistentState('sessions', 'activeTab', 'all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sessions, setSessions] = useState<any[]>([])
    const [blocking, setBlocking] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedSqlId, setSelectedSqlId] = useState<string | null>(null)
    const [selectedSid, setSelectedSid] = useState<number | null>(null)

    const fetchSessions = async () => {
        setIsLoading(true)
        try {
            const [sessRes, blockRes] = await Promise.all([
                fetch(`${API_URL}/sessions`),
                fetch(`${API_URL}/sessions/blocking`)
            ])
            if (sessRes.ok) setSessions(await sessRes.json())
            if (blockRes.ok) setBlocking(await blockRes.json())
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
        const interval = setInterval(fetchSessions, 15000)
        return () => clearInterval(interval)
    }, [])

    const handleSqlSelect = (sqlId: string, sid: number) => {
        setSelectedSqlId(sqlId)
        setSelectedSid(sid)
        logAction('Browse', 'SQL', `Viewed details for SQL ID: ${sqlId}`)
    }

    const handleKill = async (sid: number, serial: number, inst_id: number = 1) => {
        if (confirm(`Are you sure you want to kill session ${sid},${serial}?`)) {
            try {
                const res = await fetch(`${API_URL}/sessions/kill/${sid}/${serial}?inst_id=${inst_id}`, { method: 'POST' })
                if (res.ok) {
                    alert(`Session ${sid} killed.`)
                    logAction('Action', 'Session', `Killed SID: ${sid}, Serial: ${serial}`)
                    fetchSessions()
                }
            } catch (error) {
                console.error('Error killing session:', error)
            }
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Session Explorer</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <Users className="size-3" /> {sessions.length} Connections Active
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter sessions..."
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={isLoading} className="gap-2">
                            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="border-b border-border flex items-center justify-between shrink-0 h-10">
                        <TabsList className="bg-transparent p-0 h-full gap-6">
                            <TabsTrigger
                                value="all"
                                className="h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-md uppercase"
                            >
                                All Sessions
                            </TabsTrigger>
                            <TabsTrigger
                                value="active"
                                className="h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-md uppercase"
                            >
                                Active
                            </TabsTrigger>
                            <TabsTrigger
                                value="blocking"
                                className="h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-md uppercase text-rose-600"
                            >
                                <span className="flex items-center gap-1.5">
                                    <ShieldAlert className="size-3" />
                                    Blocking (Wait)
                                    {blocking.length > 0 && (
                                        <Badge className="ml-1 bg-rose-500 text-white h-4 px-1 min-w-[16px] text-[10px]">{blocking.length}</Badge>
                                    )}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden mt-4 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
                        <div className="xl:col-span-8 overflow-auto min-h-0 border border-border rounded-lg bg-card shadow-sm">
                            <TabsContent value="all" className="m-0 h-full">
                                <SessionsTable
                                    sessions={sessions}
                                    onSelectSql={handleSqlSelect}
                                    onKill={handleKill}
                                    filter={searchQuery}
                                />
                            </TabsContent>
                            <TabsContent value="active" className="m-0 h-full">
                                <SessionsTable
                                    sessions={sessions.filter(s => s.status === 'ACTIVE')}
                                    onSelectSql={handleSqlSelect}
                                    onKill={handleKill}
                                    filter={searchQuery}
                                />
                            </TabsContent>
                            <TabsContent value="blocking" className="m-0 h-full">
                                <BlockingPanel />
                            </TabsContent>
                        </div>

                        <div className="xl:col-span-4 flex flex-col gap-4 overflow-auto min-h-0">
                            <SQLDetailsPanel sqlId={selectedSqlId} sid={selectedSid} />
                        </div>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

import { MainLayout } from '@/components/layout/main-layout'
import { ControlBar, type FilterState } from '@/components/sessions/control-bar'
import { SessionsTable } from '@/components/sessions/sessions-table'
import { BlockingTable } from '@/components/sessions/blocking-table'
import { LongOpsTable } from '@/components/sessions/long-ops-table'
import { DetailSidebar } from '@/components/sessions/detail-sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState, useMemo, useEffect } from 'react'
import { useApp, API_URL } from '@/context/app-context'
import { usePersistentState } from '@/hooks/use-persistent-state'

export function SessionsView() {
    const { logAction } = useApp()
    const [sessions, setSessions] = useState<any[]>([])
    const [selectedSid, setSelectedSid] = useState<number | null>(null)
    const [blockingSessions, setBlockingSessions] = useState<any[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    // Persistent States
    const [activeTab, setActiveTab] = usePersistentState('sessions', 'activeTab', 'sessions')
    const [selectedInstance, setSelectedInstance] = usePersistentState('sessions', 'selectedInstance', 'both')
    const [refreshInterval, setRefreshInterval] = usePersistentState('sessions', 'refreshInterval', 10)
    const [filters, setFilters] = usePersistentState<FilterState>('sessions', 'filters', {
        active: true,
        inactive: true,
        background: true,
        killed: true,
        parallel: true
    })

    // Refresh Control State
    const [isPaused, setIsPaused] = useState(false)

    const fetchSessions = async () => {
        try {
            const instParam = selectedInstance !== "both" ? `?inst_id=${selectedInstance}` : ""

            // Fetch main sessions
            const res = await fetch(`${API_URL}/sessions${instParam}`)
            if (res.ok) {
                const data = await res.json()
                setSessions(data)
            }

            // Fetch blocking sessions for count
            const blockRes = await fetch(`${API_URL}/sessions/blocking${instParam}`)
            if (blockRes.ok) {
                const blockData = await blockRes.json()
                setBlockingSessions(blockData)
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        }
    }

    // Auto-Refresh Effect
    useEffect(() => {
        fetchSessions()
        if (isPaused) return

        const intervalId = setInterval(() => {
            fetchSessions()
            logAction('Auto-Update', 'System', `Refreshing sessions (Interval: ${refreshInterval}s)...`)
        }, refreshInterval * 1000)

        return () => clearInterval(intervalId)
    }, [isPaused, refreshInterval, logAction])

    // Calculate counts on unfiltered data
    const counts = useMemo(() => {
        return {
            active: sessions.filter(s => s.status === 'ACTIVE').length,
            inactive: sessions.filter(s => s.status === 'INACTIVE').length,
            background: sessions.filter(s => s.type === 'BACKGROUND').length,
            killed: sessions.filter(s => s.status === 'KILLED').length,
            parallel: 0 // TODO: backend should return parallel info
        }
    }, [sessions])

    // Filter Logic (Client-Side)
    const filteredData = useMemo(() => {
        return sessions.filter(s => {
            // Status Filters
            if (!filters.active && s.status === 'ACTIVE') return false
            if (!filters.inactive && s.status === 'INACTIVE') return false
            if (!filters.killed && s.status === 'KILLED') return false

            // Type Filters
            const isBackground = s.type === 'BACKGROUND'
            if (!filters.background && isBackground) return false

            // Parallel
            // if (!filters.parallel && isParallel) return false

            return true
        })
    }, [filters, sessions])

    // Generate SQL WHERE Clause for Filters Tab
    const filtersSql = useMemo(() => {
        const conditions: string[] = []

        // Status
        const statusIn: string[] = []
        if (filters.active) statusIn.push("'ACTIVE'")
        if (filters.inactive) statusIn.push("'INACTIVE'")
        if (filters.killed) statusIn.push("'KILLED'")

        if (statusIn.length > 0) {
            conditions.push(`status IN (${statusIn.join(', ')})`)
        } else {
            conditions.push("1=0") // No status selected
        }

        // Background
        if (!filters.background) {
            conditions.push("type != 'BACKGROUND'")
        }

        // Parallel (simplified logic for demo)
        if (!filters.parallel) {
            conditions.push("degree = 1")
        }

        return conditions.length > 0
            ? `SELECT * FROM v$session\nWHERE ${conditions.join('\n  AND ')}`
            : `SELECT * FROM v$session`
    }, [filters])


    // Auto-Refresh Effect
    useEffect(() => {
        if (isPaused) return

        const intervalId = setInterval(() => {
            logAction('Auto-Update', 'System', `Refreshing data (Interval: ${refreshInterval}s)...`)
        }, refreshInterval * 1000)

        return () => clearInterval(intervalId)
    }, [isPaused, refreshInterval, logAction])


    // Handlers
    const handleAction = async (action: string, session: any) => {
        if (action === 'KILL_SESSION') {
            const serial = session['serial#'] || session.serial
            if (confirm(`Are you sure you want to kill session ${session.sid},${serial}?`)) {
                try {
                    const inst_id = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
                    const res = await fetch(`${API_URL}/sessions/kill/${session.sid}/${serial}?inst_id=${inst_id}`, {
                        method: 'POST'
                    })
                    if (res.ok) {
                        logAction('Action', 'SessionsTable', `Session ${session.sid} killed successfully`)
                        fetchSessions()
                    }
                } catch (error) {
                    console.error('Error killing session:', error)
                }
            }
        }
        logAction('Context Menu', 'SessionsTable', `Action: ${action} | SID: ${session?.sid ?? 'N/A'}`)
    }

    const [sessionSql, setSessionSql] = useState<string>('')

    const handleSelect = async (sid: number) => {
        setSelectedSid(sid)
        const session = sessions.find(s => s.sid === sid)
        if (session && session.sql_id) {
            try {
                const instParam = session.inst_id ? `?inst_id=${session.inst_id}` : ""
                const res = await fetch(`${API_URL}/sessions/sql/${session.sql_id}${instParam}`)
                if (res.ok) {
                    const data = await res.json()
                    setSessionSql(data.sql_text)
                }
            } catch (error) {
                console.error('Error fetching session SQL:', error)
                setSessionSql('Error fetching SQL text')
            }
        } else {
            setSessionSql('No SQL active for this session')
        }
        logAction('Row Select', 'SessionsView', `Loading data for SID: ${sid} ...`)
    }

    const handleFilterChange = (key: keyof FilterState, checked: boolean) => {
        setFilters((prev: FilterState) => ({ ...prev, [key]: checked }))
    }

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1)
        fetchSessions()
        logAction('Manual Update', 'ControlBar', 'Forcing data refresh across all tabs...')
    }

    const handleSearch = () => {
        logAction('Navigation', 'ControlBar', 'Opening Search Dialog...')
    }

    const handleSettings = () => {
        logAction('Navigation', 'ControlBar', 'Opening Settings Dialog...')
    }

    const selectedSession = sessions.find(s => s.sid === selectedSid) || null

    return (
        <MainLayout>
            <ControlBar
                filters={filters}
                counts={counts}
                onFilterChange={handleFilterChange}
                isPaused={isPaused}
                refreshInterval={refreshInterval}
                onPauseToggle={() => setIsPaused(p => !p)}
                onUpdate={handleUpdate}
                onIntervalChange={setRefreshInterval}
                onSearch={handleSearch}
                onSettings={handleSettings}
                selectedInstance={selectedInstance}
                onInstanceChange={setSelectedInstance}
            />

            <div className="flex flex-1 gap-2 overflow-hidden h-full">
                <div className="flex flex-1 flex-col overflow-hidden gap-2">
                    {/* Main Tabs Area */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 pt-1">
                            <TabsList className="h-8 bg-transparent p-0 gap-1">
                                <TabsTrigger
                                    value="sessions"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Sessions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="blocking"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Blocking and Waiting Sessions - {blockingSessions.length}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="longops"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Long Operations
                                </TabsTrigger>
                                <TabsTrigger
                                    value="filters"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Filters
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="sessions" className="flex-1 mt-0 p-0 border border-t-0 border-border bg-surface data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                            <SessionsTable
                                data={filteredData}
                                selectedId={selectedSid}
                                onSelect={handleSelect}
                                onAction={handleAction}
                            />
                        </TabsContent>
                        <TabsContent value="blocking" className="flex-1 mt-0 p-0 border border-t-0 border-border bg-surface data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                            <BlockingTable
                                onAction={handleAction}
                                instId={selectedInstance !== "both" ? Number(selectedInstance) : undefined}
                                refreshKey={refreshKey}
                            />
                        </TabsContent>
                        <TabsContent value="longops" className="flex-1 mt-0 p-0 border border-t-0 border-border bg-surface data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                            <LongOpsTable
                                onSelect={handleSelect}
                                onAction={handleAction}
                                selectedId={selectedSid}
                                instId={selectedInstance !== "both" ? Number(selectedInstance) : undefined}
                                refreshKey={refreshKey}
                            />
                        </TabsContent>
                        <TabsContent value="filters" className="flex-1 mt-0 p-4 border border-t-0 border-border bg-surface font-mono text-sm">
                            <div className="rounded-md bg-muted p-4 border border-border">
                                <pre className="whitespace-pre-wrap text-foreground">{filtersSql}</pre>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                This SQL clause represents the current active filters applied to the session list.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>

                <DetailSidebar session={selectedSession} sqlText={sessionSql} />
            </div>
        </MainLayout>
    )
}

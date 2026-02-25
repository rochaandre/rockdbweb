import { MainLayout } from '@/components/layout/main-layout'
import { twMerge } from 'tailwind-merge'
import { ControlBar, type FilterState } from '@/components/sessions/control-bar'
import { SessionsTable } from '@/components/sessions/sessions-table'
import { BlockingTable } from '@/components/sessions/blocking-table'
import { LongOpsTable } from '@/components/sessions/long-ops-table'
import { DetailSidebar } from '@/components/sessions/detail-sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, API_URL } from '@/context/app-context'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { KillCommandsDialog } from '@/components/sessions/kill-commands-dialog'

export function SessionsView() {
    const { logAction, connection } = useApp()
    const [sessions, setSessions] = useState<any[]>([])
    const [selectedSid, setSelectedSid] = useState<number | null>(null)
    const [blockingSessions, setBlockingSessions] = useState<any[]>([])
    const [longOpsSessions, setLongOpsSessions] = useState<any[]>([])
    const [instances, setInstances] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [zombies, setZombies] = useState(0)
    const [showKillCommands, setShowKillCommands] = useState(false)
    const [killCommandSession, setKillCommandSession] = useState<any>(null)

    // Persistent States
    const [activeTab, setActiveTab] = usePersistentState('sessions', 'activeTab', 'sessions')
    const [selectedInstance, setSelectedInstance] = usePersistentState('sessions', 'selectedInstance', 'both')
    const [refreshInterval, setRefreshInterval] = usePersistentState('sessions', 'refreshInterval', 10)
    const [filters, setFilters] = usePersistentState<FilterState>('sessions', 'filters_v1', {
        active: true,
        blocking: true,
        system: true,
        inactive: true,
        waiting: true,
        user: true,
        background: true,
        parallel: true,
        killed: true
    })

    const [searchQuery, setSearchQuery] = useState('')

    // Refresh Control State
    const [isPaused, setIsPaused] = useState(false)

    const fetchSessions = async () => {
        setIsLoading(true)
        try {
            const instParam = selectedInstance !== "both" ? `?inst_id=${selectedInstance}` : ""

            // Fetch main sessions
            const res = await fetch(`${API_URL}/sessions${instParam}`)
            if (res.ok) {
                const data = await res.json()
                setSessions(Array.isArray(data) ? data : [])
            }

            // Fetch blocking sessions for count
            const blockRes = await fetch(`${API_URL}/sessions/blocking${instParam}`)
            if (blockRes.ok) {
                const blockData = await blockRes.json()
                setBlockingSessions(Array.isArray(blockData) ? blockData : [])
            }

            // Fetch zombies
            const zombieRes = await fetch(`${API_URL}/sessions/zombies${instParam}`)
            if (zombieRes.ok) {
                const zombieData = await zombieRes.json()
                setZombies(zombieData.count || 0)
            }

            // Fetch longops
            const longRes = await fetch(`${API_URL}/sessions/longops${instParam}`)
            if (longRes.ok) {
                const longData = await longRes.json()
                setLongOpsSessions(Array.isArray(longData) ? longData : [])
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchInstances = async () => {
        try {
            const res = await fetch(`${API_URL}/sessions/instances`)
            if (res.ok) {
                const data = await res.json()
                setInstances(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error('Error fetching instances:', error)
        }
    }

    // Auto-Refresh Effect
    useEffect(() => {
        fetchInstances()
    }, [connection.id])

    useEffect(() => {
        fetchSessions()
        if (isPaused) return

        const intervalId = setInterval(() => {
            fetchSessions()
            logAction('Auto-Update', 'System', `Refreshing sessions (Interval: ${refreshInterval}s)...`)
        }, refreshInterval * 1000)

        return () => clearInterval(intervalId)
    }, [isPaused, refreshInterval, selectedInstance])

    // Calculate counts on unfiltered data
    const counts = useMemo(() => {
        return {
            active: sessions.filter(s => s.status === 'ACTIVE').length,
            blocking: sessions.filter(s => (s.lck_obj && s.lck_obj > 0) || s.blocking_session).length,
            system: sessions.filter(s => ['SYS', 'SYSTEM'].includes(s.username)).length,
            inactive: sessions.filter(s => s.status === 'INACTIVE').length,
            waiting: sessions.filter(s => s.status === 'ACTIVE' && (s.state === 'WAITING' || s.wait_class !== 'Idle')).length,
            user: sessions.filter(s => !['SYS', 'SYSTEM'].includes(s.username)).length,
            background: sessions.filter(s => s.type === 'BACKGROUND').length,
            parallel: sessions.filter(s => s.program?.includes('(P') || s.px_server_id).length,
            killed: sessions.filter(s => s.status === 'KILLED').length,
            zombies: zombies
        }
    }, [sessions, zombies])

    // Filter Logic (Client-Side)
    const filteredData = useMemo(() => {
        return sessions.filter(s => {
            // Search Filter
            if (searchQuery) {
                const search = searchQuery.toLowerCase()
                const matches = [
                    s.sid?.toString(),
                    s.username?.toLowerCase(),
                    s.program?.toLowerCase(),
                    s.machine?.toLowerCase(),
                    s.sql_id?.toLowerCase(),
                    s.event?.toLowerCase()
                ].some(val => val?.includes(search))
                if (!matches) return false
            }

            // Status Filters
            if (!filters.active && s.status === 'ACTIVE') return false
            if (!filters.inactive && s.status === 'INACTIVE') return false
            if (!filters.killed && s.status === 'KILLED') return false

            // Type Filters
            const isBackground = s.type === 'BACKGROUND'
            if (!filters.background && isBackground) return false

            // System vs User
            const isSystem = ['SYS', 'SYSTEM'].includes(s.username)
            if (!filters.system && isSystem) return false
            if (!filters.user && !isSystem && !isBackground) return false

            // Waiting
            const isWaiting = s.status === 'ACTIVE' && (s.state === 'WAITING' || s.wait_class !== 'Idle')
            if (!filters.waiting && isWaiting) return false

            // Blocking
            const isBlocking = (s.lck_obj && s.lck_obj > 0) || s.blocking_session
            if (!filters.blocking && isBlocking) return false

            // Parallel
            const isParallel = s.program?.includes('(P') || s.px_server_id
            if (!filters.parallel && isParallel) return false

            return true
        })
    }, [filters, sessions, searchQuery])

    // Generate SQL WHERE Clause for Filters Tab
    const filtersSql = useMemo(() => {
        const conditions: string[] = []
        const table = selectedInstance !== 'both' || instances.length > 1 ? 'gv$session' : 'v$session'

        // Instance Filter
        if (selectedInstance !== 'both') {
            conditions.push(`inst_id = ${selectedInstance}`)
        }

        // Status filters mapping
        if (!filters.active) conditions.push("status != 'ACTIVE'")
        if (!filters.inactive) conditions.push("status != 'INACTIVE'")
        if (!filters.killed) conditions.push("status != 'KILLED'")

        // Category filters
        if (!filters.background) conditions.push("type != 'BACKGROUND'")
        if (!filters.system) conditions.push("username NOT IN ('SYS', 'SYSTEM')")
        if (!filters.user) conditions.push("username IN ('SYS', 'SYSTEM')")

        // Wait state
        if (!filters.waiting) conditions.push("NOT (status = 'ACTIVE' AND (state = 'WAITING' OR wait_class != 'Idle'))")

        // Parallel
        if (!filters.parallel) conditions.push("NOT (program LIKE '%(P%)' OR px_server_id IS NOT NULL)")

        // Blocker
        if (!filters.blocking) conditions.push("NOT ((lck_obj IS NOT NULL AND lck_obj > 0) OR blocking_session IS NOT NULL)")

        return conditions.length > 0
            ? `SELECT * FROM ${table}\nWHERE ${conditions.join('\n  AND ')}`
            : `SELECT * FROM ${table}`
    }, [filters, selectedInstance, instances])




    const navigate = useNavigate()

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
        } else if (action === 'SQL_CENTRAL') {
            const sid = session.sid || session.SID
            const serial = session['serial#'] || session.serial || ''
            const spid = session.spid || session.SPID || ''
            const inst = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
            navigate(`/sql-central/sessions_replace?SID=${sid}&SERIAL=${serial}&SPID=${spid}&inst_id=${inst}`)
        } else if (action === 'SHOW_KILL_SQL_CENTRAL') {
            const sid = session.sid || session.SID
            const serial = session['serial#'] || session.serial || ''
            const sqlId = session.sql_id || session.SQL_ID || ''
            const inst = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
            navigate(`/sql-central/kill_session_replace?SID=${sid}&SERIAL=${serial}&INST_ID=${inst}&SQL_ID=${sqlId}`)
        } else if (action === 'SHOW_SQL') {
            handleSelect(session.sid)
        } else if (action === 'SQL_STATS') {
            const sqlId = session.sql_id || session.SQL_ID || session.sqlId
            const inst = session.inst_id || session.INST_ID || (selectedInstance !== "both" ? selectedInstance : 1)
            const child = session.child || session.sql_child_number || session.SQL_CHILD_NUMBER || 0

            console.log('SQL_STATS Action:', { action, sqlId, inst, child, sessionKeys: Object.keys(session) });

            if (sqlId && sqlId !== 'undefined') {
                const sid = session.sid || session.SID || ''
                const serial = session['serial#'] || session.serial || ''
                const spid = session.spid || session.SPID || ''
                navigate(`/sql-report/statistics/${sqlId}?inst_id=${inst}&child_number=${child}&sid=${sid}&serial=${serial}&spid=${spid}`)
            } else {
                console.warn('SQL_STATS: Missing or invalid SQL ID', { sqlId, session });
                logAction('Error', 'SessionsView', `Cannot open SQL Statistics: SQL ID is ${sqlId || 'missing'}`)
            }
        } else if (action === 'EXPLORE_SQL_DETAILS') {
            const sqlId = session.sql_id || session.SQL_ID || session.sqlId
            const inst = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
            navigate(`/sql-central/oracle_internal/common/sql_details.sql?sql_id=${sqlId}&inst_id=${inst}`)
        } else if (action === 'CREATE_TUNING_TASK') {
            const sqlId = session.sql_id || session.SQL_ID || session.sqlId
            const inst = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
            navigate(`/sql-central/oracle_internal/common/sql_profile.sql?sql_id=${sqlId}&inst_id=${inst}`)
        } else if (action === 'BLOCK_EXPLORER') {
            const inst = session.inst_id || (selectedInstance !== "both" ? selectedInstance : 1)
            navigate(`/block-explorer/${session.sid}?inst_id=${inst}`)
        }
        else if (action === 'KILL_COMMANDS') {
            setKillCommandSession(session)
            setShowKillCommands(true)
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

    const handleSearch = (val: string) => {
        setSearchQuery(val)
    }

    const handleSettings = () => {
        logAction('Navigation', 'ControlBar', 'Opening Settings Dialog...')
    }

    const selectedSession = sessions.find(s => s.sid === selectedSid) || null

    return (
        <MainLayout className="p-0 overflow-hidden bg-white dark:bg-slate-950">
            <div className="flex h-full w-full">
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
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
                        instances={instances}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        totalSessions={sessions.length}
                        filteredCount={filteredData.length}
                    />

                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Main Tabs Area */}
                        {/* Main Tabs Area */}
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 shrink-0">
                                <TabsList className="h-10 bg-transparent p-0 flex gap-8">
                                    <TabsTrigger
                                        value="sessions"
                                        className="px-1 py-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2 bg-transparent rounded-none h-auto
                                        data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 
                                        data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Sessions ({filteredData.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="blocking"
                                        className={twMerge(
                                            "px-1 py-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2 bg-transparent rounded-none h-auto",
                                            "data-[state=active]:border-rose-600 data-[state=active]:text-rose-600",
                                            "data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
                                            blockingSessions.length > 0 && "text-rose-500 animate-pulse"
                                        )}
                                    >
                                        Blocks ({blockingSessions.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="longops"
                                        className="px-1 py-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2 bg-transparent rounded-none h-auto
                                        data-[state=active]:border-amber-600 data-[state=active]:text-amber-600
                                        data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Long Ops ({longOpsSessions.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="filters"
                                        className="px-1 py-4 text-[11px] font-bold uppercase tracking-tight transition-all border-b-2 bg-transparent rounded-none h-auto
                                        data-[state=active]:border-zinc-500 data-[state=active]:text-zinc-600
                                        data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Filters SQL
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-auto relative bg-white dark:bg-slate-950">
                                <TabsContent value="sessions" className="flex-1 h-full m-0 p-0 overflow-hidden data-[state=active]:flex">
                                    <SessionsTable
                                        data={filteredData}
                                        selectedId={selectedSid}
                                        onSelect={handleSelect}
                                        onAction={handleAction}
                                    />
                                </TabsContent>
                                <TabsContent value="blocking" className="flex-1 h-full m-0 p-0 overflow-hidden data-[state=active]:flex">
                                    <BlockingTable
                                        onAction={handleAction}
                                        instId={selectedInstance !== "both" ? Number(selectedInstance) : undefined}
                                        refreshKey={refreshKey}
                                        data={blockingSessions}
                                    />
                                </TabsContent>
                                <TabsContent value="longops" className="flex-1 h-full m-0 p-0 overflow-hidden data-[state=active]:flex">
                                    <LongOpsTable
                                        onSelect={handleSelect}
                                        onAction={handleAction}
                                        selectedId={selectedSid}
                                        instId={selectedInstance !== "both" ? Number(selectedInstance) : undefined}
                                        refreshKey={refreshKey}
                                        data={longOpsSessions}
                                    />
                                </TabsContent>
                                <TabsContent value="filters" className="flex-1 h-full m-0 p-6 overflow-auto data-[state=active]:block">
                                    <div className="space-y-8 max-w-4xl mx-auto">
                                        <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-lg ring-1 ring-white/5">
                                            <div className="px-5 py-3 border-b border-border/20 bg-muted/20">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Active Filters SQL Projection</h3>
                                            </div>
                                            <div className="p-6 font-mono text-xs leading-relaxed text-primary/80 selection:bg-primary/20 bg-black/5">
                                                <pre className="whitespace-pre-wrap">{filtersSql}</pre>
                                            </div>
                                        </div>

                                        {instances.length > 0 && (
                                            <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-lg ring-1 ring-white/5">
                                                <div className="px-5 py-3 border-b border-border/20 bg-muted/20">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Cluster Topology Analysis</h3>
                                                </div>
                                                <div className="p-0 overflow-hidden">
                                                    <table className="w-full text-left text-[11px] border-collapse">
                                                        <thead className="bg-muted/10 text-muted-foreground font-black uppercase tracking-widest border-b border-border/20">
                                                            <tr>
                                                                <th className="px-5 py-3 w-16">ID</th>
                                                                <th className="px-5 py-3">Instance Name</th>
                                                                <th className="px-5 py-3">Host Name</th>
                                                                <th className="px-5 py-3 text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/10">
                                                            {instances.map((inst: any) => (
                                                                <tr key={inst.inst_id} className="hover:bg-primary/5 transition-colors group">
                                                                    <td className="px-5 py-3 font-mono font-bold text-primary">{inst.inst_id}</td>
                                                                    <td className="px-5 py-3 font-medium">{inst.instance_name}</td>
                                                                    <td className="px-5 py-3 text-muted-foreground">{inst.host_name}</td>
                                                                    <td className="px-5 py-3 text-right">
                                                                        <span className={twMerge(
                                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border",
                                                                            inst.status === 'OPEN'
                                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                        )}>
                                                                            {inst.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>

                <DetailSidebar session={selectedSession} sqlText={sessionSql} />

                {showKillCommands && (
                    <KillCommandsDialog
                        session={killCommandSession}
                        onClose={() => setShowKillCommands(false)}
                    />
                )}
            </div>
        </MainLayout>
    )
}


import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Lock, Activity, FileText, Table, AlertTriangle, Code, Skull, Loader2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp, API_URL } from '@/context/app-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils'

// Initial state for details
const INITIAL_DETAILS = {
    sid: 0,
    serial: 0,
    username: 'Loading...',
    status: 'UNKNOWN',
    sql_text: 'Fetching SQL...',
    plan: [],
    objects: [],
    users_in_lock: 0,
    opened_cursors: 0,
    lockedTableSize: '0 B'
}

export function BlockExplorerView() {
    const { sid } = useParams()
    const [searchParams] = useSearchParams()
    const inst_id = searchParams.get('inst_id') || '1'
    const navigate = useNavigate()
    const { logAction } = useApp()

    const [details, setDetails] = useState<any>(INITIAL_DETAILS)
    const [selectedObject, setSelectedObject] = useState<any | null>(null)
    const [objectDdl, setObjectDdl] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isKilling, setIsKilling] = useState(false)
    const [isDdlLoading, setIsDdlLoading] = useState(false)

    // Cursor Tab States
    const [cursors, setCursors] = useState<any[]>([])
    const [selectedCursor, setSelectedCursor] = useState<any | null>(null)
    const [cursorPlan, setCursorPlan] = useState<any[]>([])
    const [isCursorLoading, setIsCursorLoading] = useState(false)
    const [isCursorPlanLoading, setIsCursorPlanLoading] = useState(false)
    const [lockDetails, setLockDetails] = useState<any>({ blocking_j: [], dml_ddl: [], lock_time: [] })
    const [isLocksLoading, setIsLocksLoading] = useState(false)

    // Long Operations States
    const [longOps, setLongOps] = useState<any[]>([])
    const [isLongOpsLoading, setIsLongOpsLoading] = useState(false)
    const [selectedLongOp, setSelectedLongOp] = useState<any | null>(null)
    const [longOpPlan, setLongOpPlan] = useState<any[]>([])
    const [isLongOpPlanLoading, setIsLongOpPlanLoading] = useState(false)

    const fetchDetails = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/blocker/${sid}?inst_id=${inst_id}`)
            if (res.ok) {
                const json = await res.json()
                setDetails(json)
            } else {
                console.error("Failed to fetch blocker details")
            }
        } catch (error) {
            console.error("Error fetching blocker details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCursors = async () => {
        setIsCursorLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/cursors/${sid}?inst_id=${inst_id}`)
            if (res.ok) {
                const json = await res.json()
                setCursors(json)
            }
        } catch (err) {
            console.error("Error fetching cursors:", err)
        } finally {
            setIsCursorLoading(false)
        }
    }

    const fetchCursorPlan = async (cursor: any) => {
        setSelectedCursor(cursor)
        setIsCursorPlanLoading(true)
        setCursorPlan([])
        try {
            const res = await fetch(`${API_URL}/sessions/cursor_plan/${cursor.sql_id}?inst_id=${inst_id}`)
            if (res.ok) {
                const json = await res.json()
                setCursorPlan(json)
            }
        } catch (err) {
            console.error("Error fetching cursor plan:", err)
        } finally {
            setIsCursorPlanLoading(false)
        }
    }

    const fetchDDL = async (obj: any) => {
        setSelectedObject(obj)
        setIsDdlLoading(true)
        setObjectDdl('')
        try {
            const res = await fetch(`${API_URL}/sessions/ddl/${obj.type}/${obj.owner}/${obj.name}`)
            if (res.ok) {
                const json = await res.json()
                setObjectDdl(json.ddl)
            }
        } catch (error) {
            console.error("Error fetching DDL:", error)
            setObjectDdl("-- Error fetching DDL")
        } finally {
            setIsDdlLoading(false)
        }
    }

    const fetchLockDetails = async () => {
        setIsLocksLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/locks-detailed?sid=${sid}&inst_id=${inst_id}`)
            if (res.ok) {
                const json = await res.json()
                setLockDetails(json)
            }
        } catch (err) {
            console.error("Error fetching lock details:", err)
        } finally {
            setIsLocksLoading(false)
        }
    }

    const fetchLongOps = async () => {
        setIsLongOpsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/longops?sid=${sid}&inst_id=${inst_id}`)
            if (res.ok) {
                const data = await res.json()
                setLongOps(data)
                if (data.length > 0 && !selectedLongOp) {
                    fetchLongOpPlan(data[0])
                }
            }
        } catch (error) {
            console.error('Error fetching long ops:', error)
        } finally {
            setIsLongOpsLoading(false)
        }
    }

    const fetchLongOpPlan = async (op: any) => {
        setSelectedLongOp(op)
        if (!op.sql_id) {
            setLongOpPlan([])
            return
        }
        setIsLongOpPlanLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/cursor_plan/${op.sql_id}?inst_id=${inst_id}`)
            if (res.ok) {
                const data = await res.json()
                setLongOpPlan(data)
            }
        } catch (error) {
            console.error('Error fetching long op plan:', error)
            setLongOpPlan([])
        } finally {
            setIsLongOpPlanLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchDetails()
        fetchCursors()
        fetchLockDetails()
        fetchLongOps()
    }

    useEffect(() => {
        if (sid) {
            handleRefresh()
        }
    }, [sid, inst_id])

    const handleKillSession = async () => {
        if (!sid) return
        const serial = details.serial
        if (confirm(`Are you sure you want to kill session ${sid},${serial}?`)) {
            setIsKilling(true)
            try {
                const res = await fetch(`${API_URL}/sessions/kill/${sid}/${serial}?inst_id=${inst_id}`, {
                    method: 'POST'
                })
                if (res.ok) {
                    logAction('Action', 'BlockExplorer', `Session ${sid} killed successfully`)
                    alert(`Session ${sid} killed successfully.`)
                    navigate('/sessions')
                } else {
                    const err = await res.json()
                    alert(`Error killing session: ${err.detail || 'Unknown error'}`)
                }
            } catch (error) {
                console.error('Error killing session:', error)
            } finally {
                setIsKilling(false)
            }
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden">
                {/* Header */}
                <div className="border-b border-border bg-muted/20 p-2 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h1 className="text-sm font-semibold flex items-center gap-2 flex-1">
                        <Lock className="h-4 w-4 text-amber-600" />
                        Block Explorer - SID {sid}
                    </h1>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1"
                        onClick={handleRefresh}
                        disabled={isLoading || isCursorLoading || isLocksLoading || isLongOpsLoading}
                    >
                        <RefreshCw className={cn(
                            "h-3.5 w-3.5",
                            (isLoading || isCursorLoading || isLocksLoading || isLongOpsLoading) && "animate-spin"
                        )} />
                        Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 gap-1"
                        onClick={handleKillSession}
                        disabled={isKilling}
                    >
                        {isKilling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Skull className="h-3.5 w-3.5" />
                        )}
                        Kill Session
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
                        <div className="bg-muted/10 border-b border-border px-4 shrink-0">
                            <TabsList className="h-10 bg-transparent p-0 gap-4">
                                <TabsTrigger
                                    value="summary"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-bold uppercase transition-all"
                                >
                                    Summary
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cursors"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-bold uppercase transition-all"
                                >
                                    Cursores
                                </TabsTrigger>
                                <TabsTrigger
                                    value="locks_detailed"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-bold uppercase transition-all"
                                >
                                    Lock Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="longops"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-bold uppercase transition-all"
                                >
                                    Long Ops
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="summary" className="flex-1 overflow-auto p-4 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Session Info */}
                                <Card>
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> Session Info
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="text-2xl font-bold">{details.username || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">SID: {details.sid}, Serial: {details.serial}</div>
                                        <div className={cn(
                                            "mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            details.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                                        )}>
                                            {details.status}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lock Stats */}
                                <Card>
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" /> Lock Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Users in Lock:</span>
                                            <span className="font-bold">{details.users_in_lock}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Open Cursors:</span>
                                            <span className="font-bold">{details.opened_cursors}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Schema:</span>
                                            <span className="font-bold">{details.schemaname}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SQL Text */}
                                <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Current SQL
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="bg-muted/10 border border-border rounded p-2 font-mono text-xs overflow-auto max-h-32 whitespace-pre-wrap selection:bg-primary/20">
                                            {details.sql_text}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Execution Plan */}
                                <Card className="col-span-full">
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <Table className="h-4 w-4" /> Execution Plan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="border border-border rounded-md overflow-hidden min-h-[100px]">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-muted/20 text-muted-foreground sticky top-0">
                                                    <tr>
                                                        <th className="px-2 py-1 w-12">ID</th>
                                                        <th className="px-2 py-1">Operation</th>
                                                        <th className="px-2 py-1">Options</th>
                                                        <th className="px-2 py-1">Object</th>
                                                        <th className="px-2 py-1 w-20">Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-mono">
                                                    {details.plan.map((row: any) => (
                                                        <tr key={row.id} className="border-t border-border group hover:bg-muted/30">
                                                            <td className="px-2 py-1 text-muted-foreground">{row.id}</td>
                                                            <td className="px-2 py-1" style={{ paddingLeft: `${(row.id * 10) + 8}px` }}>
                                                                {row.operation}
                                                            </td>
                                                            <td className="px-2 py-1 text-muted-foreground">{row.options}</td>
                                                            <td className="px-2 py-1">{row.object}</td>
                                                            <td className="px-2 py-1">{row.cost}</td>
                                                        </tr>
                                                    ))}
                                                    {!isLoading && details.plan.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-8 text-center text-muted-foreground italic">No execution plan available in cache</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Related Objects */}
                                <Card className="col-span-1 md:col-span-2">
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <Database className="h-4 w-4" /> Related Objects
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="border border-border rounded-md overflow-hidden h-40">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-muted/20 text-muted-foreground sticky top-0">
                                                    <tr>
                                                        <th className="px-2 py-1">Type</th>
                                                        <th className="px-2 py-1">Owner</th>
                                                        <th className="px-2 py-1">Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {details.objects.map((obj: any, i: number) => (
                                                        <tr
                                                            key={i}
                                                            className={cn(
                                                                "border-t border-border cursor-pointer hover:bg-muted/50",
                                                                selectedObject === obj && 'bg-primary/10'
                                                            )}
                                                            onClick={() => fetchDDL(obj)}
                                                        >
                                                            <td className="px-2 py-1 uppercase text-[10px] text-muted-foreground">{obj.type}</td>
                                                            <td className="px-2 py-1 font-mono">{obj.owner}</td>
                                                            <td className="px-2 py-1 font-medium">{obj.name}</td>
                                                        </tr>
                                                    ))}
                                                    {!isLoading && details.objects.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="py-10 text-center text-muted-foreground italic">No locked objects found for this session</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Select an object to view DDL below.</p>
                                    </CardContent>
                                </Card>

                                {/* Object Statistics / DDL */}
                                <Card className="col-span-1 md:col-span-2 flex flex-col">
                                    <CardHeader className="py-2 pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                            <Code className="h-4 w-4" /> Object Statistics / DDL
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2 flex-1 min-h-0">
                                        <ScrollArea className="h-40 w-full rounded-md border border-border bg-muted/10 p-2 relative">
                                            {isDdlLoading && (
                                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                                    <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            {selectedObject ? (
                                                <pre className="font-mono text-[10px] whitespace-pre-wrap text-foreground selection:bg-primary/20">
                                                    {objectDdl || '-- No DDL available'}
                                                </pre>
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground flex items-center justify-center h-full italic uppercase tracking-wider opacity-50">
                                                    Select an object above to view DDL
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="cursors" className="flex-1 overflow-hidden flex flex-col m-0 p-4 gap-4">
                            <div className="flex-1 flex flex-col min-h-0 gap-4">
                                <div className="flex-1 flex gap-4 min-h-0">
                                    {/* Top Grid: Open Cursors */}
                                    <Card className="flex-1 flex flex-col min-h-0">
                                        <CardHeader className="py-2 pb-0 shrink-0">
                                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                <Activity className="h-3.5 w-3.5" /> Open Cursors Listing
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2 flex-1 min-h-0">
                                            <div className="border border-border rounded-md overflow-hidden h-full flex flex-col">
                                                <div className="overflow-auto flex-1">
                                                    <table className="w-full text-[11px] text-left border-collapse">
                                                        <thead className="bg-muted/30 text-muted-foreground sticky top-0 z-10">
                                                            <tr className="border-b border-border">
                                                                <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">SQL_ID</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Type</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase tracking-wider">SQL Snippet</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {cursors.map((cursor, i) => (
                                                                <tr
                                                                    key={i}
                                                                    onClick={() => fetchCursorPlan(cursor)}
                                                                    className={cn(
                                                                        "border-b border-border hover:bg-muted/50 cursor-pointer transition-colors group",
                                                                        selectedCursor === cursor && "bg-primary/5 active-row"
                                                                    )}
                                                                >
                                                                    <td className="px-2 py-1.5 font-mono text-blue-600 font-medium border-r border-border">{cursor.sql_id}</td>
                                                                    <td className="px-2 py-1.5 text-muted-foreground italic border-r border-border whitespace-nowrap">{cursor.cursor_type}</td>
                                                                    <td className="px-2 py-1.5 font-mono truncate max-w-[400px] text-zinc-600" title={cursor.sql_text}>
                                                                        {cursor.sql_text}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {isCursorLoading && cursors.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={3} className="p-8 text-center text-muted-foreground animate-pulse font-medium uppercase tracking-widest text-[10px]">Loading cursors...</td>
                                                                </tr>
                                                            )}
                                                            {!isCursorLoading && cursors.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={3} className="p-8 text-center text-muted-foreground italic">No open cursors found for this session</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Selection Panel: Cursor Plan */}
                                    <div className="w-[450px] flex flex-col gap-4">
                                        <Card className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                                            <CardHeader className="py-2 pb-0 shrink-0">
                                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                    <Table className="h-3.5 w-3.5" /> Selected Cursor Plan
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-2 flex-1 min-h-0 flex flex-col">
                                                <div className="border border-border rounded-md overflow-hidden flex-1 bg-white relative">
                                                    {isCursorPlanLoading && (
                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                                            <Loader2 className="animate-spin h-6 w-6 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="overflow-auto h-full">
                                                        <table className="w-full text-[10px] text-left">
                                                            <thead className="bg-muted/30 text-muted-foreground sticky top-0">
                                                                <tr>
                                                                    <th className="px-2 py-1 w-8">ID</th>
                                                                    <th className="px-2 py-1">Operation</th>
                                                                    <th className="px-2 py-1">Cost</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="font-mono">
                                                                {cursorPlan.map((row: any) => (
                                                                    <tr key={row.id} className="border-t border-border hover:bg-slate-50">
                                                                        <td className="px-2 py-0.5 text-muted-foreground">{row.id}</td>
                                                                        <td className="px-2 py-0.5" style={{ paddingLeft: `${(row.id * 8) + 4}px` }}>
                                                                            <span className="font-medium">{row.operation}</span>
                                                                            <span className="text-[9px] text-muted-foreground ml-1">{row.options}</span>
                                                                            {row.object && <span className="text-blue-500 ml-1">[{row.object}]</span>}
                                                                        </td>
                                                                        <td className="px-2 py-0.5 text-muted-foreground">{row.cost}</td>
                                                                    </tr>
                                                                ))}
                                                                {!isCursorPlanLoading && cursorPlan.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={3} className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2 opacity-50 justify-center h-full uppercase tracking-tighter text-[10px]">
                                                                            {selectedCursor ? "Plan not in cache" : "Select a cursor to view its plan"}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Bottom Layer Cards: Session Summary */}
                                <div className="grid grid-cols-2 gap-4 shrink-0">
                                    <div className="flex gap-4">
                                        <Card className="flex-1 bg-gradient-to-br from-white to-slate-50 border-l-4 border-l-blue-500 shadow-sm">
                                            <CardContent className="pt-3 pb-2">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 mb-1">Session Owner</div>
                                                <div className="text-xl font-bold text-blue-900 tracking-tight">{details.username || 'N/A'}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">SID: {details.sid}</span>
                                                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Inst: {details.inst_id}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="flex-1 bg-gradient-to-br from-white to-slate-50 border-l-4 border-l-amber-500 shadow-sm">
                                            <CardContent className="pt-3 pb-2">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 mb-1">Session Stats</div>
                                                <div className="grid grid-cols-2 gap-y-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-muted-foreground leading-none">Status</span>
                                                        <span className={cn(
                                                            "text-xs font-bold leading-tight",
                                                            details.status === 'ACTIVE' ? "text-green-600" : "text-amber-600"
                                                        )}>{details.status}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-muted-foreground leading-none">Cursors</span>
                                                        <span className="text-xs font-bold text-slate-800 leading-tight">{details.opened_cursors}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <Card className="flex-1 bg-gradient-to-br from-white to-slate-50">
                                        <CardContent className="pt-3 pb-2">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 mb-1">Schema & Service</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg font-bold text-slate-900">{details.schemaname}</span>
                                                <span className="text-[10px] text-muted-foreground truncate opacity-80">{details.osuser} @ {details.machine}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5 italic">{details.program}</div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="locks_detailed" className="flex-1 overflow-auto p-4 m-0 space-y-6">
                            {/* 1. Blocking Locks hierarchy */}
                            <Card>
                                <CardHeader className="py-2 pb-0">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Lock className="h-3.5 w-3.5" /> Blocking Locks (Hierarchical)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="border border-border rounded-md overflow-hidden">
                                        <table className="w-full text-[11px] text-left">
                                            <thead className="bg-muted/30 text-muted-foreground sticky top-0">
                                                <tr className="border-b border-border">
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Waiting User</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Wait SID</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Wait PID</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Holding User</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider border-r border-border">Hold SID</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase tracking-wider">Hold PID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lockDetails.blocking_j?.map((row: any, i: number) => (
                                                    <tr key={i} className="border-b border-border hover:bg-muted/30 font-mono">
                                                        <td className="px-2 py-1 border-r border-border font-medium">{row.waiting_user}</td>
                                                        <td className="px-2 py-1 border-r border-border text-blue-600 font-bold">{row.wait_sid}</td>
                                                        <td className="px-2 py-1 border-r border-border">{row.wait_pid}</td>
                                                        <td className="px-2 py-1 border-r border-border font-medium">{row.holding_user}</td>
                                                        <td className="px-2 py-1 border-r border-border text-amber-600 font-bold">{row.hold_sid}</td>
                                                        <td className="px-2 py-1">{row.hold_pid}</td>
                                                    </tr>
                                                ))}
                                                {lockDetails.blocking_j?.length === 0 && !isLocksLoading && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No hierarchical blocking locks found</td>
                                                    </tr>
                                                )}
                                                {isLocksLoading && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Loading detailed locks...</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 2. DML/DDL Locks */}
                            <Card>
                                <CardHeader className="py-2 pb-0">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Activity className="h-3.5 w-3.5" /> DML & DDL Locks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="border border-border rounded-md overflow-hidden">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-muted/30 text-muted-foreground sticky top-0">
                                                <tr className="border-b border-border">
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">OS/Oracle User</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">SID/Serial#</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Type</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Hold Mode</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Object</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase">Wait (min)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lockDetails.dml_ddl?.map((row: any, i: number) => (
                                                    <tr key={i} className="border-b border-border hover:bg-muted/30 font-mono">
                                                        <td className="px-2 py-1 border-r border-border truncate max-w-[150px]" title={row.userid}>{row.userid}</td>
                                                        <td className="px-2 py-1 border-r border-border font-bold">{row.usercode}</td>
                                                        <td className="px-2 py-1 border-r border-border text-blue-600">{row.type}</td>
                                                        <td className="px-2 py-1 border-r border-border">{row.hold}</td>
                                                        <td className="px-2 py-1 border-r border-border font-medium text-amber-900">{row.object}</td>
                                                        <td className="px-2 py-1">{Math.round(row.waitsec / 60)}</td>
                                                    </tr>
                                                ))}
                                                {lockDetails.dml_ddl?.length === 0 && !isLocksLoading && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No DML/DDL locks found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. DML Lock Time Details */}
                            <Card>
                                <CardHeader className="py-2 pb-0">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Activity className="h-3.5 w-3.5" /> DML Lock Time Details (TM)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="border border-border rounded-md overflow-hidden">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-muted/30 text-muted-foreground sticky top-0">
                                                <tr className="border-b border-border">
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Oracle User</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">SID/Serial#</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Mode Held</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Mode Req.</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Object Name</th>
                                                    <th className="px-2 py-1.5 font-bold uppercase">Time (min)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lockDetails.lock_time?.map((row: any, i: number) => (
                                                    <tr key={i} className="border-b border-border hover:bg-muted/30 font-mono">
                                                        <td className="px-2 py-1 border-r border-border font-medium">{row.oracle_user}</td>
                                                        <td className="px-2 py-1 border-r border-border font-bold">{row.usercode}</td>
                                                        <td className="px-2 py-1 border-r border-border text-amber-700">{row.mode_held}</td>
                                                        <td className="px-2 py-1 border-r border-border text-rose-700">{row.mode_requested}</td>
                                                        <td className="px-2 py-1 border-r border-border truncate max-w-[200px]" title={row.object_name}>{row.object_name}</td>
                                                        <td className="px-2 py-1 font-bold text-rose-600">{row.lock_time_min}</td>
                                                    </tr>
                                                ))}
                                                {lockDetails.lock_time?.length === 0 && !isLocksLoading && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No specific DML (TM) lock times tracked</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="longops" className="flex-1 overflow-hidden flex flex-col m-0 p-4 gap-4">
                            <div className="flex-1 flex flex-col min-h-0 gap-4">
                                <div className="flex-1 flex gap-4 min-h-0">
                                    <Card className="flex-1 flex flex-col min-h-0">
                                        <CardHeader className="py-2 pb-0 shrink-0">
                                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                <Activity className="h-3.5 w-3.5" /> Long Operations Progress
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2 flex-1 min-h-0">
                                            <div className="border border-border rounded-md overflow-hidden h-full flex flex-col">
                                                <div className="overflow-auto flex-1">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="bg-muted/30 text-muted-foreground sticky top-0 z-10">
                                                            <tr className="border-b border-border">
                                                                <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Message</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Progress / Work</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Done %</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase border-r border-border">Start</th>
                                                                <th className="px-2 py-1.5 font-bold uppercase">SQL ID</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {longOps.map((op, i) => (
                                                                <tr
                                                                    key={i}
                                                                    onClick={() => fetchLongOpPlan(op)}
                                                                    className={cn(
                                                                        "border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
                                                                        selectedLongOp === op && "bg-primary/5 font-bold"
                                                                    )}
                                                                >
                                                                    <td className="px-2 py-1.5 border-r border-border text-[11px] truncate max-w-[250px]" title={op.message}>{op.message}</td>
                                                                    <td className="px-2 py-1.5 border-r border-border text-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="text-[10px] font-bold text-blue-800">{op.sofar} / {op.totalwork}</span>
                                                                            <span className="text-[8px] text-muted-foreground uppercase">{op.units}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border-r border-border text-center">
                                                                        <div className="w-full bg-slate-100 rounded-full h-2 relative overflow-hidden">
                                                                            <div
                                                                                className="bg-blue-600 h-full transition-all duration-500"
                                                                                style={{ width: `${op.done_pct}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[9px] font-mono">{op.done_pct}%</span>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border-r border-border font-mono text-[10px]">{op.inicio}</td>
                                                                    <td className="px-2 py-1.5 font-mono text-blue-600">{op.sql_id}</td>
                                                                </tr>
                                                            ))}
                                                            {isLongOpsLoading && longOps.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="p-8 text-center text-muted-foreground animate-pulse">Loading long operations...</td>
                                                                </tr>
                                                            )}
                                                            {!isLongOpsLoading && longOps.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">No long operations found for this session</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Plan for the selected long op */}
                                    <Card className="w-[450px] flex flex-col min-h-0 bg-slate-50/50">
                                        <CardHeader className="py-2 pb-0 shrink-0">
                                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                <Table className="h-3.5 w-3.5" /> Execution Plan (Long Op)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2 flex-1 min-h-0 flex flex-col">
                                            <div className="border border-border rounded-md overflow-hidden flex-1 bg-white relative">
                                                {isLongOpPlanLoading && (
                                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                                <div className="overflow-auto h-full">
                                                    <table className="w-full text-[10px] text-left">
                                                        <thead className="bg-muted/30 text-muted-foreground sticky top-0">
                                                            <tr>
                                                                <th className="px-2 py-1 w-8">ID</th>
                                                                <th className="px-2 py-1">Operation</th>
                                                                <th className="px-2 py-1">Cost</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="font-mono">
                                                            {longOpPlan.map((row: any) => (
                                                                <tr key={row.id} className="border-t border-border hover:bg-slate-50">
                                                                    <td className="px-2 py-0.5 text-muted-foreground">{row.id}</td>
                                                                    <td className="px-2 py-0.5" style={{ paddingLeft: `${(row.id * 8) + 4}px` }}>
                                                                        <span className="font-medium">{row.operation}</span>
                                                                        <span className="text-[9px] text-muted-foreground ml-1">{row.options}</span>
                                                                        {row.object && <span className="text-blue-500 ml-1">[{row.object}]</span>}
                                                                    </td>
                                                                    <td className="px-2 py-0.5 text-muted-foreground">{row.cost}</td>
                                                                </tr>
                                                            ))}
                                                            {!isLongOpPlanLoading && longOpPlan.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={3} className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2 opacity-50 justify-center h-full uppercase tracking-tighter text-[10px]">
                                                                        {selectedLongOp ? (selectedLongOp.sql_id ? "Plan not in cache" : "No SQL ID for this op") : "Select an operation to view its plan"}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    )
}

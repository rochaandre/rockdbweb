import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip } from "recharts"
import { AlertCircle, CheckCircle, Clock, Save, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'
import { API_URL } from "@/context/app-context"

import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

// --- SYSAUX Panel ---
export function SysauxPanel({ data = { occupants: [], top_objects: [], availability: 'N/A' } }: { data: any }) {
    const { occupants, top_objects, availability } = data
    const [retention, setRetention] = useState<number | null>(null)
    const [advRetention, setAdvRetention] = useState<number | null>(null)
    const [newRetention, setNewRetention] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchRetention = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/stats/retention`)
            if (res.ok) {
                const data = await res.json()
                setRetention(data.retention)
                setAdvRetention(data.advisor_retention)
                setNewRetention((data.advisor_retention || data.retention || 0).toString())
            }
        } catch (err) { console.error(err) }
    }

    useEffect(() => {
        fetchRetention()
    }, [])

    const handleUpdateRetention = async () => {
        setIsUpdating(true)
        try {
            const res = await fetch(`${API_URL}/storage/stats/retention`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: parseInt(newRetention) })
            })
            if (res.ok) {
                const data = await res.json()
                setRetention(data.retention)
                setAdvRetention(data.advisor_retention)
                // If it worked, make sure current input matches the one we just got
                setNewRetention((data.advisor_retention || data.retention || 0).toString())
            }
        } catch (err) { console.error(err) }
        finally { setIsUpdating(false) }
    }

    const chartData = occupants.slice(0, 5).map((o: any) => ({ name: o.name, value: o.space_mb }))
    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>SYSAUX Occupants</span>
                        {availability && availability !== 'N/A' && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                <History className="size-3" />
                                Available since: {availability}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-5 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Schema</div>
                        <div className="col-span-2">Name</div>
                        <div>Space</div>
                        <div className="text-right">Action</div>
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        {occupants.map((o: any, i: number) => (
                            <div key={i} className="grid grid-cols-5 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                                <div className="text-muted-foreground truncate">{o.schema}</div>
                                <div className="col-span-2 font-medium">{o.name}</div>
                                <div className="font-mono text-xs">{o.space_gb > 0 ? `${o.space_gb} GB` : `${o.space_mb} MB`}</div>
                                <div className="text-right">
                                    {o.move_procedure && (
                                        <Badge variant="outline" className="text-[9px] h-4 uppercase cursor-help border-primary/20 text-primary" title={o.move_procedure}>
                                            Move Proc.
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {occupants.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No SYSAUX occupant data found.</div>
                    )}
                </div>

                {/* Top Statistics Objects Breakdown */}
                {top_objects.length > 0 && (
                    <div className="rounded-md border border-border bg-surface overflow-hidden">
                        <div className="px-3 py-2 border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
                            <span>SM/OPTSTAT Deep Dive (WRI$_OPTSTAT% High Usage)</span>
                            <Badge variant="outline" className="text-[8px] h-3.5 bg-primary/5 text-primary border-primary/20">
                                Info: Optimizer Stats History
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-border">
                            <div className="p-0">
                                {top_objects.slice(0, 5).map((obj: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-2.5 border-b border-border/40 hover:bg-muted/30 last:border-0 transition-colors">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-bold text-foreground font-mono">{obj.segment_name}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-medium">{obj.segment_type}</p>
                                        </div>
                                        <Badge variant="secondary" className="font-mono text-[10px] bg-muted/50">{obj.mb} MB</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="p-0">
                                {top_objects.slice(5, 10).map((obj: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-2.5 border-b border-border/40 hover:bg-muted/30 last:border-0 transition-colors">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-bold text-foreground font-mono">{obj.segment_name}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-medium">{obj.segment_type}</p>
                                        </div>
                                        <Badge variant="secondary" className="font-mono text-[10px] bg-muted/50">{obj.mb} MB</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Space Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                    {chartData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} itemStyle={{ color: 'var(--foreground)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4 text-amber-500" />
                            <CardTitle className="text-sm font-medium text-amber-500">Stats Retention</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6" onClick={fetchRetention}>
                            <RefreshCw className="size-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                <span className="text-[10px] text-muted-foreground uppercase">DBMS_STATS History</span>
                                <span className="text-sm font-bold">{retention !== null ? `${retention}d` : '...'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                <span className="text-[10px] text-muted-foreground uppercase">Advisor Task (Set)</span>
                                <span className="text-sm font-bold text-primary">{advRetention !== null ? `${advRetention}d` : '...'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Modify Retention (Days)</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={newRetention}
                                    onChange={e => setNewRetention(e.target.value)}
                                    className="h-8 text-xs"
                                />
                                <Button
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={handleUpdateRetention}
                                    disabled={isUpdating}
                                >
                                    <Save className="size-3" />
                                    Apply
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                            Uses DBMS_SQLTUNE & DBMS_STATS to sync advisor and history policies.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <AlertCircle className="size-4 text-blue-500" />
                        <CardTitle className="text-sm font-medium text-blue-500">Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        SM/AWR is consuming significant space. Consider changing AWR retention or purging old snapshots if SYSAUX is critical.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- UNDO Panel ---
export function UndoPanel({ data = { stats: [], retention: 900, max_query_len: 0 } }: { data: any }) {
    const { stats, retention, max_query_len } = data
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>UNDO Statistics</span>
                        <div className="flex gap-2">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Updates every 10 min</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Start</div>
                        <div>End</div>
                        <div>Blocks</div>
                        <div>Txns</div>
                        <div>Max Query</div>
                        <div>Inst</div>
                    </div>
                    {stats.map((s: any, i: number) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30">
                            <div className="text-muted-foreground">{s.begin_time}</div>
                            <div className="text-muted-foreground">{s.end_time}</div>
                            <div className="font-mono">{s.undoblks}</div>
                            <div>{s.txncount}</div>
                            <div>{s.maxquerylen}s</div>
                            <div>{s.inst_id}</div>
                        </div>
                    ))}
                    {stats.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No UNDO statistics available.</div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Retention Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-xs text-muted-foreground">Configured</span>
                            <span className="text-xl font-bold">{retention}s</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-xs text-muted-foreground">Longest Active</span>
                            <span className="text-xl font-bold text-primary">{max_query_len}s</span>
                        </div>
                        {retention > max_query_len ? (
                            <div className="flex items-start gap-2 text-[10px] text-green-600 bg-green-500/10 p-2 rounded">
                                <CheckCircle className="size-3 shrink-0 mt-0.5" />
                                Retention is sufficient for recent activity.
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-500/10 p-2 rounded">
                                <AlertCircle className="size-3 shrink-0 mt-0.5" />
                                Warning: Longest query exceeds configured retention!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- TEMP Panel ---
export function TempPanel({ usage = [] }: { usage: any[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Active Temporary Segment Usage</span>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>SID,Serial</div>
                        <div>User</div>
                        <div>SQL ID</div>
                        <div>Tablepace</div>
                        <div>Inst</div>
                        <div>Used (MB)</div>
                    </div>
                    {usage.map((t, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs text-muted-foreground">{t.sid_serial}</div>
                            <div className="truncate">{t.username}</div>
                            <div className="font-mono text-xs">{t.sql_id}</div>
                            <div>{t.tablespace}</div>
                            <div>{t.inst_id}</div>
                            <div className="font-bold">{t.mb_used}</div>
                        </div>
                    ))}
                    {usage.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No active temporary segments found.</div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Temp History (MB)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] p-0 flex items-center justify-center text-xs text-muted-foreground">
                        History tracking in progress...
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- Storage Charts ---
export function StorageCharts() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/charts`)
            if (res.ok) {
                setData(await res.json())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-[250px] bg-muted/20 animate-pulse rounded-lg border border-border" />
            ))}
        </div>
    )

    if (!data) return <div className="p-8 text-center text-muted-foreground uppercase text-xs font-bold">No storage metric data available</div>

    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']
    const CHART_COLORS = {
        used: '#3b82f6',
        free: '#22c55e',
        reclaimable: '#f59e0b'
    }

    const renderPie = (chartData: any[], title: string, subtitle?: string) => (
        <Card className="flex flex-col h-full bg-surface border-border/50 shadow-none">
            <CardHeader className="py-3 px-4 shrink-0 flex flex-row items-center justify-between border-b border-border/10">
                <div className="space-y-0.5">
                    <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
                    {subtitle && <p className="text-[9px] text-muted-foreground/60 font-mono">{subtitle}</p>}
                </div>
                <div className="p-1.5 bg-muted/20 rounded">
                    <History className="size-3 text-muted-foreground/40" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px] p-4 relative flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                            animationDuration={800}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <ReTooltip
                            contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ padding: '2px 0' }}
                            formatter={(value: any) => [`${(value || 0).toLocaleString()} MB`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-60">Total</span>
                    <span className="text-xs font-bold font-mono">
                        {chartData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}M
                    </span>
                </div>
                {/* Custom Legend */}
                <div className="w-full mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
                    {chartData.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                            <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || COLORS[i % COLORS.length] }} />
                            <span className="text-[9px] text-muted-foreground truncate uppercase font-medium group-hover:text-foreground transition-colors">{entry.name}</span>
                            <span className="ml-auto text-[9px] font-mono text-muted-foreground/60">{Math.round((entry.value / chartData.reduce((a, b) => a + b.value, 0)) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )

    // Data Mapping
    const fraData = data.fra ? [
        { name: 'Used', value: Math.max(0, data.fra.used_mb - data.fra.reclaimable_mb), color: CHART_COLORS.used },
        { name: 'Rec.', value: data.fra.reclaimable_mb, color: CHART_COLORS.reclaimable },
        { name: 'Free', value: data.fra.free_mb, color: CHART_COLORS.free }
    ].filter(v => v.value > 0) : []

    const dfData = data.datafiles ? [
        { name: 'Used', value: data.datafiles.used_mb, color: CHART_COLORS.used },
        { name: 'Free', value: data.datafiles.free_mb, color: CHART_COLORS.free }
    ].filter(v => v.value > 0) : []

    const undoTotalUsed = data.undo?.reduce((acc: any, u: any) => acc + u.used_mb, 0) || 0
    const undoTotalFree = data.undo?.reduce((acc: any, u: any) => acc + u.free_mb, 0) || 0
    const undoData = undoTotalUsed + undoTotalFree > 0 ? [
        { name: 'Used', value: undoTotalUsed, color: CHART_COLORS.used },
        { name: 'Free', value: undoTotalFree, color: CHART_COLORS.free }
    ] : []

    const tempTotalUsed = data.temp?.reduce((acc: any, t: any) => acc + t.used_mb, 0) || 0
    const tempTotalFree = data.temp?.reduce((acc: any, t: any) => acc + t.free_mb, 0) || 0
    const tempData = tempTotalUsed + tempTotalFree > 0 ? [
        { name: 'Used', value: tempTotalUsed, color: CHART_COLORS.used },
        { name: 'Free', value: tempTotalFree, color: CHART_COLORS.free }
    ] : []

    const pgaData = data.pga?.length > 0 ? data.pga.map((p: any) => ({ name: p.name.replace('aggregate PGA ', '').replace('total PGA ', ''), value: p.mb })) : []
    const topTsData = data.top_tablespaces?.length > 0 ? data.top_tablespaces.map((t: any) => ({ name: t.name, value: t.mb })) : []

    const sgaData = data.sga?.length > 0 ? data.sga.slice(0, 8).map((s: any) => ({ name: s.name, value: s.mb })) : []

    return (
        <div className="space-y-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {dfData.length > 0 && renderPie(dfData, "Datafiles Storage", "Total Space Usage")}
                {fraData.length > 0 && renderPie(fraData, "Flash Recovery Area", data.fra?.name)}
                {sgaData.length > 0 && renderPie(sgaData, "SGA Components", `Total: ${data.sga_total_mb}M`)}
                {undoData.length > 0 && renderPie(undoData, "Undo Retention", "Active Tablespaces")}
                {tempData.length > 0 && renderPie(tempData, "Temp Usage", "Tablespace Metrics")}
                {pgaData.length > 0 && renderPie(pgaData, "PGA Memory", "Aggregate Metrics")}
                {topTsData.length > 0 && renderPie(topTsData, "Top Tablespaces", "By Allocated Size")}
            </div>

            <div className="flex items-center justify-center p-8 bg-muted/5 border border-dashed border-border rounded-lg">
                <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Growth Analytics</p>
                    <p className="text-xs text-muted-foreground/60 italic">Historical data collection from Time Machine snapshots is active.</p>
                </div>
            </div>
        </div>
    )
}

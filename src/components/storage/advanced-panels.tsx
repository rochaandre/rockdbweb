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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Database Growth (Used vs Allocated)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">
                    Historical growth data collected from dashboard snapshots.
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Temp Usage trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">
                    Real-time trend data requires persistent monitoring.
                </CardContent>
            </Card>
        </div>
    )
}

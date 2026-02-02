import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip } from "recharts"
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

// --- SYSAUX Panel ---
export function SysauxPanel({ occupants = [] }: { occupants: any[] }) {
    const data = occupants.slice(0, 5).map(o => ({ name: o.name, value: o.space_mb }))
    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        SYSAUX Occupants
                    </div>
                    <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Schema</div>
                        <div className="col-span-2">Name</div>
                        <div>Space</div>
                    </div>
                    {occupants.map((o, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="text-muted-foreground">{o.schema}</div>
                            <div className="col-span-2 font-medium">{o.name}</div>
                            <div>{o.space_usage}</div>
                        </div>
                    ))}
                    {occupants.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No SYSAUX occupant data found.</div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Space Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} itemStyle={{ color: 'var(--foreground)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <AlertCircle className="size-4 text-amber-500" />
                        <CardTitle className="text-sm font-medium text-amber-500">Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        SM/AWR is consuming 1.2 GB. Consider changing AWR retention or purging old snapshots if space is critical.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- UNDO Panel ---
export function UndoPanel({ stats = [] }: { stats: any[] }) {
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
                    {stats.map((s, i) => (
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
                            <span className="text-xl font-bold">900s</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-xs text-muted-foreground">Longest Query</span>
                            <span className="text-xl font-bold text-green-500">420s</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded">
                            <CheckCircle className="size-4 shrink-0 mt-0.5" />
                            Current retention is sufficient for the longest running queries.
                        </div>
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

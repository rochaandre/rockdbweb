import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { AlertCircle, Plus, CheckCircle } from 'lucide-react'
import { SYSAUX_OCCUPANTS, UNDO_STATS, TEMP_USAGE, DB_GROWTH_HISTORY, TEMP_HISTORY } from './advanced-storage-data'

// --- SYSAUX Panel ---
export function SysauxPanel() {
    const data = SYSAUX_OCCUPANTS.map(o => ({ name: o.name, value: o.space_mb }))
    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        SYSAUX Occupants (Top 5)
                    </div>
                    <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Schema</div>
                        <div className="col-span-2">Name</div>
                        <div>Space</div>
                    </div>
                    {SYSAUX_OCCUPANTS.map((o, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="text-muted-foreground">{o.schema}</div>
                            <div className="col-span-2 font-medium">{o.name}</div>
                            <div>{o.space_usage}</div>
                        </div>
                    ))}
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
export function UndoPanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>UNDO Statistics (Last 30 mins)</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><Plus className="size-3" /> Add Datafile</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Start</div>
                        <div>End</div>
                        <div>Blocks</div>
                        <div>Txn Count</div>
                        <div>Max Query</div>
                        <div>Max Conc.</div>
                    </div>
                    {UNDO_STATS.map((s, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30">
                            <div className="text-muted-foreground">{s.begin_time}</div>
                            <div className="text-muted-foreground">{s.end_time}</div>
                            <div className="font-mono">{s.undoblks}</div>
                            <div>{s.txncount}</div>
                            <div>{s.maxquerylen}s</div>
                            <div>{s.maxconcurrency}</div>
                        </div>
                    ))}
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
export function TempPanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Active Temporary Segment Usage</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><Plus className="size-3" /> Add Tempfile</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>SID,Serial</div>
                        <div>User</div>
                        <div>Program</div>
                        <div>SQL ID</div>
                        <div>Tablepace</div>
                        <div>Used (MB)</div>
                    </div>
                    {TEMP_USAGE.map((t, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs text-muted-foreground">{t.sid},{t.serial}</div>
                            <div>{t.username}</div>
                            <div className="truncate text-xs text-muted-foreground" title={t.program}>{t.program}</div>
                            <div className="font-mono text-xs">{t.sql_id}</div>
                            <div>{t.tablespace}</div>
                            <div className="font-bold">{t.mb_used}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Temp History (MB)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={TEMP_HISTORY}>
                                <defs>
                                    <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                <Area type="monotone" dataKey="used_mb" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsed)" />
                            </AreaChart>
                        </ResponsiveContainer>
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
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DB_GROWTH_HISTORY}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <Area type="monotone" dataKey="allocated" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="used" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Temp Usage Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TEMP_HISTORY}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="time" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <Line type="step" dataKey="used_mb" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

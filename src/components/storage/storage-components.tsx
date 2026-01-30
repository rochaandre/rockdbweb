import { twMerge } from 'tailwind-merge'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Database, Plus, RefreshCw, Edit2 } from 'lucide-react'
import { REDO_GROUPS, REDO_SWITCH_HISTORY, CONTROL_FILES } from './storage-data'

// --- Tablespace Card ---
export function TablespaceCard({ ts, onClick, onEdit }: { ts: any, onClick: () => void, onEdit: (e: any) => void }) {
    const name = ts.name || ts.tablespace_name
    const status = ts.status
    const used_mb = ts.used_size || (ts.used_mb ? `${ts.used_mb.toFixed(0)} MB` : '0 MB')
    const total_mb = ts.total_size || (ts.total_mb ? `${ts.total_mb.toFixed(0)} MB` : '0 MB')
    const used_pct = ts.used_percent || ts.used_pct || 0

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50 hover:bg-muted/10 cursor-pointer transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm truncate max-w-[150px]">{name}</span>
                </div>
                <Badge variant={status === 'ONLINE' ? 'default' : 'destructive'} className="text-[10px] px-1 py-0 h-5">
                    {status}
                </Badge>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{used_mb} / {total_mb}</span>
                    <span className={used_pct > 85 ? "text-red-500 font-bold" : ""}>{used_pct}%</span>
                </div>
                <Progress value={used_pct} className={twMerge("h-1.5", used_pct > 85 ? "bg-red-100 [&>div]:bg-red-500" : "")} />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground pt-2 border-t border-border mt-1 h-8 items-center">
                <span className="truncate">{ts.contents}</span>
                <span className="truncate">{ts.allocation_type || ts.extent_management}</span>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={(e) => { e.stopPropagation(); onEdit(ts); }}
            >
                <Edit2 className="size-3" />
            </Button>
        </div>
    )
}

// --- Tablespace Detail ---
export function TablespaceDetail({ selectedTs, files, segments = [] }: { selectedTs: string, files: any[], segments?: any[] }) {
    // Chart Data
    const segmentData = segments
    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b']

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Datafiles List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Datafiles ({selectedTs})</span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><Plus className="size-3" /> Add Datafile</Button>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>ID</div>
                        <div className="col-span-3">Name</div>
                        <div>Size (MB)</div>
                        <div>AutoExt</div>
                    </div>
                    {files.map((df, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs text-muted-foreground">{df.file_id}</div>
                            <div className="col-span-3 font-mono text-xs truncate" title={df.file_name}>{df.file_name}</div>
                            <div>{df.size_mb.toFixed(0)}</div>
                            <div>
                                <Badge variant={df.autoextensible === 'YES' ? 'outline' : 'secondary'} className="text-[10px] h-5">
                                    {df.autoextensible}
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No data files found.</div>
                    )}
                </div>
            </div>

            {/* Segments Chart */}
            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface flex flex-col h-[300px]">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Top Segments (MB)
                    </div>
                    <div className="flex-1 min-h-0 relative p-2">
                        {segmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={segmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {segmentData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} itemStyle={{ color: 'var(--foreground)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No segment data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Redo Manager ---
export function RedoManager() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Redo Log Groups</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><RefreshCw className="size-3" /> Switch Log</Button>
                            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><Plus className="size-3" /> Add Group</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Group#</div>
                        <div>Thread#</div>
                        <div>Seq#</div>
                        <div>Size</div>
                        <div>Status</div>
                        <div>Archived</div>
                    </div>
                    {REDO_GROUPS.map((g) => (
                        <div key={g.group} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs">{g.group}</div>
                            <div className="text-muted-foreground">{g.thread}</div>
                            <div className="font-mono text-xs">{g.sequence}</div>
                            <div>{g.bytes}</div>
                            <div>
                                <Badge variant={g.status === 'CURRENT' ? 'default' : g.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[10px] h-5">
                                    {g.status}
                                </Badge>
                            </div>
                            <div>{g.archived}</div>
                        </div>
                    ))}
                </div>

                <div className="rounded-md border border-border bg-surface p-4">
                    <h3 className="text-sm font-medium mb-3">Generation Script</h3>
                    <div className="bg-zinc-950 p-3 rounded text-xs font-mono text-green-400 border border-zinc-800">
                        ALTER DATABASE ADD LOGFILE GROUP 4 ('+DATA', '+FRA') SIZE 200M;
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface h-[300px] flex flex-col">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Log Switch History (Switches/Hr)
                    </div>
                    <div className="flex-1 p-2 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={REDO_SWITCH_HISTORY}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                <Line type="monotone" dataKey="switches" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Control Files ---
export function ControlFilesPanel() {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Control Files
            </div>
            <div className="grid grid-cols-5 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Name</div>
                <div>Status</div>
            </div>
            {CONTROL_FILES.map((cf, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30">
                    <div className="col-span-4 font-mono text-xs truncate" title={cf.name}>{cf.name}</div>
                    <div><Badge variant="outline" className="text-[10px] h-5">{cf.status}</Badge></div>
                </div>
            ))}
        </div>
    )
}

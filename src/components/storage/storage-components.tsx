import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { API_URL, useApp } from '@/context/app-context'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { Database, Plus, RefreshCw, Edit2, Trash2, FilePlus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


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
export function TablespaceDetail({ selectedTs, files, segments = [], onRefresh }: { selectedTs: string, files: any[], segments?: any[], onRefresh?: () => void }) {
    const [resizeFile, setResizeFile] = useState<any | null>(null)
    const [newSize, setNewSize] = useState<string>('')
    const [isResizing, setIsResizing] = useState(false)

    const [isAddingFile, setIsAddingFile] = useState(false)
    const [addFileName, setAddFileName] = useState<string>('')
    const [addFileSize, setAddFileSize] = useState<string>('100')

    const handleResize = async () => {
        if (!resizeFile || !newSize) return
        setIsResizing(true)
        try {
            const res = await fetch(`${API_URL}/storage/files/resize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: resizeFile.file_id, new_size_mb: parseInt(newSize) })
            })
            if (res.ok) {
                setResizeFile(null)
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsResizing(false)
        }
    }

    const handleAddFile = async () => {
        if (!addFileName || !addFileSize) return
        try {
            const res = await fetch(`${API_URL}/storage/files/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tablespace_name: selectedTs, file_name: addFileName, size_mb: parseInt(addFileSize) })
            })
            if (res.ok) {
                setIsAddingFile(false)
                setAddFileName('')
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) {
            console.error(err)
        }
    }

    // Chart Data
    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b']

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Datafiles List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Datafiles ({selectedTs})</span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setIsAddingFile(true)}>
                            <Plus className="size-3" /> Add Datafile
                        </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>ID</div>
                        <div className="col-span-3">Name</div>
                        <div>Size (MB)</div>
                        <div>AutoExt</div>
                        <div className="text-right">Actions</div>
                    </div>
                    {files.map((df, i) => (
                        <div key={i} className="grid grid-cols-7 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs text-muted-foreground">{df.file_id}</div>
                            <div className="col-span-3 font-mono text-xs truncate" title={df.file_name}>{df.file_name}</div>
                            <div>{df.size_mb.toFixed(0)}</div>
                            <div>
                                <Badge variant={df.autoextensible === 'YES' ? 'outline' : 'secondary'} className="text-[10px] h-5">
                                    {df.autoextensible}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setResizeFile(df); setNewSize(df.size_mb.toFixed(0)); }}>
                                    <Edit2 className="size-3" />
                                </Button>
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
                        {segments.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={segments}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {segments.map((_, index) => (
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

            {/* Resize Dialog */}
            <Dialog open={!!resizeFile} onOpenChange={(open) => !open && setResizeFile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resize Datafile</DialogTitle>
                        <DialogDescription>
                            Adjust the size of datafile {resizeFile?.file_id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="size" className="text-right">New Size (MB)</Label>
                            <Input id="size" value={newSize} onChange={(e) => setNewSize(e.target.value)} className="col-span-3" type="number" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResizeFile(null)}>Cancel</Button>
                        <Button onClick={handleResize} disabled={isResizing}>
                            {isResizing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Apply Resize
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Datafile Dialog */}
            <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Datafile to {selectedTs}</DialogTitle>
                        <DialogDescription>Create a new datafile for this tablespace.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="filename" className="text-right">File Path/Name</Label>
                            <Input id="filename" placeholder="/u01/app/oracle/oradata/DB/file02.dbf" value={addFileName} onChange={(e) => setAddFileName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="addsize" className="text-right">Size (MB)</Label>
                            <Input id="addsize" value={addFileSize} onChange={(e) => setAddFileSize(e.target.value)} className="col-span-3" type="number" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingFile(false)}>Cancel</Button>
                        <Button onClick={handleAddFile}>Add Datafile</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// --- Redo Manager ---
export function RedoManager({ groups = [], onRefresh }: { groups: any[], onRefresh?: () => void }) {
    const { connection } = useApp()
    const isPdb = connection.db_type === 'PDB'

    const [isAddingGroup, setIsAddingGroup] = useState(false)
    const [addGroupSize, setAddGroupSize] = useState('50')
    const [addGroupThread, setAddGroupThread] = useState('1')
    const [addGroupPath, setAddGroupPath] = useState('')

    const [memberGroup, setMemberGroup] = useState<number | null>(null)
    const [memberPath, setMemberPath] = useState('')

    const handleSwitch = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/redo/switch`, { method: 'POST' })
            if (res.ok) {
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error switching log file: ${err.detail}`)
            }
        } catch (err) {
            console.error(err)
            alert('Failed to connect to server')
        }
    }

    const handleAddGroup = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/redo/group/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thread: parseInt(addGroupThread),
                    size_mb: parseInt(addGroupSize),
                    member_path: addGroupPath || null
                })
            })
            if (res.ok) {
                setIsAddingGroup(false)
                setAddGroupPath('')
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) { console.error(err) }
    }

    const handleAddMember = async () => {
        if (!memberGroup || !memberPath) return
        try {
            const res = await fetch(`${API_URL}/storage/redo/member/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_id: memberGroup, member_path: memberPath })
            })
            if (res.ok) {
                setMemberGroup(null)
                setMemberPath('')
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) { console.error(err) }
    }

    const handleDropGroup = async (groupId: number) => {
        if (!confirm(`Are you sure you want to drop redo group ${groupId}?`)) return
        try {
            const res = await fetch(`${API_URL}/storage/redo/group/drop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_id: groupId })
            })
            if (res.ok) {
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) { console.error(err) }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Redo Log Groups</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs gap-1"
                                onClick={handleSwitch}
                                disabled={isPdb}
                                title={isPdb ? "Log switch not allowed in PDB" : ""}
                            >
                                <RefreshCw className="size-3" /> Switch Log
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs gap-1"
                                onClick={() => setIsAddingGroup(true)}
                                disabled={isPdb}
                                title={isPdb ? "Redo management not allowed in PDB" : ""}
                            >
                                <Plus className="size-3" /> Add Group
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>ID</div>
                        <div>Thread</div>
                        <div>Seq</div>
                        <div>Size</div>
                        <div className="col-span-2">Status</div>
                        <div>Arch</div>
                        <div className="text-right">Actions</div>
                    </div>
                    {groups.map((g, i) => (
                        <div key={i} className="grid grid-cols-8 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs font-bold">{g['group#']}</div>
                            <div className="text-muted-foreground">{g['thread#']}</div>
                            <div className="font-mono text-xs">{g['sequence#']}</div>
                            <div>{g.size_mb}M</div>
                            <div className="col-span-2">
                                <Badge variant={g.status === 'CURRENT' ? 'default' : g.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[10px] h-5">
                                    {g.status}
                                </Badge>
                            </div>
                            <div>{g.archived}</div>
                            <div className="flex justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-primary hover:bg-primary/10"
                                    title={isPdb ? "Not allowed in PDB" : "Add Member"}
                                    onClick={() => { setMemberGroup(g['group#']); setMemberPath(''); }}
                                    disabled={isPdb}
                                >
                                    <FilePlus className="size-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDropGroup(g['group#'])}
                                    disabled={isPdb}
                                    title={isPdb ? "Not allowed in PDB" : "Drop Group"}
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No redo groups found.</div>
                    )}
                </div>

                <div className="rounded-md border border-border bg-surface p-4">
                    <h3 className="text-sm font-medium mb-3">Quick Operation Hints</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• Drop group only if it is INACTIVE and ARCHIVED.</p>
                        <p>• Adding a group will use default file names in oradata if OMF is enabled.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface p-8 text-center">
                    <p className="text-sm text-muted-foreground italic">Redo Log Switch Matrix Report has been moved to a separate tab for better visibility.</p>
                </div>
            </div>

            {/* Add Redo Group Dialog */}
            <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Redo Log Group</DialogTitle>
                        <DialogDescription>Create a new log group. Thread 1 for single instance.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="thread" className="text-right">Thread#</Label>
                            <Input id="thread" value={addGroupThread} onChange={(e) => setAddGroupThread(e.target.value)} className="col-span-3" type="number" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="redosize" className="text-right">Size (MB)</Label>
                            <Input id="redosize" value={addGroupSize} onChange={(e) => setAddGroupSize(e.target.value)} className="col-span-3" type="number" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="redopath" className="text-right">Member Path (Optional)</Label>
                            <Input id="redopath" placeholder="/u01/app/oracle/oradata/DB/redo04a.log" value={addGroupPath} onChange={(e) => setAddGroupPath(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingGroup(false)}>Cancel</Button>
                        <Button onClick={handleAddGroup}>Create Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Redo Member Dialog */}
            <Dialog open={!!memberGroup} onOpenChange={(open) => !open && setMemberGroup(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Redo Log Member</DialogTitle>
                        <DialogDescription>Add a new member (multiplexing) to group {memberGroup}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mempath" className="text-right">Member Path</Label>
                            <Input id="mempath" placeholder="/u01/app/oracle/oradata/DB/redo01b.log" value={memberPath} onChange={(e) => setMemberPath(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMemberGroup(null)}>Cancel</Button>
                        <Button onClick={handleAddMember}>Add Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// --- Redo Switch Matrix Report ---
export function RedoMatrixReport({ history = [], threads = [], onFilterChange }: { history: any[], threads: number[], onFilterChange: (days: number, inst: string) => void }) {
    const [days, setDays] = useState('7')
    const [inst, setInst] = useState('')

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-4 bg-muted/10 p-3 rounded-md border border-border shrink-0">
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Period:</Label>
                    <select
                        value={days}
                        onChange={(e) => { setDays(e.target.value); onFilterChange(parseInt(e.target.value), inst); }}
                        className="bg-background border border-input rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="1">Last 24h</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Instance (Thread):</Label>
                    <select
                        value={inst}
                        onChange={(e) => { setInst(e.target.value); onFilterChange(parseInt(days), e.target.value); }}
                        className="bg-background border border-input rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none min-w-[80px]"
                    >
                        <option value="">All</option>
                        {threads.map(t => (
                            <option key={t} value={t}>Thread {t}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto text-[10px] text-muted-foreground">
                    * Highlights: &gt;5 switches/hr
                </div>
            </div>

            <div className="flex-1 rounded-md border border-border bg-surface overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Redo Log Switch Matrix (Switches per Hour)
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-[10px] border-collapse min-w-max">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm shadow-sm z-10">
                            <tr>
                                <th className="p-2 text-left border-b border-r border-border bg-muted/10 sticky left-0 z-20">Date</th>
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const h = i.toString().padStart(2, '0')
                                    const label = i === 0 ? '12AM' : i < 12 ? `${i}AM` : i === 12 ? '12PM' : `${i - 12}PM`
                                    return <th key={h} className="p-1 border-b border-r border-border text-center min-w-[36px]">{label}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/30 border-b border-border last:border-0 h-8">
                                    <td className="p-2 font-medium border-r border-border bg-muted/5 sticky left-0 z-10">{row.dg_date}</td>
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const key = `h${i.toString().padStart(2, '0')}`
                                        const val = parseInt(row[key]) || 0
                                        return (
                                            <td key={key} className={`text-center border-r border-border ${val > 0 ? 'font-bold' : 'text-muted-foreground/30'}`} style={{ backgroundColor: val > 5 ? `rgba(59, 130, 246, ${Math.min(val / 20, 0.4)})` : undefined }}>
                                                {val > 0 ? val : '-'}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={25} className="p-8 text-center text-muted-foreground italic">No switch history found for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export function ControlFilesPanel({ files = [], checkpoint = [], onRefresh }: { files: any[], checkpoint?: any[], onRefresh?: () => void }) {
    const { connection } = useApp()
    const isPdb = connection.db_type === 'PDB'

    const handleForceCheckpoint = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/checkpoint/force`, { method: 'POST' })
            if (res.ok) {
                if (onRefresh) onRefresh()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) { console.error(err) }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Control Files</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs gap-1"
                            onClick={handleForceCheckpoint}
                            disabled={isPdb}
                            title={isPdb ? "Checkpoint not allowed in PDB" : ""}
                        >
                            <RefreshCw className="size-3" /> Force Checkpoint
                        </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                        <div>Inst</div>
                        <div className="col-span-4">Name</div>
                        <div>Status</div>
                    </div>
                    {files.map((cf, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                            <div className="font-mono text-xs text-muted-foreground">{cf.inst_id}</div>
                            <div className="col-span-4 font-mono text-xs truncate" title={cf.name}>{cf.name}</div>
                            <div>
                                <Badge variant="outline" className="text-[10px] h-5">
                                    {cf.status || 'ONLINE'}
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">No control files found.</div>
                    )}
                </div>

                <div className="rounded-md border border-border bg-surface p-4">
                    <h3 className="text-sm font-medium mb-3">Control File Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="text-muted-foreground">Block Size:</div>
                        <div className="font-mono">{files[0]?.block_size} bytes</div>
                        <div className="text-muted-foreground">File Size Blocks:</div>
                        <div className="font-mono">{files[0]?.file_size_blks}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-md border border-border bg-surface h-[300px] flex flex-col">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Checkpoint & Recovery Metrics (Blocks)
                    </div>
                    <div className="flex-1 p-2 min-h-0">
                        {checkpoint.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={checkpoint}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="inst_id" stroke="#888" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Instance', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                    <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                    <ReTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="actual_blks" name="Actual Redo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target_blks" name="Target Redo" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="est_ios" name="Est. Recovery IOs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No checkpoint progress available</div>
                        )}
                    </div>
                </div>

                <div className="rounded-md border border-border bg-surface p-4">
                    <h3 className="text-sm font-medium mb-2">MTTR Target</h3>
                    {checkpoint.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-border last:border-0">
                            <span className="text-muted-foreground">Instance {c.inst_id || 1} Estimated MTTR:</span>
                            <span className="font-mono font-bold text-primary">{c.estimated_mttr}s</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

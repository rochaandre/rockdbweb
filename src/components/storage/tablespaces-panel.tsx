import { useState, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import {
    RefreshCw,
    Search,
    ChevronLeft,
    ChevronRight,
    History,
    MousePointer2,
    BarChart3,
    Map,
    Copy,
    X,
    Gauge,
    Database
} from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { API_URL } from '@/context/app-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
    ContextMenu,
    ContextMenuItem,
    ContextMenuSeparator,
} from "@/components/ui/context-menu"

interface TablespacesPanelProps {
    tablespaces: any[];
    files: any[];
    onRefresh: (id?: string | number) => void;
    onShowSegments?: (ts: string) => void;
    instanceName?: string;
}

export function TablespacesPanel({ tablespaces, files, onRefresh, onShowSegments, instanceName = 'N/A' }: TablespacesPanelProps) {
    const [showTs, setShowTs] = useState(true)
    const [showDatafiles, setShowDatafiles] = useState(true)
    const [showData, setShowData] = useState(true)
    const [showTemp, setShowTemp] = useState(false)
    const [ioSort, setIoSort] = useState('blocks')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTs, setSelectedTs] = useState<string | null>(null)
    const [instances, setInstances] = useState<any[]>([])
    const [currentInst, setCurrentInst] = useState<string | number>('')

    useEffect(() => {
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
        fetchInstances()
    }, [])

    // Filtering logic
    const filteredTablespaces = useMemo(() => {
        return tablespaces.filter(ts => {
            const isTemp = ts.contents === 'TEMPORARY'
            if (isTemp && !showTemp) return false
            if (!isTemp && !showData) return false
            return true
        })
    }, [tablespaces, showData, showTemp])

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            // Master-Detail Filter
            if (selectedTs && f.tablespace_name !== selectedTs) return false

            // Show Temp Filter
            const isTemp = f.type === 'TEMP'
            if (isTemp && !showTemp) return false
            if (!isTemp && !showData) return false

            const matchesSearch = f.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.tablespace_name?.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesSearch
        })
    }, [files, searchQuery, selectedTs, showData, showTemp])

    const totalSize = tablespaces.reduce((acc, ts) => acc + (ts.total_mb || 0), 0)
    const totalUsed = tablespaces.reduce((acc, ts) => acc + (ts.used_mb || 0), 0)

    // Helper for sparklines
    const Sparkline = ({ data }: { data?: any[] }) => (
        <div className="flex items-end gap-0.5 h-6">
            {(data && data.length > 0 ? [data[0], data[1], data[0] / 2, data[1] / 2, data[0] / 4, data[1] / 4] : [2, 3, 5, 1, 6, 4]).map((h, i) => (
                <div
                    key={i}
                    className={twMerge(
                        "w-[3px] rounded-[1px]",
                        i % 2 === 0 ? "bg-orange-400" : "bg-blue-400"
                    )}
                    style={{ height: `${Math.min(Math.max(Number(h) || 0, 0) % 6 + 1, 6) * 4}px` }}
                />
            ))}
        </div>
    )

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-surface border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-6 border-r border-border pr-6">
                    <Checkbox id="ts-filter" label="TS" checked={showTs} onChange={(e: any) => setShowTs(e.target.checked)} />
                    <Checkbox id="df-filter" label="Datafiles" checked={showDatafiles} onChange={(e: any) => setShowDatafiles(e.target.checked)} />
                </div>

                <div className="flex items-center gap-6 border-r border-border pr-6">
                    <Checkbox id="data-filter" label="Show Data" checked={showData} onChange={(e: any) => setShowData(e.target.checked)} />
                    <Checkbox id="temp-filter" label="Show Temp" checked={showTemp} onChange={(e: any) => setShowTemp(e.target.checked)} />
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">I/O Activity By:</span>
                    <RadioGroup value={ioSort} onValueChange={setIoSort} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="number" id="io-num" />
                            <Label htmlFor="io-num" className="text-sm cursor-pointer font-normal">I/O Number</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="blocks" id="io-blocks" />
                            <Label htmlFor="io-blocks" className="text-sm cursor-pointer font-normal">DB Blocks</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="time" id="io-time" />
                            <Label htmlFor="io-time" className="text-sm cursor-pointer font-normal">I/O Time</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="flex items-center gap-3 border-l border-border pl-6">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instance:</span>
                    <select
                        className="h-8 bg-background border border-border rounded px-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
                        value={currentInst}
                        onChange={(e) => {
                            const val = e.target.value
                            setCurrentInst(val)
                            onRefresh(val)
                        }}
                    >
                        <option value="">Both Instances</option>
                        {instances.map(inst => (
                            <option key={inst.inst_id} value={inst.inst_id}>
                                Instance {inst.inst_id} ({inst.instance_name})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tablespaces Table */}
            {showTs && (
                <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-foreground">Tablespaces Performance</h2>
                            <Badge variant="outline" className="text-[10px] font-mono opacity-70">instance: {instanceName}</Badge>
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">{filteredTablespaces.length} active tablespaces</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                                    <th className="px-6 py-3 font-mono">TS#</th>
                                    <th className="px-6 py-3">NAME</th>
                                    <th className="px-6 py-3">Size (M)</th>
                                    <th className="px-6 py-3">Used (M)</th>
                                    <th className="px-6 py-3 w-48">Used %</th>
                                    <th className="px-6 py-3">STATUS</th>
                                    <th className="px-6 py-3">I/O ACTIVITY</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredTablespaces.map((ts, idx) => (
                                    <ContextMenu
                                        key={ts.tablespace_name || idx}
                                        trigger={
                                            <tr
                                                className={twMerge(
                                                    "hover:bg-muted/20 transition-colors group cursor-pointer",
                                                    selectedTs === (ts.tablespace_name || ts.name) && "bg-blue-50/50 border-l-2 border-primary"
                                                )}
                                                onClick={() => setSelectedTs(selectedTs === (ts.tablespace_name || ts.name) ? null : (ts.tablespace_name || ts.name))}
                                            >
                                                <td className="px-6 py-4 font-mono text-xs opacity-60">{idx}</td>
                                                <td className="px-6 py-4 font-bold text-sm text-primary">{ts.tablespace_name || ts.name}</td>
                                                <td className="px-6 py-4 text-xs font-mono">{ts.total_mb?.toLocaleString() || '0'}</td>
                                                <td className="px-6 py-4 text-xs font-mono">{ts.used_mb?.toLocaleString() || '0'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-muted rounded-full h-1.5 relative overflow-hidden">
                                                        <div
                                                            className={twMerge(
                                                                "h-full transition-all duration-500",
                                                                (ts.used_pct || ts.used_percent) > 90 ? "bg-red-500" :
                                                                    (ts.used_pct || ts.used_percent) > 75 ? "bg-amber-500" : "bg-blue-500"
                                                            )}
                                                            style={{ width: `${ts.used_pct || ts.used_percent || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-1 block">{(ts.used_pct || ts.used_percent || 0).toFixed(1)}% utilized</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={twMerge(
                                                        "text-[10px] font-bold px-1.5 py-0 h-5",
                                                        ts.status === 'ONLINE' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                                    )}>
                                                        {ts.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Sparkline data={[ts.phyrds, ts.phywrts]} />
                                                </td>
                                            </tr>
                                        }
                                    >
                                        <ContextMenuItem className="gap-2" onClick={() => onShowSegments?.(ts.tablespace_name || ts.name)}>
                                            <Map className="size-4 opacity-70" /> Show Extents Map
                                        </ContextMenuItem>
                                        <ContextMenuItem className="gap-2">
                                            <History className="size-4 opacity-70" /> Space Usage History
                                        </ContextMenuItem>
                                        <ContextMenuItem className="gap-2">
                                            <BarChart3 className="size-4 opacity-70" /> Throughput Analysis
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem className="gap-2">
                                            <Gauge className="size-4 opacity-70" /> Tablespace Reports
                                        </ContextMenuItem>
                                        <ContextMenuItem className="gap-2">
                                            <Database className="size-4 opacity-70" /> Datafile Info
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem className="gap-2">
                                            <Copy className="size-4 opacity-70" /> Copy Row Text
                                        </ContextMenuItem>
                                        <ContextMenuItem className="gap-2 text-red-500 focus:text-red-500">
                                            <X className="size-4 opacity-70" /> Close Menu
                                        </ContextMenuItem>
                                    </ContextMenu>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/20 font-bold border-t border-border">
                                <tr className="text-xs">
                                    <td className="px-6 py-3 text-right uppercase text-muted-foreground" colSpan={2}>TOTAL:</td>
                                    <td className="px-6 py-3 font-mono">{totalSize.toLocaleString()}</td>
                                    <td className="px-6 py-3 font-mono">{totalUsed.toLocaleString()}</td>
                                    <td className="px-6 py-3" colSpan={2}></td>
                                    <td className="px-6 py-3 text-[10px] font-mono text-muted-foreground opacity-70 uppercase tracking-tighter">
                                        N/A I/O Combined
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

            {/* Datafiles Details */}
            {showDatafiles && (
                <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-foreground">Datafiles Details</h2>
                            {selectedTs && (
                                <Badge variant="secondary" className="gap-1 animate-in zoom-in-50">
                                    TS: {selectedTs}
                                    <X className="size-3 cursor-pointer" onClick={() => setSelectedTs(null)} />
                                </Badge>
                            )}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                            <Input
                                className="pl-9 h-9 text-xs bg-background"
                                placeholder="Search datafiles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                                    <th className="px-6 py-3 font-mono">FILE#</th>
                                    <th className="px-6 py-3">FILE_NAME</th>
                                    <th className="px-6 py-3">Size (M)</th>
                                    <th className="px-6 py-3">Used %</th>
                                    <th className="px-6 py-3">STATUS</th>
                                    <th className="px-6 py-3">AUTOEXT</th>
                                    <th className="px-6 py-3">TS_NAME</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredFiles.map((file, idx) => (
                                    <tr key={file.file_id || idx} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs opacity-60">{file.file_id}</td>
                                        <td className="px-6 py-4 max-w-xs xl:max-w-md">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold truncate" title={file.file_name}>
                                                    {file.file_name?.split('/').pop() || 'unknown'}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-mono truncate" title={file.file_name}>
                                                    {file.file_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono">{file.size_mb?.toLocaleString() || '0'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-muted h-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full"
                                                        style={{ width: `${(file.used_mb / file.size_mb * 100) || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono opacity-70">
                                                    {((file.used_mb / file.size_mb * 100) || 0).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">
                                                {file.status || 'ONLINE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-[9px] font-bold h-4 px-1">
                                                {file.autoextensible}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                {file.tablespace_name}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Footer / Status Bar */}
            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/10 text-[10px] font-bold text-muted-foreground/80">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 uppercase tracking-tighter">
                        <History className="size-3" /> Last refreshed: {new Date().toLocaleTimeString()}
                    </span>
                    <span className="font-mono opacity-50 uppercase tracking-tighter">
                        DBA_TABLESPACES @ CLUSTER METRICS
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-muted" onClick={() => onRefresh(currentInst)}>
                            <RefreshCw className="size-3" />
                        </Button>
                        <span>AUTO-UPDATE: 30s</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded"><ChevronLeft className="size-3" /></Button>
                        <span className="px-2">PAGE 1 / 1</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded"><ChevronRight className="size-3" /></Button>
                    </div>
                </div>
            </div>

            {/* Legend / Tip */}
            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold pointer-events-none shadow-xl border border-white/10 z-50 animate-bounce">
                <MousePointer2 className="size-3" />
                RIGHT-CLICK ON ROWS FOR MORE ACTIONS
            </div>
        </div>
    )
}

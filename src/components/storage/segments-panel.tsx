import { useState, useEffect, useMemo } from 'react'
import {
    Filter,
    Database,
    Search,
    Layers,
    Copy,
    Play,
    RefreshCw,
    Monitor,
    Info,
    Box,
    ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const API_URL = 'http://localhost:8080/api'

interface SegmentsPanelProps {
    initialTablespace?: string;
}

export function SegmentsPanel({ initialTablespace }: SegmentsPanelProps) {
    const [tablespaces, setTablespaces] = useState<any[]>([])
    const [datafiles, setDatafiles] = useState<any[]>([])
    const [mapping, setMapping] = useState<any[]>([])

    // Filters
    const [selectedTs, setSelectedTs] = useState<string>(initialTablespace || '')
    const [selectedFile, setSelectedFile] = useState<string>('all')
    const [ownerFilter, setOwnerFilter] = useState('')
    const [segmentFilter, setSegmentFilter] = useState('')

    // UI States
    const [isLoading, setIsLoading] = useState(false)
    const [zoom, setZoom] = useState([50])
    const [autoSync, setAutoSync] = useState(true)
    const [selectedBlock, setSelectedBlock] = useState<any | null>(null)
    const [generatedSql, setGeneratedSql] = useState<string>('')

    // Storage Metrics
    const storageMetrics = useMemo(() => {
        if (mapping.length === 0) return { total: 0, used: 0, free: 0 }
        const total_kb = mapping.reduce((acc, curr) => acc + (curr.size_kb || 0), 0)
        const used_kb = mapping.filter(m => m.status === 'USED').reduce((acc, curr) => acc + (curr.size_kb || 0), 0)
        const free_kb = total_kb - used_kb
        return {
            total: (total_kb / 1024 / 1024).toFixed(2), // GB
            used: (used_kb / 1024).toFixed(1), // MB
            free: (free_kb / 1024).toFixed(1) // MB
        }
    }, [mapping])

    useEffect(() => {
        fetchTablespaces()
    }, [])

    useEffect(() => {
        if (selectedTs) {
            fetchData()
        }
    }, [selectedTs, selectedFile])

    const fetchTablespaces = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/tablespaces`)
            if (res.ok) {
                const data = await res.json()
                setTablespaces(data)
                if (!selectedTs && data.length > 0) setSelectedTs(data[0].tablespace_name || data[0].name)
            }
        } catch (e) {
            console.error('Error fetching tablespaces:', e)
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch Files
            const filesRes = await fetch(`${API_URL}/storage/datafiles`)
            if (filesRes.ok) {
                const allFiles = await filesRes.json()
                setDatafiles(allFiles.filter((f: any) => f.tablespace_name === selectedTs))
            }

            // Fetch Map
            const fileIdParam = selectedFile !== 'all' ? `&file_id=${selectedFile}` : ''
            const mapRes = await fetch(`${API_URL}/storage/tablespace-map?ts_name=${encodeURIComponent(selectedTs)}${fileIdParam}`)
            if (mapRes.ok) {
                const mapData = await mapRes.json()
                setMapping(mapData)
            }
        } catch (e) {
            console.error('Error fetching data:', e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBlockClick = (block: any) => {
        setSelectedBlock(block)
        if (block.status === 'USED') {
            const type = block.segment_type?.toUpperCase() || ''

            if (type === 'TEMPORARY') {
                setGeneratedSql(`-- Temporary segments (TEMP_SEGMENT) are managed by the database and cannot be moved for reorganization.`)
                return
            }

            const name = `"${block.owner}"."${block.segment_name}"`
            const ts = selectedTs ? ` TABLESPACE "${selectedTs}"` : ''

            let sql = `-- Actionable SQL for ${name}\n`

            if (type.includes('PARTITION')) {
                const part = ` PARTITION "${block.partition_name}"`
                if (type.includes('INDEX')) {
                    sql += `ALTER INDEX ${name} REBUILD${part}${ts} ONLINE;`
                } else {
                    sql += `ALTER TABLE ${name} MOVE${part}${ts} ONLINE;`
                }
            } else if (type.includes('INDEX')) {
                sql += `ALTER INDEX ${name} REBUILD${ts} ONLINE;`
            } else if (type.includes('LOB')) {
                sql += `ALTER TABLE ${name} MOVE${ts} ONLINE; -- Note: Consider MOVE LOB for specific columns if needed`
            } else {
                sql += `ALTER TABLE ${name} MOVE${ts} ONLINE;`
            }

            setGeneratedSql(sql)
        } else {
            setGeneratedSql('')
        }
    }

    const filteredMapping = useMemo(() => {
        if (!ownerFilter && !segmentFilter) return mapping
        return mapping.map(chunk => {
            if (chunk.status === 'FREE') return chunk
            const matchesOwner = ownerFilter ? chunk.owner?.toUpperCase().includes(ownerFilter.toUpperCase()) : true
            const matchesSegment = segmentFilter ? chunk.segment_name?.toUpperCase().includes(segmentFilter.toUpperCase()) : true
            return {
                ...chunk,
                isMatch: matchesOwner && matchesSegment
            }
        })
    }, [mapping, ownerFilter, segmentFilter])

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header Mockup Style */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowLeft className="size-4 text-slate-400 cursor-pointer" />
                        <h1 className="text-xl font-bold text-slate-800">Fully Synchronized Storage Explorer</h1>
                        <Badge variant="outline" className="ml-4 bg-blue-50 text-blue-700 border-blue-200">
                            TS: {selectedTs} | PERMANENT
                        </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        ORACLE DATABASE HEALTH MONITOR - ROCKDB
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="px-3 py-1.5 bg-green-50 text-green-700 border-green-200 gap-2 font-medium">
                        <Database className="size-3.5" /> Oracle 19c Connected
                    </Badge>
                    <Monitor className="size-5 text-slate-600" />
                    <Button variant="primary" className="gap-2">
                        <RefreshCw className="size-4" /> Sync All
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-white border-b sticky top-0 z-10 box-border h-fit">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tablespace Name</label>
                    <Select value={selectedTs} onValueChange={setSelectedTs}>
                        <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                            <SelectValue placeholder="Select Tablespace" />
                        </SelectTrigger>
                        <SelectContent>
                            {tablespaces.map(ts => (
                                <SelectItem key={ts.name || ts.tablespace_name} value={ts.name || ts.tablespace_name}>
                                    {ts.name || ts.tablespace_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Datafile Name</label>
                    <Select value={selectedFile} onValueChange={setSelectedFile}>
                        <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                            <SelectValue placeholder="All Datafiles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Datafiles ({datafiles.length} total)</SelectItem>
                            {datafiles.map(f => (
                                <SelectItem key={f.file_id} value={f.file_id.toString()}>
                                    {f.file_name.split('/').pop()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Owner Filter</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            className="bg-slate-50 border-slate-200 h-10 pl-9"
                            placeholder="e.g. SYS, HR..."
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Segment Name Filter</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            className="bg-slate-50 border-slate-200 h-10 pl-9"
                            placeholder="Search segment..."
                            value={segmentFilter}
                            onChange={(e) => setSegmentFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-end pb-0.5">
                    <Button variant="outline" className="h-10 w-10 p-0 text-slate-500 border-slate-200">
                        <Filter className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="flex gap-6 p-6 flex-1 min-h-0 overflow-hidden">
                {/* Left Sidebar: Visual Controls & Composition */}
                <div className="w-64 flex flex-col gap-6 shrink-0">
                    <Card className="p-5 flex flex-col gap-6 shadow-sm border-slate-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visual Controls</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 uppercase">Auto-Sync</span>
                                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Datafile Composition</h3>
                            {datafiles.map(f => {
                                const usedPct = Math.round((f.used_mb / f.size_mb) * 100) || 0;
                                return (
                                    <div key={f.file_id} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-medium text-slate-600">
                                            <span className="truncate max-w-[120px]">{f.file_name.split('/').pop()}</span>
                                            <span>{usedPct}% Used</span>
                                        </div>
                                        <Progress value={usedPct} className="h-1 bg-slate-100" />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="space-y-4 pt-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Legend</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="size-3.5 rounded bg-blue-600" />
                                    <span className="text-[11px] font-medium text-slate-600">Used Extent</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-3.5 rounded bg-sky-400" />
                                    <span className="text-[11px] font-medium text-slate-600">Filter Match</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-3.5 rounded bg-slate-100 border border-slate-200" />
                                    <span className="text-[11px] font-medium text-slate-600">Free Block</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content: Map Grid */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <Card className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b shrink-0">
                            <div className="flex items-center gap-6">
                                <h3 className="font-bold text-slate-800">Visual Extent Map</h3>
                                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 tracking-wider">ZOOM</span>
                                    <Slider value={zoom} onValueChange={setZoom} max={100} step={1} className="w-24 h-1.5" />
                                </div>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                Showing: <strong className="text-blue-600">{filteredMapping.length}</strong> blocks
                            </span>
                        </div>

                        <ScrollArea className="flex-1 p-6 relative">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <RefreshCw className="size-10 animate-spin opacity-20" />
                                    <p className="text-sm font-medium">Scanning Tablespace Mapping...</p>
                                </div>
                            ) : (
                                <div
                                    className="grid gap-1 content-start w-fit mx-auto"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.floor(20 + zoom[0] / 3)}, auto)`,
                                    }}
                                >
                                    {filteredMapping.map((block) => {
                                        let bgColor = 'bg-slate-100 border-slate-200'
                                        if (block.status === 'USED') {
                                            bgColor = 'bg-blue-600'
                                            if (block.isMatch) bgColor = 'bg-sky-400'
                                        }

                                        const isSelected = selectedBlock === block

                                        return (
                                            <TooltipProvider delayDuration={0} key={`${block.file_id}-${block.block_id}`}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className={`size-3.5 rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-20 ${bgColor} ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 scale-110 z-10' : ''}`}
                                                            onClick={() => handleBlockClick(block)}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="p-3 bg-slate-900 text-white border-0 shadow-xl max-w-xs">
                                                        <div className="space-y-1.5 text-[11px]">
                                                            <div className="font-bold text-blue-400 pb-1 border-b border-white/10 uppercase tracking-tighter">
                                                                {block.status} CHUNK
                                                            </div>
                                                            {block.status === 'USED' ? (
                                                                <>
                                                                    <div className="flex justify-between gap-4"><span className="opacity-60">Owner</span><span className="font-mono">{block.owner}</span></div>
                                                                    <div className="flex justify-between gap-4"><span className="opacity-60">Object</span><span className="font-mono text-white/90">{block.segment_name}</span></div>
                                                                    <div className="flex justify-between gap-4"><span className="opacity-60">Type</span><span className="font-mono italic">{block.segment_type}</span></div>
                                                                </>
                                                            ) : (
                                                                <div className="text-slate-400">Available Space</div>
                                                            )}
                                                            <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                                                                <span className="opacity-60">Address</span>
                                                                <span className="font-mono">F:{block.file_id} B:{block.block_id}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="opacity-60">Size</span>
                                                                <span className="text-green-400 font-bold">{(block.size_kb / 1024).toFixed(2)} MB</span>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-4 border-t bg-slate-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Selection Context Active</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-[10px] py-0 px-2 h-6 tracking-wide">
                                MODE: DYNAMIC SYNC
                            </Badge>
                        </div>
                    </Card>

                    {/* Actionable SQL Script Section */}
                    <Card className="shadow-sm border-slate-200 overflow-hidden shrink-0">
                        <div className="flex items-center justify-between p-4 bg-white border-b">
                            <div className="flex items-center gap-2">
                                <Monitor className="size-4 text-blue-600" />
                                <h3 className="font-bold text-slate-800 text-sm">Actionable SQL Script</h3>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 gap-2">
                                    <Play className="size-3.5 fill-current" /> Run Script
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-slate-200 h-8 gap-2 text-slate-700 border-0" onClick={() => {
                                    navigator.clipboard.writeText(generatedSql)
                                }}>
                                    <Copy className="size-3.5" /> Copy
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900 border-0 h-24 relative group">
                            <pre className="font-mono text-xs text-blue-400/90 h-full overflow-hidden leading-relaxed">
                                {generatedSql || "-- Click a segment in the map above to generate reorganization SQL..."}
                            </pre>
                            {!generatedSql && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center px-4 rounded-b-xl backdrop-blur-[1px]">
                                    <Info className="size-4 text-white/40 mr-2" />
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">No segment selected.</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Sidebar: Context & Info */}
                <div className="w-72 flex flex-col gap-6 shrink-0">
                    <Card className="p-5 flex flex-col gap-4 shadow-sm border-slate-200">
                        <div className="flex items-center gap-2 border-b pb-3 mb-1">
                            <Layers className="size-4 text-blue-600" />
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Segment Context</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Owner</label>
                                <div className="font-bold text-slate-700 text-sm leading-none">{selectedBlock?.owner || '-'}</div>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Segment Name</label>
                                <div className="font-bold text-blue-600 text-sm leading-none truncate">
                                    {selectedBlock?.segment_name || 'Select a block...'}
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Type</label>
                                <div className="font-bold text-slate-700 text-xs leading-none">{selectedBlock?.segment_type || '-'}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 flex flex-col gap-4 shadow-sm border-slate-200">
                        <div className="flex items-center gap-2 border-b pb-3 mb-1">
                            <Box className="size-4 text-blue-600" />
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Storage Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Allocated</label>
                                <div className="text-xl font-black text-slate-800 leading-none">
                                    {storageMetrics.total} <span className="text-xs font-bold text-slate-400 ml-1 uppercase">GB</span>
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Allocated Used</label>
                                <div className="text-xl font-black text-blue-600 leading-none">
                                    {storageMetrics.used} <span className="text-xs font-bold text-blue-400 ml-1 uppercase">MB</span>
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-green-600">Free Space</label>
                                <div className="text-xl font-black text-green-600 leading-none">
                                    {storageMetrics.free} <span className="text-xs font-bold text-green-400/70 ml-1 uppercase border-0">MB</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Status Toast style */}
            <div className="px-6 py-2">
                <div className="bg-slate-800 text-slate-200 px-5 py-2.5 rounded-full flex items-center gap-3 text-xs font-medium shadow-2xl mb-4 w-fit mx-auto ring-1 ring-white/10">
                    <RefreshCw className="size-3.5 text-blue-400 animate-[spin_3s_linear_infinite]" />
                    <span>Fully Synchronized Explorer Active. Panel metrics updated in real-time based on filters.</span>
                </div>
            </div>
        </div>
    )
}

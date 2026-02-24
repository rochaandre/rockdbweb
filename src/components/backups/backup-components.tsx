import { twMerge } from 'tailwind-merge'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_URL } from "@/context/app-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" --> Removed
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Copy, Terminal, FileDigit, HardDrive, RefreshCw, Archive, Globe, Database, ShieldCheck, Activity, HardDriveDownload, Calendar, Key } from "lucide-react"
// mock data removed

// --- status helper ---
function StatusBadge({ status }: { status: string }) {
    let variant = "bg-gray-100 text-gray-800"
    if (status === 'RUNNING') variant = "bg-blue-100 text-blue-800 animate-pulse"
    if (status === 'COMPLETED') variant = "bg-green-100 text-green-800"
    if (status === 'FAILED') variant = "bg-red-100 text-red-800"
    if (status.includes('WARNING')) variant = "bg-yellow-100 text-yellow-800"

    return (
        <span className={twMerge("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", variant)}>
            {status}
        </span>
    )
}

// --- Jobs Table ---
export function BackupJobsTable({
    data = [],
    selectedId,
    onSelect,
    showHeader = true
}: {
    data?: any[]
    selectedId?: number
    onSelect?: (id: number) => void
    showHeader?: boolean
}) {
    return (
        <div className="rounded-md border border-border bg-surface">
            {showHeader && (
                <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Backup Jobs
                </div>
            )}
            <div className="grid grid-cols-7 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-2">Operation</div>
                <div>Status</div>
                <div>Start Time</div>
                <div>Duration</div>
                <div>Output</div>
                <div className="text-right">Size</div>
            </div>
            {data.map((job) => (
                <div
                    key={job.session_key}
                    onClick={() => onSelect?.(job.session_key)}
                    className={twMerge(
                        "grid grid-cols-7 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 cursor-pointer transition-colors",
                        selectedId === job.session_key ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                    )}
                >
                    <div className="col-span-2 font-medium flex flex-col">
                        <span>{job.input_type}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{job.command_id}</span>
                    </div>
                    <div><StatusBadge status={job.status} /></div>
                    <div className="text-muted-foreground text-xs">{job.start_time}</div>
                    <div className="font-mono text-xs">{job.time_taken_display}</div>
                    <div className="text-xs">{job.output_device_type}</div>
                    <div className="text-right font-mono text-[10px]">
                        <div>In: {job.input_bytes_display}</div>
                        <div>Out: {job.output_bytes_display}</div>
                    </div>
                </div>
            ))}
            {data.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No backup jobs found.</div>
            )}
        </div>
    )
}

// --- Sets Table ---
export function BackupSetsTable({
    sets = [],
    selectedKey,
    onSelect,
    jobId
}: {
    sets?: any[]
    selectedKey?: number
    onSelect?: (key: number) => void
    jobId?: number
}) {
    if (!jobId) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/5">
                Select a Job to view Backup Sets.
            </div>
        )
    }

    if (sets.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/5">
                No Backup Sets found for this Job.
            </div>
        )
    }

    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Backup Sets Details (Job #{jobId})
            </div>
            <div className="grid grid-cols-7 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div>BS Key</div>
                <div>Type</div>
                <div className="col-span-2">Tag</div>
                <div>Device</div>
                <div>Pieces</div>
                <div className="text-right">Size</div>
            </div>
            {sets.map((set) => (
                <div
                    key={set.bs_key}
                    onClick={() => onSelect?.(set.bs_key)}
                    className={twMerge(
                        "grid grid-cols-7 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center cursor-pointer transition-colors",
                        selectedKey === set.bs_key ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                    )}
                >
                    <div className="font-mono text-xs text-muted-foreground">{set.bs_key}</div>
                    <div>
                        <span className={twMerge(
                            "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium border border-border",
                            set.type === 'FULL' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                set.type === 'INCR' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600"
                        )}>
                            {set.type}
                        </span>
                    </div>
                    <div className="col-span-2 font-mono text-xs truncate" title={set.tag}>{set.tag}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {set.device_type === 'TAPE' ? <FileDigit className="size-3.5" /> : <HardDrive className="size-3.5" />}
                        {set.device_type}
                    </div>
                    <div className="text-xs">{set.pieces}</div>
                    <div className="text-right font-mono text-[10px]">
                        {set.size_mb} MB
                    </div>
                </div>
            ))}
        </div>
    )
}

// --- Datafiles Table ---
export function DatafilesTable({ files = [], bsKey }: { files?: any[], bsKey?: number }) {
    if (!bsKey) return null // Hide if no set selected

    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Included Datafiles (BS Key #{bsKey})
            </div>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">File#</div>
                <div className="col-span-2">Tablespace</div>
                <div className="col-span-6">Checkpoint</div>
                <div className="col-span-3 text-right">Size</div>
            </div>
            {files.map((f, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                    <div className="col-span-1 font-mono text-xs text-muted-foreground">{f['file#']}</div>
                    <div className="col-span-2 text-xs">{f.tablespace}</div>
                    <div className="col-span-6 font-mono text-[10px] text-muted-foreground truncate" title={f.checkpoint_scn}>{f.checkpoint_scn}</div>
                    <div className="col-span-3 text-right font-mono text-[10px]">{f.size_mb} MB</div>
                </div>
            ))}
            {files.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-xs">No individual datafile records found for this set.</div>
            )}
        </div>
    )
}

// --- Images Table ---
export function BackupImagesTable({ images = [] }: { images?: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Backup Images / Datafile Copies
            </div>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">File#</div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Tag</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1 text-right">Size</div>
            </div>
            {images.map((img, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                    <div className="col-span-1 font-mono text-xs text-muted-foreground">{img['file#']}</div>
                    <div className="col-span-5 text-xs truncate font-mono text-muted-foreground" title={img.name}>{img.name}</div>
                    <div className="col-span-2 font-mono text-[10px] truncate" title={img.tag}>{img.tag}</div>
                    <div className="col-span-1">
                        <span className={twMerge(
                            "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium border border-border",
                            img.status === 'AVAILABLE' ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"
                        )}>
                            {img.status}
                        </span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">{img.creation_time}</div>
                    <div className="col-span-1 text-right font-mono text-[10px]">{img.size_mb} MB</div>
                </div>
            ))}
            {images.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No datafile copies found.</div>
            )}
        </div>
    )
}

// --- Summary Table (Detailed History) ---
export function BackupSummaryTable({ summary = [] }: { summary: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                <span>Backup Execution History</span>
                <span className="text-[10px] font-normal lowercase italic text-muted-foreground">Showing {summary.length} executions</span>
            </div>
            <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/50 p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <div className="col-span-1">RecID</div>
                <div className="col-span-1 text-center">DOW</div>
                <div className="col-span-2">Start Time</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Size (MB)</div>
                <div className="col-span-3 text-center grid grid-cols-5 gap-1">
                    <div title="Controlfile">CF</div>
                    <div title="Datafile">DF</div>
                    <div title="Incr L0">I0</div>
                    <div title="Incr L1">I1</div>
                    <div title="Archivelog">L</div>
                </div>
                <div className="col-span-1 text-right italic">Inst</div>
            </div>
            <div className="divide-y divide-border">
                {summary.map((item, i) => (
                    <div key={`${item.session_recid}-${item.session_stamp}-${i}`} className="grid grid-cols-12 gap-2 p-3 text-xs hover:bg-muted/30 items-center transition-colors">
                        <div className="col-span-1 font-mono text-muted-foreground">{item.session_recid}</div>
                        <div className="col-span-1 text-center font-semibold text-[10px]">{item.dow}</div>
                        <div className="col-span-2 text-[11px] font-mono">{item.start_time}</div>
                        <div className="col-span-1 font-mono text-[10px]">{item.time_taken_display}</div>
                        <div className="col-span-1 font-bold text-primary truncate" title={item.input_type}>{item.input_type}</div>
                        <div className="col-span-1 text-center">
                            <StatusBadge status={item.status} />
                        </div>
                        <div className="col-span-1 text-right font-mono font-bold">
                            {Math.round(item.output_mbytes).toLocaleString()}
                        </div>
                        <div className="col-span-3 grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                            <div className={twMerge(item.cf > 0 ? "text-primary font-bold" : "text-muted-foreground/30")}>{item.cf}</div>
                            <div className={twMerge(item.df > 0 ? "text-primary font-bold" : "text-muted-foreground/30")}>{item.df}</div>
                            <div className={twMerge(item.i0 > 0 ? "text-primary font-bold" : "text-muted-foreground/30")}>{item.i0}</div>
                            <div className={twMerge(item.i1 > 0 ? "text-primary font-bold" : "text-muted-foreground/30")}>{item.i1}</div>
                            <div className={twMerge(item.l > 0 ? "text-primary font-bold" : "text-muted-foreground/30")}>{item.l}</div>
                        </div>
                        <div className="col-span-1 text-right text-muted-foreground font-bold">#{item.output_instance}</div>
                    </div>
                ))}
                {summary.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground text-sm italic">
                        No backup records found for the selected period.
                    </div>
                )}
            </div>
        </div>
    )
}


// --- RMAN Generator ---
export function RmanGenerator({ nlsParams }: { nlsParams?: any }) {
    const [action, setAction] = useState('BACKUP')
    // Common
    const [target, setTarget] = useState('DATABASE')
    // Backup
    const [backupType, setBackupType] = useState('FULL')
    const [compress, setCompress] = useState(true)
    const [tag, setTag] = useState('')
    // Restore
    const [restoreOption, setRestoreOption] = useState('RESTORE') // PREVIEW, VALIDATE
    const [scn, setScn] = useState('')

    // Output
    const [script, setScript] = useState('')

    useEffect(() => {
        let cmd = `RUN {\n`

        if (action === 'BACKUP') {
            cmd += `  # Backup Configuration\n`
            cmd += `  ALLOCATE CHANNEL c1 DEVICE TYPE DISK;\n`
            cmd += `  BACKUP`
            if (backupType === 'INCR') cmd += ` INCREMENTAL LEVEL 1`
            if (backupType === 'ARCH') cmd += ` ARCHIVELOG ALL`
            else if (compress) cmd += ` AS COMPRESSED BACKUPSET`

            cmd += ` ${target}`
            if (tag) cmd += ` TAG '${tag}'`
            cmd += `;\n`
            if (backupType !== 'ARCH') cmd += `  BACKUP ARCHIVELOG ALL DELETE INPUT;\n`
        } else {
            cmd += `  # Restore Configuration\n`
            cmd += `  ALLOCATE CHANNEL c1 DEVICE TYPE DISK;\n`
            if (restoreOption === 'PREVIEW') cmd += `  RESTORE ${target} PREVIEW;\n`
            else if (restoreOption === 'VALIDATE') cmd += `  RESTORE ${target} VALIDATE;\n`
            else {
                if (scn) cmd += `  SET UNTIL SCN ${scn};\n`
                cmd += `  RESTORE ${target};\n`
                cmd += `  RECOVER ${target};\n`
            }
        }

        cmd += `  RELEASE CHANNEL c1;\n}`
        setScript(cmd)
    }, [action, target, backupType, compress, tag, restoreOption, scn])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-6 p-4 border border-border rounded-md bg-surface">
                <div className="flex items-center space-x-4 border-b border-border pb-4">
                    <Button variant={action === 'BACKUP' ? 'secondary' : 'outline'} onClick={() => setAction('BACKUP')} className="gap-2">
                        <Archive className="size-4" /> Backup
                    </Button>
                    <Button variant={action === 'RESTORE' ? 'secondary' : 'outline'} onClick={() => setAction('RESTORE')} className="gap-2">
                        <RefreshCw className="size-4" /> Restore
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Target Scope</Label>
                        <RadioGroup value={target} onValueChange={setTarget} className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DATABASE" id="t1" />
                                <Label htmlFor="t1">Database</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="TABLESPACE USERS" id="t2" />
                                <Label htmlFor="t2">Tablespace</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DATAFILE 1" id="t3" />
                                <Label htmlFor="t3">Datafile</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {action === 'BACKUP' && (
                        <>
                            <div className="space-y-2">
                                <Label>Backup Type</Label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm text-sm" value={backupType} onChange={(e) => setBackupType(e.target.value)}>
                                    <option value="FULL">Full Database</option>
                                    <option value="INCR">Incremental Level 1</option>
                                    <option value="ARCH">Archivelogs Only</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tag (Optional)</Label>
                                <Input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. WEEKLY_FULL" />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="comp" checked={compress} onChange={(e) => setCompress(e.target.checked as boolean)} />
                                <Label htmlFor="comp">Compress Backup Sets</Label>
                            </div>

                            {/* NLS Cards - User requested below Compress Backup Sets */}
                            {nlsParams && (
                                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border mt-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                        <div className="p-1.5 bg-blue-500/10 rounded-md">
                                            <Globe className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Language / Territory</p>
                                            <p className="text-sm font-bold">{`${nlsParams.language}_${nlsParams.territory}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                        <div className="p-1.5 bg-purple-500/10 rounded-md">
                                            <Database className="h-4 w-4 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Database Character Set</p>
                                            <p className="text-sm font-bold">{nlsParams.db_charset}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {action === 'RESTORE' && (
                        <>
                            <div className="space-y-2">
                                <Label>Operation Mode</Label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm text-sm" value={restoreOption} onChange={(e) => setRestoreOption(e.target.value)}>
                                    <option value="RESTORE">Real Restore & Recover</option>
                                    <option value="PREVIEW">Preview Restore (No Action)</option>
                                    <option value="VALIDATE">Validate Backups</option>
                                </select>
                            </div>
                            {restoreOption === 'RESTORE' && (
                                <div className="space-y-2">
                                    <Label>Point-in-Time Recovery (SCN)</Label>
                                    <Input value={scn} onChange={e => setScn(e.target.value)} placeholder="e.g. 1234567" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Generated RMAN Script</Label>
                <div className="flex-1 rounded-md bg-zinc-950 p-4 text-zinc-50 font-mono text-sm shadow-inner relative group border border-zinc-800">
                    <Terminal className="absolute top-4 right-4 text-zinc-700 size-5" />
                    <div className="whitespace-pre-wrap break-all text-xs leading-relaxed text-green-400">{script}</div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigator.clipboard.writeText(script)}
                        title="Copy to Clipboard"
                    >
                        <Copy className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// --- EXPDP Generator (Existing) ---
export function ExpdpGenerator({ nlsParams }: { nlsParams?: any }) {
    const [mode, setMode] = useState('SCHEMA')
    const [schemas, setSchemas] = useState('HR, SALES')
    const [directory, setDirectory] = useState('DATA_PUMP_DIR')
    const [parallel, setParallel] = useState(4)
    const [compression, setCompression] = useState(true)
    const [excludeInternalSchemas, setExcludeInternalSchemas] = useState(true)
    const [excludeStatistics, setExcludeStatistics] = useState(true)
    const [clusterN, setClusterN] = useState(true)
    const [fileSize, setFileSize] = useState('10')
    const [useParfile, setUseParfile] = useState(false)
    const [systemSchemas, setSystemSchemas] = useState<string[]>([])

    useEffect(() => {
        const fetchSystemSchemas = async () => {
            try {
                const res = await fetch(`${API_URL}/system/excluded-schemas`)
                if (res.ok) {
                    const data = await res.json()
                    setSystemSchemas(data)
                }
            } catch (err) {
                console.error("Failed to fetch system schemas", err)
            }
        }
        fetchSystemSchemas()
    }, [])

    // Derive command from state
    let command = `expdp system/password@db directory=${directory}`

    if (mode === 'SCHEMA') command += ` schemas=${schemas}`
    else if (mode === 'FULL') command += ` full=Y`
    else if (mode === 'TABLE') command += ` tables=${schemas}`

    command += ` dumpfile=${mode.toLowerCase()}_%U.dmp logfile=${mode.toLowerCase()}.log`

    if (parallel > 1) command += ` parallel=${parallel}`
    if (compression) command += ` compression=ALL`

    const exclusions: string[] = []
    if (excludeInternalSchemas && systemSchemas.length > 0) {
        exclusions.push(`SCHEMA:"IN ('${systemSchemas.join("','")}')"`)
    }
    if (excludeStatistics) {
        exclusions.push('STATISTICS')
    }

    if (exclusions.length > 0) {
        command += ` EXCLUDE=${exclusions.join(',')}`
    }

    if (clusterN) {
        command += ` CLUSTER=N`
    }

    if (fileSize) {
        command += ` FILESIZE=${fileSize}G`
    }

    // Generate parfile content
    const parfileLines: string[] = []
    parfileLines.push(`DIRECTORY=${directory}`)
    if (mode === 'SCHEMA') parfileLines.push(`SCHEMAS=${schemas}`)
    else if (mode === 'FULL') parfileLines.push(`FULL=Y`)
    else if (mode === 'TABLE') parfileLines.push(`TABLES=${schemas}`)

    parfileLines.push(`DUMPFILE=${mode.toLowerCase()}_%U.dmp`)
    parfileLines.push(`LOGFILE=${mode.toLowerCase()}.log`)

    if (parallel > 1) parfileLines.push(`PARALLEL=${parallel}`)
    if (compression) parfileLines.push(`COMPRESSION=ALL`)

    if (exclusions.length > 0) {
        parfileLines.push(`EXCLUDE=${exclusions.join(',')}`)
    }

    if (clusterN) parfileLines.push(`CLUSTER=N`)
    if (fileSize) parfileLines.push(`FILESIZE=${fileSize}G`)

    const parfileContent = parfileLines.join('\n')
    const finalDisplay = useParfile
        ? `expdp system/password@db parfile=export.par\n\n# --- export.par content ---\n${parfileContent}`
        : command

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Form */}
            <div className="space-y-6 p-4 border border-border rounded-md bg-surface">
                <div className="space-y-3">
                    <Label>Export Mode</Label>
                    <RadioGroup value={mode} onValueChange={setMode} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SCHEMA" id="r1" />
                            <Label htmlFor="r1">Schemas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TABLE" id="r2" />
                            <Label htmlFor="r2">Tables</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FULL" id="r3" />
                            <Label htmlFor="r3">Full Database</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Object Names (Comma separated)</Label>
                    <Input value={schemas} onChange={(e) => setSchemas(e.target.value)} disabled={mode === 'FULL'} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Directory Object</Label>
                        <Input value={directory} onChange={(e) => setDirectory(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Parallelism</Label>
                        <Input type="number" value={parallel} onChange={(e) => setParallel(Number(e.target.value))} min={1} max={32} />
                    </div>
                    <div className="space-y-2">
                        <Label>File Size (GB)</Label>
                        <Input type="number" value={fileSize} onChange={(e) => setFileSize(e.target.value)} min={1} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="comp" checked={compression} onChange={(e) => setCompression(e.target.checked)} />
                        <Label htmlFor="comp">Enable Compression</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cluster-n" checked={clusterN} onChange={(e) => setClusterN(e.target.checked)} />
                        <Label htmlFor="cluster-n">Cluster=N</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="exclude-stats" checked={excludeStatistics} onChange={(e) => setExcludeStatistics(e.target.checked)} />
                        <Label htmlFor="exclude-stats">Exclude Statistics</Label>
                    </div>
                    <div className="flex items-center space-x-2 text-amber-600">
                        <Checkbox id="exclude-sys" checked={excludeInternalSchemas} onChange={(e) => setExcludeInternalSchemas(e.target.checked)} />
                        <Label htmlFor="exclude-sys" className="font-semibold text-amber-600">Exclude Internal Schemas</Label>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <Label className="text-primary font-bold">Output Format</Label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setUseParfile(false)}
                                className={twMerge(
                                    "px-3 py-1 text-xs rounded-md border transition-colors",
                                    !useParfile ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:bg-muted"
                                )}
                            >
                                Direct Command
                            </button>
                            <button
                                onClick={() => setUseParfile(true)}
                                className={twMerge(
                                    "px-3 py-1 text-xs rounded-md border transition-colors",
                                    useParfile ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:bg-muted"
                                )}
                            >
                                Parameter File (PARFILE)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
                <Label>{useParfile ? 'Command & PARFILE Content' : 'Generated Command'}</Label>
                <div className="flex-1 rounded-md bg-zinc-950 p-4 text-zinc-50 font-mono text-sm shadow-inner relative group border border-zinc-800">
                    <Terminal className="absolute top-4 right-4 text-zinc-700 size-5" />
                    <div className="whitespace-pre-wrap break-all">{finalDisplay}</div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigator.clipboard.writeText(finalDisplay)}
                        title="Copy to Clipboard"
                    >
                        <Copy className="size-4" />
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    * Passwords are hidden or generic. Replace before execution.
                </div>

                {/* NLS_LANG Tip Card */}
                {nlsParams && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="py-3 border-b border-slate-800">
                            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Terminal className="size-4" /> Environment Setup Hint (NLS_LANG)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 font-mono text-[11px]">
                            <div className="space-y-1">
                                <p className="text-blue-400 font-bold">### COMANDO PARA LINUX (BASH) ###</p>
                                <div className="bg-black/40 p-2 rounded text-slate-300 border border-white/5 select-all">
                                    export NLS_LANG={nlsParams.language}_{nlsParams.territory}.{nlsParams.db_charset}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-amber-500 font-bold">### COMANDO PARA WINDOWS (CMD) ###</p>
                                <div className="bg-black/40 p-2 rounded text-slate-300 border border-white/5 select-all">
                                    set NLS_LANG={nlsParams.language}_{nlsParams.territory}.{nlsParams.db_charset}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

// --- Recovery Summary Card ---
export function RecoverySummaryCard({ summary }: { summary: any }) {
    if (!summary) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-surface border-border">
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Database Name / ID</CardTitle>
                    <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="py-2">
                    <div className="text-xl font-bold">{summary.name}</div>
                    <p className="text-[10px] text-muted-foreground font-mono">DBID: {summary.dbid}</p>
                </CardContent>
            </Card>

            <Card className="bg-surface border-border">
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Log Mode / Open Mode</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="py-2">
                    <div className="text-lg font-bold flex items-center gap-2">
                        <span className={twMerge(
                            "px-1.5 py-0.5 rounded text-[10px]",
                            summary.log_mode === 'ARCHIVELOG' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>{summary.log_mode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{summary.open_mode} ({summary.controlfile_type})</p>
                </CardContent>
            </Card>

            <Card className="bg-surface border-border">
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Current SCN</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="py-2">
                    <div className="text-xl font-mono font-bold text-blue-600">{summary.current_scn}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">Snapshot: {summary.current_time}</p>
                </CardContent>
            </Card>

            <Card className="bg-surface border-border">
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Creation Time</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="py-2">
                    <div className="text-lg font-medium">{summary.created}</div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Incarnation Table ---
export function IncarnationTable({ incarnations = [] }: { incarnations: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Key className="size-3.5" /> Database Incarnations
            </div>
            <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div>ID</div>
                <div>Status</div>
                <div className="col-span-2">ResetLogs Time</div>
                <div className="text-right">ResetLogs SCN</div>
                <div className="text-right">Prior SCN</div>
            </div>
            {incarnations.map((inc, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                    <div className="font-mono text-xs text-muted-foreground text-center bg-muted/50 rounded py-0.5">{inc['incarnation#']}</div>
                    <div>
                        <span className={twMerge(
                            "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium border border-border",
                            inc.status === 'CURRENT' ? "bg-green-100 text-green-700 border-green-200" :
                                inc.status === 'PARENT' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600"
                        )}>
                            {inc.status}
                        </span>
                    </div>
                    <div className="col-span-2 text-xs font-mono">{inc.resetlogs_time}</div>
                    <div className="text-right font-mono text-xs text-blue-600">{inc['resetlogs_change#']}</div>
                    <div className="text-right font-mono text-xs text-muted-foreground">{inc['prior_resetlogs_change#']}</div>
                </div>
            ))}
        </div>
    )
}

// --- Detailed Datafile Table ---
export function DatafileDetailedTable({ datafiles = [] }: { datafiles: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <HardDriveDownload className="size-3.5" /> Datafile Checkpoint Details
            </div>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-4">File Name</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-right">Checkpoint SCN</div>
                <div className="col-span-2">Checkpoint Time</div>
                <div className="col-span-2 text-right">Stop SCN</div>
            </div>
            <div className="max-h-[400px] overflow-auto divide-y divide-border">
                {datafiles.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 text-xs hover:bg-muted/30 items-center transition-colors">
                        <div className="col-span-1 font-mono text-muted-foreground">{f['file#']}</div>
                        <div className="col-span-4 font-mono text-[10px] truncate py-1 px-1.5 bg-muted/20 rounded" title={f.name}>
                            {f.name.split('/').pop()}
                        </div>
                        <div className="col-span-1 text-center font-bold text-[10px] uppercase">{f.status}</div>
                        <div className="col-span-2 text-right font-mono text-blue-600 font-bold">{f['checkpoint_change#']}</div>
                        <div className="col-span-2 font-mono text-[10px] text-muted-foreground">{f.checkpoint_time}</div>
                        <div className="col-span-2 text-right font-mono text-orange-600">
                            {f['last_change#'] || 'NULL'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
// --- Backup Size History Table ---
export function BackupSizeHistoryTable({ data = [] }: { data: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="size-3.5" /> Backup Size History (Daily Summary)
            </div>
            <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div>Date</div>
                <div>Type</div>
                <div className="text-right">Size (MB)</div>
                <div className="text-right">Time (Min)</div>
            </div>
            <div className="max-h-[300px] overflow-auto divide-y divide-border">
                {data.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-3 text-xs hover:bg-muted/30 items-center transition-colors">
                        <div className="font-mono text-muted-foreground">{item.completion_time}</div>
                        <div className="font-bold flex items-center gap-1.5">
                            <span className={twMerge(
                                "size-1.5 rounded-full",
                                item.type === 'LEVEL0' ? "bg-purple-500" :
                                    item.type === 'LEVEL1' ? "bg-blue-500" :
                                        item.type === 'ARCHIVELOG' ? "bg-amber-500" : "bg-gray-400"
                            )} />
                            {item.type}
                        </div>
                        <div className="text-right font-mono font-bold text-primary">{Math.round(item.mb).toLocaleString()}</div>
                        <div className="text-right font-mono text-muted-foreground">{item.min}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- RMAN Status Table ---
export function RmanStatusTable({ data = [] }: { data: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="size-3.5" /> RMAN Session Status (V$RMAN_STATUS)
            </div>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">RecID</div>
                <div className="col-span-3">Operation</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Start Time</div>
                <div className="col-span-2">End Time</div>
                <div className="col-span-2 text-right">MBytes/Sec</div>
            </div>
            <div className="max-h-[400px] overflow-auto divide-y divide-border">
                {data.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 text-xs hover:bg-muted/30 items-center transition-colors">
                        <div className="col-span-1 font-mono text-muted-foreground">{item.recid}</div>
                        <div className="col-span-3 font-bold">{item.operation}</div>
                        <div className="col-span-2">
                            <StatusBadge status={item.status} />
                        </div>
                        <div className="col-span-2 font-mono text-[10px]">{item.start_time}</div>
                        <div className="col-span-2 font-mono text-[10px]">{item.end_time}</div>
                        <div className="col-span-2 text-right font-mono font-bold text-blue-600">
                            {item.mbytes_processed > 0 ? (item.mbytes_processed / (item.elapsed_seconds || 1)).toFixed(2) : '0.00'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- RMAN Configuration Table ---
export function RmanConfigTable({ data = [] }: { data: any[] }) {
    return (
        <div className="rounded-md border border-border bg-surface">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="size-3.5" /> Persistent RMAN Configuration
            </div>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-2">Conf#</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-6">Value</div>
            </div>
            <div className="divide-y divide-border">
                {data.length > 0 ? data.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 text-xs hover:bg-muted/30 items-center transition-colors">
                        <div className="col-span-2 font-mono text-muted-foreground">{item['conf#']}</div>
                        <div className="col-span-4 font-bold text-primary">{item.name}</div>
                        <div className="col-span-6 font-mono text-blue-600 bg-blue-50/50 p-1 rounded border border-blue-100/50 truncate" title={item.value}>
                            {item.value}
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center bg-amber-500/5 text-amber-600 text-xs font-medium border-t border-amber-500/10">
                        Default configuration - Only non-default settings are shown.
                    </div>
                )}
            </div>
        </div>
    )
}

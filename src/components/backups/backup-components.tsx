import { twMerge } from 'tailwind-merge'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" --> Removed
import { useState, useEffect } from 'react'
import { Copy, Terminal, FileDigit, HardDrive, RefreshCw, Archive } from "lucide-react"
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

// --- Summary Table ---
export function BackupSummaryTable({ summary = [] }: { summary: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.map((item, i) => {
                return (
                    <div key={i} className="rounded-lg border border-border bg-surface p-4 shadow-sm flex flex-col justify-between gap-2">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.input_type}</div>
                        <div className="text-xl font-bold tracking-tight">{item.total_backups} Backups</div>
                        <div className="flex justify-between items-end">
                            <StatusBadge status={item.status} />
                            <div className="text-xs font-mono text-muted-foreground">{item.size_gb.toFixed(2)} GB</div>
                        </div>
                    </div>
                )
            })}
            {summary.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted-foreground text-sm border border-dashed rounded-md">
                    No backup summary found.
                </div>
            )}
        </div>
    )
}

// --- RMAN Generator ---
export function RmanGenerator() {
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
export function ExpdpGenerator() {
    const [mode, setMode] = useState('SCHEMA')
    const [schemas, setSchemas] = useState('HR, SALES')
    const [directory, setDirectory] = useState('DATA_PUMP_DIR')
    const [parallel, setParallel] = useState(4)
    const [compression, setCompression] = useState(true)
    const [command, setCommand] = useState('')

    useEffect(() => {
        let cmd = `expdp system/password@db directory=${directory}`

        if (mode === 'SCHEMA') cmd += ` schemas=${schemas}`
        else if (mode === 'FULL') cmd += ` full=Y`
        else if (mode === 'TABLE') cmd += ` tables=${schemas}`

        cmd += ` dumpfile=${mode.toLowerCase()}_%U.dmp logfile=${mode.toLowerCase()}.log`

        if (parallel > 1) cmd += ` parallel=${parallel}`
        if (compression) cmd += ` compression=ALL`

        setCommand(cmd)
    }, [mode, schemas, directory, parallel, compression])

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

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Directory Object</Label>
                        <Input value={directory} onChange={(e) => setDirectory(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Parallelism</Label>
                        <Input type="number" value={parallel} onChange={(e) => setParallel(Number(e.target.value))} min={1} max={32} />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="comp" checked={compression} onChange={(e) => setCompression(e.target.checked as boolean)} />
                    <Label htmlFor="comp">Enable Compression</Label>
                </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
                <Label>Generated Command</Label>
                <div className="flex-1 rounded-md bg-zinc-950 p-4 text-zinc-50 font-mono text-sm shadow-inner relative group border border-zinc-800">
                    <Terminal className="absolute top-4 right-4 text-zinc-700 size-5" />
                    <div className="whitespace-pre-wrap break-all">{command}</div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigator.clipboard.writeText(command)}
                        title="Copy to Clipboard"
                    >
                        <Copy className="size-4" />
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    * Passwords are hidden or generic. Replace before execution.
                </div>
            </div>
        </div>
    )
}

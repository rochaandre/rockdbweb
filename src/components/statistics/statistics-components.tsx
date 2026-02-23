import { useState, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { API_URL } from '@/context/app-context'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Play, Lock, Unlock, AlertTriangle, TrendingUp, Search, Check } from 'lucide-react'
import { toast } from 'sonner'

export interface StaleStatsRow {
    owner: string;
    table_name: string;
    partition_name?: string;
    type: string;
    num_rows: number | null;
    last_analyzed: string | null;
}

export interface DmlChangesRow {
    owner: string;
    table_name: string;
    inserts: number;
    updates: number;
    deletes: number;
    total_modifications: number;
    truncated: string;
    last_flush: string;
}

export function SearchableSelector({
    label,
    value,
    onValueChange,
    options,
    placeholder = "Select...",
    className = "",
    disabled = false
}: {
    label?: string,
    value: string,
    onValueChange: (val: string) => void,
    options: string[],
    placeholder?: string,
    className?: string,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredOptions = options.filter(o =>
        o.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={twMerge("space-y-1 relative", className)}>
            {label && <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>}
            <div className="relative">
                <div
                    className={twMerge(
                        "w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer flex items-center justify-between min-w-[200px]",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <div className="flex-1 truncate pr-2">
                        <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
                            {value || placeholder}
                        </span>
                    </div>
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-border bg-muted/20">
                            <input
                                autoFocus
                                className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-auto flex-1 bg-background">
                            <div
                                className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer flex items-center justify-between text-muted-foreground italic border-b border-border/50"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onValueChange('')
                                    setIsOpen(false)
                                    setSearch('')
                                }}
                            >
                                <span>(Any / All)</span>
                                {!value && <Check className="size-3.5 text-primary shrink-0" />}
                            </div>
                            {filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer flex items-center justify-between text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onValueChange(opt)
                                        setIsOpen(false)
                                        setSearch('')
                                    }}
                                >
                                    <span className="truncate pr-4">{opt}</span>
                                    {value === opt && <Check className="size-3.5 text-primary shrink-0" />}
                                </div>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(false)
                    }}
                />
            )}
        </div>
    )
}

export function StaleStatsTable({ data, onRefresh }: { data: StaleStatsRow[], onRefresh: () => void }) {
    const [isGathering, setIsGathering] = useState<string | null>(null)

    const handleGather = async (owner: string, table: string) => {
        setIsGathering(`${owner}.${table}`)
        try {
            const res = await fetch(`${API_URL}/statistics/gather`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner, table_name: table })
            })
            if (res.ok) {
                toast.success(`Statistics gathered for ${owner}.${table}`)
                onRefresh()
            } else {
                const err = await res.json()
                toast.error(`Error: ${err.detail}`)
            }
        } catch {
            toast.error('Failed to gather statistics')
        } finally {
            setIsGathering(null)
        }
    }

    return (
        <div className="rounded-md border border-border bg-surface overflow-hidden flex flex-col h-full">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                <span>Stale Statistics ({data.length})</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={onRefresh}>
                    <RefreshCw className="size-3" /> Refresh
                </Button>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 shadow-sm">
                        <tr className="text-left text-xs font-medium text-muted-foreground">
                            <th className="p-3 border-b border-border">Owner</th>
                            <th className="p-3 border-b border-border">Object Name</th>
                            <th className="p-3 border-b border-border">Type</th>
                            <th className="p-3 border-b border-border">Rows</th>
                            <th className="p-3 border-b border-border">Last Analyzed</th>
                            <th className="p-3 border-b border-border text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 border-b border-border last:border-0 h-11">
                                <td className="p-3 font-mono text-xs text-muted-foreground">{row.owner}</td>
                                <td className="p-3 font-medium">
                                    {row.table_name}
                                    {row.partition_name && (
                                        <span className="text-[10px] text-muted-foreground ml-2">
                                            ({row.partition_name})
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <Badge variant="outline" className="text-[10px] h-5">
                                        {row.type}
                                    </Badge>
                                </td>
                                <td className="p-3 font-mono text-xs">
                                    {row.num_rows ? row.num_rows.toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-3 text-xs text-muted-foreground">
                                    {row.last_analyzed || 'NEVER'}
                                </td>
                                <td className="p-3 text-right">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                                        onClick={() => handleGather(row.owner, row.table_name)}
                                        disabled={isGathering === `${row.owner}.${row.table_name}`}
                                    >
                                        <Play className={twMerge("size-3", isGathering === `${row.owner}.${row.table_name}` && "animate-spin")} />
                                        Gather
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                                    No stale statistics found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function DmlChangesTable({ data, onRefresh }: { data: DmlChangesRow[], onRefresh: () => void }) {
    return (
        <div className="rounded-md border border-border bg-surface overflow-hidden flex flex-col h-full">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    <span>DML Activity (DBA_TAB_MODIFICATIONS)</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={onRefresh}>
                    <RefreshCw className="size-3" /> Refresh
                </Button>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 shadow-sm">
                        <tr className="text-left text-xs font-medium text-muted-foreground">
                            <th className="p-3 border-b border-border">Owner</th>
                            <th className="p-3 border-b border-border">Table</th>
                            <th className="p-3 border-b border-border text-green-600">Inserts</th>
                            <th className="p-3 border-b border-border text-blue-600">Updates</th>
                            <th className="p-3 border-b border-border text-red-600">Deletes</th>
                            <th className="p-3 border-b border-border text-amber-600">Total Mods</th>
                            <th className="p-3 border-b border-border">Trunc</th>
                            <th className="p-3 border-b border-border">Last Flush</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 border-b border-border last:border-0 h-10">
                                <td className="p-3 font-mono text-xs text-muted-foreground">{row.owner}</td>
                                <td className="p-3 font-medium truncate max-w-[200px]" title={row.table_name}>{row.table_name}</td>
                                <td className="p-3 font-mono text-xs text-green-600 font-bold">{row.inserts.toLocaleString()}</td>
                                <td className="p-3 font-mono text-xs text-blue-600 font-bold">{row.updates.toLocaleString()}</td>
                                <td className="p-3 font-mono text-xs text-red-600 font-bold">{row.deletes.toLocaleString()}</td>
                                <td className="p-3 font-mono text-xs text-amber-600 font-bold">{row.total_modifications?.toLocaleString() || '0'}</td>
                                <td className="p-3">
                                    <Badge variant={row.truncated === 'YES' ? 'destructive' : 'outline'} className="text-[10px] h-4">
                                        {row.truncated}
                                    </Badge>
                                </td>
                                <td className="p-3 text-[10px] text-muted-foreground font-mono">{row.last_flush}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-muted-foreground bg-muted/5">
                                    <TrendingUp className="size-10 mx-auto opacity-10 mb-2" />
                                    <p className="text-sm font-medium">No DML modifications recorded.</p>
                                    <p className="text-xs italic opacity-70 mt-1">
                                        This might happen if no changes (INSERT/UPDATE/DELETE) were made since the last statistics gather,<br />
                                        or if background monitoring has not yet flushed changes to the monitoring views.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2 border-t border-border bg-muted/5 text-[10px] text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="size-3 text-amber-500" />
                Note: DBMS_STATS.FLUSH_DATABASE_MONITORING_INFO is executed automatically before refresh.
            </div>
        </div>
    )
}

export function StatisticsMaintenancePanel({ onRefresh }: { onRefresh: () => void }) {
    const [level, setLevel] = useState<'TABLE' | 'SCHEMA' | 'DATABASE' | 'DICTIONARY'>('TABLE')
    const [owner, setOwner] = useState('')
    const [tableName, setTableName] = useState('')
    const [estimatePercent, setEstimatePercent] = useState('AUTO_SAMPLE_SIZE')
    const [methodOpt, setMethodOpt] = useState('FOR ALL COLUMNS SIZE AUTO')
    const [degree, setDegree] = useState('AUTO_DEGREE')
    const [granularity, setGranularity] = useState('AUTO')
    const [cascade, setCascade] = useState('AUTO_CASCADE')
    const [noInvalidate, setNoInvalidate] = useState('AUTO_INVALIDATE')
    const [isProcessing, setIsProcessing] = useState(false)
    const [availableSchemas, setAvailableSchemas] = useState<string[]>([])
    const [availableTables, setAvailableTables] = useState<string[]>([])
    const [generatedCode, setGeneratedCode] = useState('')

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const res = await fetch(`${API_URL}/statistics/schemas`)
                if (res.ok) {
                    setAvailableSchemas(await res.json())
                }
            } catch (err) {
                console.error('Error fetching user schemas:', err)
            }
        }
        fetchSchemas()
    }, [])

    useEffect(() => {
        if (owner) {
            const fetchTables = async () => {
                try {
                    const res = await fetch(`${API_URL}/statistics/tables?owner=${owner}`)
                    if (res.ok) {
                        setAvailableTables(await res.json())
                    }
                } catch (err) {
                    console.error('Error fetching tables:', err)
                }
            }
            fetchTables()
        } else {
            setAvailableTables([])
        }
    }, [owner])

    useEffect(() => {
        let code = 'BEGIN\n'
        let proc = ''
        const args: string[] = []

        if (level === 'DATABASE') {
            proc = 'GATHER_DATABASE_STATS'
        } else if (level === 'DICTIONARY') {
            proc = 'GATHER_DICTIONARY_STATS'
        } else if (level === 'SCHEMA') {
            proc = 'GATHER_SCHEMA_STATS'
            args.push(`ownname => '${owner || 'SCHEMA_NAME'}'`)
        } else {
            proc = 'GATHER_TABLE_STATS'
            args.push(`ownname => '${owner || 'SCHEMA_NAME'}'`)
            args.push(`tabname => '${tableName || 'TABLE_NAME'}'`)
        }

        if (estimatePercent === 'AUTO_SAMPLE_SIZE') {
            args.push('estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE')
        } else {
            args.push(`estimate_percent => ${estimatePercent}`)
        }

        args.push(`method_opt => '${methodOpt}'`)

        if (degree === 'AUTO_DEGREE') {
            args.push('degree => DBMS_STATS.AUTO_DEGREE')
        } else {
            args.push(`degree => ${degree}`)
        }

        args.push(`granularity => '${granularity}'`)
        args.push(`cascade => ${cascade === 'AUTO_CASCADE' ? 'DBMS_STATS.AUTO_CASCADE' : cascade}`)
        args.push(`no_invalidate => ${noInvalidate === 'AUTO_INVALIDATE' ? 'DBMS_STATS.AUTO_INVALIDATE' : noInvalidate}`)

        code += `  DBMS_STATS.${proc}(\n    ${args.join(',\n    ')}\n  );\n`
        code += 'END;'
        setGeneratedCode(code)
    }, [level, owner, tableName, estimatePercent, methodOpt, degree, granularity, cascade, noInvalidate])

    const handleAction = async (type: 'gather' | 'lock' | 'unlock') => {
        if (type === 'gather') {
            if (level === 'TABLE' && (!owner || !tableName)) {
                toast.error('Please specify Owner and Table Name')
                return
            }
            if (level === 'SCHEMA' && !owner) {
                toast.error('Please specify Owner')
                return
            }
        } else {
            if (!owner || !tableName) {
                toast.error('Please specify Owner and Table Name')
                return
            }
        }

        setIsProcessing(true)
        const endpoint = type === 'gather' ? 'gather' : 'lock'
        const action = type === 'lock' ? 'LOCK' : (type === 'unlock' ? 'UNLOCK' : undefined)

        try {
            const body: Record<string, unknown> = {
                level,
                owner: owner || undefined,
                table_name: tableName || undefined
            }

            if (type === 'gather') {
                body.estimate_percent = estimatePercent
                body.method_opt = methodOpt
                body.degree = degree
                body.granularity = granularity

                if (cascade === 'TRUE') body.cascade = true
                else if (cascade === 'FALSE') body.cascade = false
                else body.cascade = 'AUTO_CASCADE'

                if (noInvalidate === 'TRUE') body.no_invalidate = true
                else if (noInvalidate === 'FALSE') body.no_invalidate = false
                else body.no_invalidate = 'AUTO_INVALIDATE'
            }

            if (action) body.action = action

            const res = await fetch(`${API_URL}/statistics/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast.success(`Action ${type} completed successfully`)
                if (onRefresh) onRefresh()
            } else {
                const errJson = await res.json()
                toast.error(`Error: ${errJson.detail}`)
            }
        } catch (err) {
            console.error(err)
            toast.error(`Failed to execute ${type} action`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="rounded-md border border-border bg-surface p-6 space-y-6 max-w-4xl">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">Manual Statistics Maintenance</h3>
                <p className="text-sm text-muted-foreground">Collect or manage statistics using DBMS_STATS with advanced control.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Maintenance Level</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as 'TABLE' | 'SCHEMA' | 'DATABASE' | 'DICTIONARY')}
                        >
                            <option value="TABLE">Table (GATHER_TABLE_STATS)</option>
                            <option value="SCHEMA">Schema (GATHER_SCHEMA_STATS)</option>
                            <option value="DICTIONARY">Dictionary (GATHER_DICTIONARY_STATS)</option>
                            <option value="DATABASE">Database (GATHER_DATABASE_STATS)</option>
                        </select>
                    </div>
                    {level !== 'DATABASE' && level !== 'DICTIONARY' && (
                        <SearchableSelector
                            label="Owner / Schema"
                            value={owner}
                            onValueChange={setOwner}
                            options={availableSchemas}
                            placeholder="Select Schema"
                        />
                    )}
                    {level === 'TABLE' && (
                        <SearchableSelector
                            label="Table Name"
                            value={tableName}
                            onValueChange={setTableName}
                            options={availableTables}
                            placeholder={!owner ? "Select Schema First" : "Select Table"}
                            disabled={!owner}
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Estimate Percent</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={estimatePercent}
                            onChange={(e) => setEstimatePercent(e.target.value)}
                        >
                            <option value="AUTO_SAMPLE_SIZE">Auto (DBMS_STATS.AUTO_SAMPLE_SIZE)</option>
                            <option value="100">100% (Full Scan)</option>
                            <option value="10">10%</option>
                            <option value="1">1%</option>
                            <option value="0.1">0.1%</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Method Opt</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={methodOpt}
                            onChange={(e) => setMethodOpt(e.target.value)}
                        >
                            <option value="FOR ALL COLUMNS SIZE AUTO">Auto (FOR ALL COLUMNS SIZE AUTO)</option>
                            <option value="FOR ALL COLUMNS SIZE REPEAT">Repeat (Existing histograms)</option>
                            <option value="FOR ALL COLUMNS SIZE SKEWONLY">Skew Only</option>
                            <option value="FOR ALL COLUMNS SIZE 1">No Histograms</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Degree (Parallelism)</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                        >
                            <option value="AUTO_DEGREE">Auto (DBMS_STATS.AUTO_DEGREE)</option>
                            <option value="1">1 (Serial)</option>
                            <option value="2">2</option>
                            <option value="4">4</option>
                            <option value="8">8</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Granularity</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={granularity}
                            onChange={(e) => setGranularity(e.target.value)}
                        >
                            <option value="AUTO">Auto</option>
                            <option value="ALL">All</option>
                            <option value="GLOBAL">Global</option>
                            <option value="PARTITION">Partition</option>
                            <option value="SUBPARTITION">Subpartition</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Cascade (Index Stats)</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={cascade}
                            onChange={(e) => setCascade(e.target.value)}
                        >
                            <option value="AUTO_CASCADE">Auto (Default)</option>
                            <option value="TRUE">True</option>
                            <option value="FALSE">False</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">No Invalidate</label>
                        <select
                            className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                            value={noInvalidate}
                            onChange={(e) => setNoInvalidate(e.target.value)}
                        >
                            <option value="AUTO_INVALIDATE">Auto (Rolling)</option>
                            <option value="TRUE">True (Delay)</option>
                            <option value="FALSE">False (Immediate)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    className="flex-1 gap-2 h-10"
                    onClick={() => handleAction('gather')}
                    disabled={isProcessing}
                >
                    <Play className={twMerge("size-4", isProcessing && "animate-spin")} />
                    Gather {level === 'TABLE' ? 'Table' : (level === 'SCHEMA' ? 'Schema' : (level === 'DICTIONARY' ? 'Dictionary' : 'Database'))} Stats
                </Button>

                {level === 'TABLE' && (
                    <>
                        <Button
                            variant="outline"
                            className="gap-2 h-10 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleAction('lock')}
                            disabled={isProcessing}
                        >
                            <Lock className="size-4" />
                            Lock Stats
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 h-10 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleAction('unlock')}
                            disabled={isProcessing}
                        >
                            <Unlock className="size-4" />
                            Unlock Stats
                        </Button>
                    </>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <Play className="size-3" />
                        Generated Command
                    </label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => {
                            navigator.clipboard.writeText(generatedCode)
                            toast.success('Script copied to clipboard')
                        }}
                    >
                        Copy Script
                    </Button>
                </div>
                <div className="bg-slate-950 rounded-md p-4 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto whitespace-pre">
                    {generatedCode}
                </div>
            </div>

            <div className="bg-muted/30 rounded-md p-4 space-y-3 border border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="size-3 text-amber-500" />
                    Best Practices
                </h4>
                <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                    <p>• <strong>Estimate Percent:</strong> Use Auto Sample Size for optimal results in Oracle 12c+.</p>
                    <p>• <strong>Method Opt:</strong> Auto allows Oracle to decide which columns need histograms based on workload.</p>
                    <p>• <strong>Parallelism:</strong> Use Degree to speed up collection on large tables (Auto Degree follows system settings).</p>
                    <p>• <strong>No Invalidate:</strong> Auto Invalidate prevents sudden performance drops by rolling cursor invalidation.</p>
                </div>
            </div>
        </div>
    )
}

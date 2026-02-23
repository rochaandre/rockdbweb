import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { useState, useEffect } from 'react'
import { API_URL, useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Printer, FileType, Table as TableIcon, Code, Database, Info } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function SqlReportView() {
    const { reportType, sqlId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { connection } = useApp()

    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const instId = searchParams.get('inst_id') || '1'
    const childNumber = searchParams.get('child_number') || searchParams.get('child') || '0'

    const fetchReportData = async () => {
        if (!sqlId || sqlId === 'undefined') {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        try {
            if (reportType === 'statistics') {
                const res = await fetch(`${API_URL}/sessions/sql-statistics/${sqlId}?inst_id=${instId}&child_number=${childNumber}`)
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            }
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReportData()
    }, [reportType, sqlId, instId, childNumber])

    const getTitle = () => {
        const base = (() => {
            switch (reportType) {
                case 'bind-capture': return 'Bind Variables Capture'
                case 'statistics': return 'SQL Statistics (v$sql)'
                case 'optimizer-env': return 'Optimizer Environment'
                case 'plan-history': return 'Plan Switch History'
                case 'xplan': return 'XPlan'
                case 'xplan-all': return 'XPlan All'
                case 'xplan-stats': return 'XPlan AllStats'
                default: return 'SQL Report'
            }
        })()
        return `${base} - ${connection.name || 'DB'}`
    }

    const StatGrid = ({ title, items }: { title: string, items: { label: string, value: any }[] }) => (
        <div className="border border-border rounded-lg overflow-hidden shrink-0">
            <div className="bg-muted/50 px-3 py-1.5 border-b border-border text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Info className="size-3" />
                {title}
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-border text-xs bg-white">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-2 gap-0.5">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">{item.label}</span>
                        <span className="font-mono text-foreground truncate" title={String(item.value)}>
                            {item.value === null || item.value === undefined ? '-' : String(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header / Toolbar */}
                <div className="border-b border-border bg-muted/20 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                        <h1 className="text-sm font-semibold ml-2">{getTitle()}</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7"><FileType className="h-4 w-4 mr-1" /> HTML</Button>
                        <Button variant="ghost" size="sm" className="h-7"><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                        <Button variant="ghost" size="sm" className="h-7"><Printer className="h-4 w-4 mr-1" /> Print</Button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50/50 border-b border-blue-200 p-4 shadow-sm">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900 text-[10px] uppercase">Instance ID</span>
                            <span className="font-bold">{instId}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900 text-[10px] uppercase">SQL ID</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-blue-600 font-bold">{sqlId || 'NO SQL ID'}</span>
                                <span className="text-[10px] px-1 bg-blue-100 text-blue-700 rounded border border-blue-200">Child: {childNumber}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900 text-[10px] uppercase">Database</span>
                            <span className="flex items-center gap-1 font-bold text-foreground"><Database className="size-3" /> {connection.name} ({connection.type})</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900 text-[10px] uppercase">Report Time</span>
                            <span className="text-muted-foreground">{new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    {/* See Also Links */}
                    <div className="mt-3 pt-3 border-t border-blue-200 text-xs flex gap-3 flex-wrap">
                        <span className="font-semibold text-blue-900">Reports:</span>
                        {[
                            { label: 'SQL Statistics', type: 'statistics' },
                            { label: 'Plan Switch History', type: 'plan-history' },
                            { label: 'XPlan', type: 'xplan' },
                            { label: 'Optimizer Env', type: 'optimizer-env' },
                            { label: 'Stage in SQL Central', path: `/sql-central/${sqlId}?inst_id=${instId}` }
                        ].map((link, i) => (
                            link.path ? (
                                <Link key={i} to={link.path} className="text-blue-600 hover:underline font-medium">
                                    {link.label}
                                </Link>
                            ) : (
                                <Link key={i} to={`/sql-report/${link.type}/${sqlId}?inst_id=${instId}&child_number=${childNumber}`} className={twMerge("text-blue-600 hover:underline font-medium", reportType === link.type && "text-blue-900 font-bold underline")}>
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 overflow-auto p-6 space-y-8 bg-slate-50/30 font-sans">
                    {!sqlId || sqlId === 'undefined' ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-destructive/50 rounded-xl text-destructive gap-4 bg-destructive/5">
                            <div className="size-12 rounded-full bg-destructive/20 flex items-center justify-center"><Info className="size-6" /></div>
                            <p className="font-bold text-lg">Invalid SQL ID</p>
                            <p className="text-sm text-center max-w-md">The SQL ID received is <code className="bg-destructive/10 px-1 rounded">undefined</code>. This usually happens when the selected session does not have an active SQL statement at the moment.</p>
                            <Button variant="outline" size="sm" className="border-destructive/20 hover:bg-destructive/10" onClick={() => navigate(-1)}>Go Back</Button>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-64 italic text-muted-foreground animate-pulse">
                            Generating SQL Report...
                        </div>
                    ) : !data || !data.statistics || Object.keys(data.statistics).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-muted-foreground gap-4 bg-white">
                            <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center"><Info className="size-6" /></div>
                            <p className="font-medium">No results found for SQL ID {sqlId} (Instance {instId}, Child {childNumber}).</p>
                            <p className="text-xs text-center max-w-md">SQL might have aged out of the library cache (V$SQL) or the provided parameters do not match any entry in the current instance.</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
                                <Button variant="outline" size="sm" onClick={fetchReportData}>Retry</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatGrid title="Execution Plan (v$sql)" items={[
                                    { label: 'Plan Hash Value', value: data.statistics.plan_hash_value },
                                    { label: 'Full Plan Hash', value: data.statistics.full_plan_hash_value },
                                    { label: 'Optimizer Mode', value: data.statistics.optimizer_mode },
                                    { label: 'Optimizer Cost', value: data.statistics.optimizer_cost },
                                    { label: 'Last Active', value: data.statistics.last_active_time },
                                    { label: 'Child Number', value: data.statistics.child_number }
                                ]} />

                                <StatGrid title="Execution Data" items={[
                                    { label: 'Executions', value: data.statistics.executions },
                                    { label: 'Loads', value: data.statistics.loads },
                                    { label: 'Fetches', value: data.statistics.fetches },
                                    { label: 'Invalidadions', value: data.statistics.invalidations },
                                    { label: 'Parse Calls', value: data.statistics.parse_calls },
                                    { label: 'Rows Processed', value: data.statistics.rows_processed }
                                ]} />

                                <StatGrid title="Wait Statistics (ms)" items={[
                                    { label: 'CPU Time', value: data.statistics.cpu_time },
                                    { label: 'Elapsed Time', value: data.statistics.elapsed_time },
                                    { label: 'Application Wait', value: data.statistics.application_wait_time },
                                    { label: 'Concurrency Wait', value: data.statistics.concurrency_wait_time },
                                    { label: 'Cluster Wait', value: data.statistics.cluster_wait_time },
                                    { label: 'User IO Wait', value: data.statistics.user_io_wait_time }
                                ]} />

                                <StatGrid title="IO & Throughput" items={[
                                    { label: 'Disk Reads', value: data.statistics.disk_reads },
                                    { label: 'Direct Reads', value: data.statistics.direct_reads },
                                    { label: 'Buffer Gets', value: data.statistics.buffer_gets },
                                    { label: 'Physical Read Bytes', value: data.statistics.physical_read_bytes },
                                    { label: 'Physical Write Bytes', value: data.statistics.physical_write_bytes },
                                    { label: 'Offload Eligible', value: data.statistics.io_cell_offload_eligible_bytes }
                                ]} />

                                <StatGrid title="Environment" items={[
                                    { label: 'Schema Name', value: data.statistics.parsing_schema_name },
                                    { label: 'Module', value: data.statistics.module },
                                    { label: 'Action', value: data.statistics.action },
                                    { label: 'Profile', value: data.statistics.sql_profile || 'NONE' },
                                    { label: 'Baseline', value: data.statistics.sql_plan_baseline || 'NONE' },
                                    { label: 'Service', value: data.statistics.service }
                                ]} />

                                <StatGrid title="Memory" items={[
                                    { label: 'Sharable Mem', value: data.statistics.sharable_mem },
                                    { label: 'Persistent Mem', value: data.statistics.persistent_mem },
                                    { label: 'Runtime Mem', value: data.statistics.runtime_mem },
                                    { label: 'Typecheck Mem', value: data.statistics.typecheck_mem },
                                    { label: 'Users Opening', value: data.statistics.users_opening },
                                    { label: 'Users Executing', value: data.statistics.users_executing }
                                ]} />
                            </div>

                            {/* Bind Variables Section */}
                            {(data.bind_capture?.length > 0 || data.bind_data?.length > 0) && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TableIcon className="size-4 text-blue-600" />
                                        <h2 className="text-sm font-bold uppercase tracking-tight">Bind Variables</h2>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white border border-border rounded-lg shadow-sm">
                                            <div className="px-3 py-2 border-b border-border bg-muted/30 flex justify-between items-center">
                                                <span className="text-[10px] font-bold uppercase">Captured Values (v$sql_bind_capture)</span>
                                            </div>
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50/80 border-b border-border text-muted-foreground uppercase text-[9px]">
                                                    <tr>
                                                        <th className="px-3 py-1.5 text-left">Name</th>
                                                        <th className="px-3 py-1.5 text-left">Type</th>
                                                        <th className="px-3 py-1.5 text-right">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {data.bind_capture.map((b: any, i: number) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-3 py-2 font-mono font-semibold">{b.name}</td>
                                                            <td className="px-3 py-2 text-muted-foreground">{b.datatype_string}</td>
                                                            <td className="px-3 py-2 text-right font-mono text-blue-600">{b.value_string}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="bg-white border border-border rounded-lg shadow-sm">
                                            <div className="px-3 py-2 border-b border-border bg-muted/30 flex justify-between items-center">
                                                <span className="text-[10px] font-bold uppercase">Peeked Values (v$sql_bind_data)</span>
                                            </div>
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50/80 border-b border-border text-muted-foreground uppercase text-[9px]">
                                                    <tr>
                                                        <th className="px-3 py-1.5 text-left">Pos</th>
                                                        <th className="px-3 py-1.5 text-left">Type</th>
                                                        <th className="px-3 py-1.5 text-right">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {data.bind_data.map((b: any, i: number) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-3 py-2 font-mono font-semibold">{b.position}</td>
                                                            <td className="px-3 py-2 text-muted-foreground">{b.datatype_string}</td>
                                                            <td className="px-3 py-2 text-right font-mono text-purple-600">{b.value_string}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SQL Text Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Code className="size-4 text-blue-600" />
                                    <h3 className="text-sm font-bold uppercase tracking-tight">Full SQL Text</h3>
                                </div>
                                <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-xl border border-slate-800 font-mono text-[11px] leading-relaxed relative group">
                                    <button
                                        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-all border border-slate-700"
                                        onClick={() => navigator.clipboard.writeText(data.sql_text)}
                                        title="Copy SQL"
                                    >
                                        <Copy className="size-4" />
                                    </button>
                                    <pre className="whitespace-pre-wrap">{data.sql_text}</pre>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

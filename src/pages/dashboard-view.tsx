import { useState, useEffect } from 'react'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Database, Server, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, MousePointer, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SystemHealthCharts } from '@/components/dashboard/system-health-charts'
import { useApp, API_URL } from '@/context/app-context'

export function DashboardView() {
    const { connection } = useApp()
    const navigate = useNavigate()
    const [activityFilter, setActivityFilter] = useState("")
    const [waitFilter, setWaitFilter] = useState("")
    const [schemaFilter, setSchemaFilter] = useState("")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [metrics, setMetrics] = useState<any>(null)
    const [tablespaces, setTablespaces] = useState<any[]>([])

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            const [mRes, tsRes] = await Promise.all([
                fetch(`${API_URL}/dashboard/metrics`),
                fetch(`${API_URL}/dashboard/tablespaces`)
            ])
            if (mRes.ok) setMetrics(await mRes.json())
            if (tsRes.ok) setTablespaces(await tsRes.json())
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const handleRefresh = () => {
        fetchData()
    }

    const summaryCards = [
        {
            title: "Total Sessions",
            value: (
                <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={(e) => { e.stopPropagation(); navigate('/sessions'); }}
                >
                    {metrics?.sessions?.total || "..."}
                </span>
            ),
            icon: Activity,
            description: (
                <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={(e) => { e.stopPropagation(); navigate('/sessions?status=active'); }}
                >
                    {metrics?.sessions?.active || 0} active sessions
                </span>
            )
        },
        { title: "DB Architecture", value: metrics?.health?.db_arch || "...", icon: Database, description: "Instance/PDB Info" },
        { title: "SGA Size", value: metrics?.sga?.['Total SGA size'] ? (metrics.sga['Total SGA size'] / 1024 / 1024 / 1024).toFixed(2) + " GB" : "...", icon: Server, description: "Shared Memory" },
        {
            title: "Log Mode",
            value: connection.log_mode || "Unknown",
            icon: AlertTriangle,
            description: connection.is_rac ? "RAC Enabled" : "Single Instance",
            urgent: connection.log_mode === 'NOARCHIVELOG',
            onClick: () => navigate('/redo-log?tab=groups')
        },
        {
            title: "Database Objects",
            value: metrics?.health?.invalid_objects_count || 0,
            icon: Database,
            description: "Invalid Objects",
            urgent: (metrics?.health?.invalid_objects_count || 0) > 0,
            onClick: () => navigate('/sql-central/invalid_objects')
        },
        {
            title: "Open Cursors",
            value: metrics?.health?.cursors || 0,
            icon: MousePointer,
            description: "Current open cursors",
            onClick: () => navigate('/sql-central/open_cursors_details')
        },
        {
            title: "Invalid Triggers",
            value: metrics?.health?.triggers?.INVALID || 0,
            icon: AlertTriangle,
            description: "Needs attention",
            urgent: (metrics?.health?.triggers?.INVALID || 0) > 0,
            onClick: () => navigate('/sql-central/disabled_triggers')
        },
        {
            title: "Long Operations",
            value: metrics?.health?.long_ops || 0,
            icon: Clock,
            description: "Active long-running tasks",
            onClick: () => navigate('/long-operations')
        },
    ]

    const [activeTab, setActiveTab] = usePersistentState('dashboard', 'activeTab', 'overview')
    const [selectedSga, setSelectedSga] = useState<string | null>('buffer_cache')

    // State for Time Slider (1 hour range, 15s steps)
    const [sliderValue, setSliderValue] = useState(Date.now())
    const historyTime = new Date(sliderValue)

    // Mock Data for SGA Scissor charts
    // If Time Machine: Deterministic based on time
    // If Live: Random
    const mockChartData = (length: number) => {
        if (activeTab === 'timemachine') {
            return Array.from({ length }, (_, i) => {
                const seed = sliderValue + (i * 12345);
                const x = Math.sin(seed) * 10000;
                const rnd = x - Math.floor(x);
                return Math.floor(rnd * 60) + 10;
            })
        }
        return Array.from({ length }, () => Math.floor(Math.random() * 60) + 10)
    }


    // --- New Widgets for Time Machine ---

    // Helper for deterministic random based on time
    const getDeterministicValue = (base: number, variance: number, time: number) => {
        const seed = time + base;
        const x = Math.sin(seed) * 10000;
        const rnd = x - Math.floor(x); // 0..1
        // Return base +/- variance
        return Math.floor(base + (rnd * variance * 2) - variance);
    }

    // 1. Arrow Widget (Yellow/Green flow style)
    const ArrowWidget = ({ title, baseValue, suffix, data, direction = 'right' }: any) => {
        // Calculate dynamic value if baseValue is number, else pass through string
        const displayValue = typeof baseValue === 'number'
            ? getDeterministicValue(baseValue, baseValue * 0.1, sliderValue).toLocaleString() + (suffix || '')
            : baseValue;

        const clipRight = 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)';
        const clipLeft = 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)';

        return (
            <div className="relative h-24 w-full group">
                <div
                    className="absolute inset-0 bg-[#fefcea] border border-[#d4d09b] flex flex-col p-1 shadow-sm"
                    style={{ clipPath: direction === 'right' ? clipRight : clipLeft }}
                >
                    <div className={`text-[10px] uppercase text-slate-600 font-bold leading-none truncate ${direction === 'left' ? 'pl-4' : 'pr-4'}`}>
                        {title}
                    </div>
                    <div className={`text-sm font-bold text-slate-800 leading-tight ${direction === 'left' ? 'pl-4' : ''}`}>
                        {displayValue}
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-[1px] mt-1 pb-1 px-2">
                        {data.map((v: number, i: number) => (
                            <div key={i} style={{ height: `${v}%` }} className="w-full bg-[#82bd48] opacity-90 rounded-t-[1px]" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // 2. Process Widget (Blue rounded)
    const ProcessWidget = ({ title, value, idle, busy }: any) => (
        <div className="bg-[#dce6f2] border border-[#9cb2cf] rounded-xl p-2 h-26 flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold text-center text-[#2e4c75] leading-tight">{title}</div>
            <div className="text-lg font-bold text-[#2e4c75]">{value}</div>
            <div className="w-full space-y-1">
                {busy !== undefined && (
                    <div className="flex justify-between text-[9px] text-[#2e4c75] px-1">
                        <span>{busy} busy</span>
                        <span>{idle} idle</span>
                    </div>
                )}
                <div className="h-8 bg-white/50 w-full rounded-sm relative overflow-hidden flex items-end">
                    <div className="w-full h-full bg-gradient-to-t from-[lime] to-[green] opacity-80" style={{ height: '40%' }}></div>
                </div>
            </div>
        </div>
    )

    const TablespaceGrid = () => (
        <div className="bg-[#f2e6d9] border border-[#c4a98b] rounded-md p-1 h-40 flex flex-col">
            <div className="text-center font-bold text-[#8b4513] text-xs border-b border-[#c4a98b]/30 pb-1 mb-1">
                {connection.name}
            </div>
            <div className="text-[10px] mb-1 px-1">
                {tablespaces.length} Tablespaces. Total {tablespaces.reduce((acc, ts) => acc + ts.total_mb, 0).toFixed(0)} MB.
            </div>
            <div className="flex-1 overflow-auto bg-white border border-[#c4a98b]/30">
                <table className="w-full text-[9px]">
                    <thead className="bg-[#e6dccf] sticky top-0">
                        <tr>
                            <th className="text-left px-1">TS Name</th>
                            <th className="text-right px-1">Total MB</th>
                            <th className="text-right px-1">Used MB</th>
                            <th className="text-right px-1">Used%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tablespaces.map((ts, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="px-1">{ts.tablespace_name}</td>
                                <td className="px-1 text-right">{ts.total_mb.toLocaleString()}</td>
                                <td className="px-1 text-right">{ts.used_mb.toLocaleString()}</td>
                                <td className="px-1 text-right">
                                    <div className="relative w-full h-3 bg-gray-200">
                                        <div className={twMerge(
                                            "absolute top-0 left-0 h-full",
                                            ts.used_pct > 90 ? "bg-red-500" : ts.used_pct > 80 ? "bg-amber-500" : "bg-[lime]"
                                        )} style={{ width: `${Math.min(ts.used_pct, 100)}%` }}></div>
                                        <span className="absolute inset-0 flex items-center justify-end pr-1 text-[8px] font-bold">{ts.used_pct}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const TransactionsPanel = () => (
        <div className="bg-[#e6e6e6] border border-slate-400 rounded-sm p-1 h-32 flex flex-col">
            <div className="text-[10px] font-bold border-b border-slate-300 mb-1">Transactions & Rollback info</div>
            <div className="flex-1 overflow-auto bg-white border border-slate-300">
                <table className="w-full text-[9px]">
                    <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="text-left px-1">SID</th>
                            <th className="text-left px-1">USERNAME</th>
                            <th className="text-left px-1">UBLK</th>
                            <th className="text-left px-1">Start Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { sid: '347', user: 'S2302912', ublk: '0', time: '08:21:04' },
                            { sid: '1761', user: 'L2024110', ublk: '0', time: '15:32:46' },
                            { sid: '835', user: 'L0137502', ublk: '1', time: '21:53:53' },
                        ].map((tx, i) => (
                            <tr key={i} className="border-b border-slate-50">
                                <td className="px-1">{tx.sid}</td>
                                <td className="px-1">{tx.user}</td>
                                <td className="px-1">{tx.ublk}</td>
                                <td className="px-1">{tx.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-1 flex-1 overflow-auto bg-white border border-slate-300">
                <table className="w-full text-[9px]">
                    <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="text-left px-1">TS Name</th>
                            <th className="text-right px-1">Size,M</th>
                            <th className="text-right px-1">Used,M</th>
                            <th className="text-right px-1">Used,%</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-1">UNDOTBS1</td>
                            <td className="px-1 text-right">32,768</td>
                            <td className="px-1 text-right">0</td>
                            <td className="px-1 text-right">
                                <div className="relative w-12 h-3 bg-gray-200 ml-auto">
                                    <div className="absolute top-0 left-0 h-full bg-[lime]" style={{ width: `0.0%` }}></div>
                                    <span className="absolute inset-0 flex items-center justify-end pr-1 text-[8px]">0.0</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )

    const TempTablespacePanel = () => (
        <div className="bg-[#e6e6e6] border border-slate-400 rounded-sm p-1 h-24 flex flex-col">
            <div className="text-[10px] font-bold border-b border-slate-300 mb-1">Temporary Tablespaces info</div>
            <div className="flex-1 overflow-auto bg-white border border-slate-300">
                <table className="w-full text-[9px]">
                    <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="text-left px-1">TS Name</th>
                            <th className="text-right px-1">MaxSize</th>
                            <th className="text-right px-1">Used,M</th>
                            <th className="text-right px-1">Used,%</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-1">TEMP</td>
                            <td className="px-1 text-right">32,768</td>
                            <td className="px-1 text-right">150</td>
                            <td className="px-1 text-right">
                                <div className="relative w-full h-3 bg-gray-200">
                                    <div className="absolute top-0 left-0 h-full bg-[lime]" style={{ width: `0.5%` }}></div>
                                    <span className="absolute inset-0 flex items-center justify-end pr-1 text-[8px]">0.5</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )



    const SgaPanel = ({ title, primary, secondary, tertiary, data, color = "bg-green-500", onClick, selected }: any) => (
        <div
            onClick={onClick}
            className={twMerge(
                "bg-blue-300/20 border rounded-sm p-1 flex flex-col gap-1 shadow-sm relative overflow-hidden h-full cursor-pointer transition-colors hover:bg-blue-300/30",
                selected ? "border-blue-600 ring-1 ring-blue-600" : "border-blue-400"
            )}
        >
            {/* Header Area */}
            <div className="bg-blue-400/30 p-1 text-xs font-bold text-blue-900 border-b border-blue-400/20 leading-tight">
                {title}
            </div>

            {/* Stats Area */}
            <div className="px-1 text-[10px] font-mono leading-tight space-y-0.5">
                <div className="font-bold">{primary}</div>
                {secondary && <div>{secondary}</div>}
                {tertiary && <div>{tertiary}</div>}
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-[40px] flex items-end justify-between px-1 gap-[1px] pt-1">
                {data.map((v: number, i: number) => (
                    <div
                        key={i}
                        style={{ height: `${v}%` }}
                        className={`w-full ${color} opacity-80 rounded-t-[1px]`}
                    />
                ))}
            </div>
            {/* Y-Axis Label Mock */}
            <div className="absolute right-0.5 top-8 text-[8px] text-muted-foreground">
                100
            </div>
            <div className="absolute left-0.5 bottom-0.5 text-[8px] text-muted-foreground">
                0
            </div>
        </div>
    )

    // 4. Custom SGA Pools Panel
    const SgaPoolsPanel = ({ onClick, selected }: any) => (
        <div
            onClick={onClick}
            className={twMerge(
                "bg-blue-300/20 border rounded-sm p-1 flex flex-col gap-0.5 shadow-sm relative overflow-hidden h-full cursor-pointer transition-colors hover:bg-blue-300/30",
                selected ? "border-blue-600 ring-1 ring-blue-600" : "border-blue-400"
            )}
        >
            {/* Top Row: Values */}
            <div className="flex justify-between items-end px-1 pt-1 text-[10px] leading-none">
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 mb-0.5">Pools</span>
                    <span>{getDeterministicValue(854, 10, sliderValue) / 100} GB</span>
                </div>
                <div className="text-center">{getDeterministicValue(28, 5, sliderValue).toFixed(1)} MB</div>
                <div className="text-right">{getDeterministicValue(64, 5, sliderValue).toFixed(1)} MB</div>
            </div>

            {/* Middle Row: Labels */}
            <div className="flex justify-between items-center px-1 text-[10px] font-bold text-slate-700 leading-none mt-1">
                <span>Shared</span>
                <span>Large</span>
                <span>Streams</span>
            </div>

            {/* Usage Row */}
            <div className="flex justify-between items-center px-1 text-[10px] leading-none mb-1">
                <span>89.5%</span>
                <span>0%</span>
                <span>0.02%</span>
            </div>

            {/* Charts Row */}
            <div className="flex-1 flex gap-2 px-1 pb-1 items-end">
                {/* Shared */}
                <div className="flex-1 bg-[#d4d4d4] h-full relative border border-slate-300">
                    <div className="absolute bottom-0 w-full bg-[lime] border-t border-slate-400" style={{ height: '89.5%' }}></div>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400/50"></div>
                </div>
                {/* Large */}
                <div className="flex-1 bg-[#d4d4d4] h-full relative border border-slate-300">
                    <div className="absolute bottom-0 w-full bg-[lime] border-t border-slate-400" style={{ height: '0%' }}></div>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400/50"></div>
                </div>
                {/* Streams */}
                <div className="flex-1 bg-[#d4d4d4] h-full relative border border-slate-300">
                    <div className="absolute bottom-0 w-full bg-[lime] border-t border-slate-400" style={{ height: '1%' }}></div>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400/50"></div>
                </div>
            </div>
        </div>
    )

    return (
        <MainLayout>
            <div className="p-4 space-y-4 overflow-hidden h-full flex flex-col bg-[#e0e4e8]"> {/* Windows-ish gray background */}
                <div className="flex items-center justify-between shrink-0 bg-white p-2 border border-slate-300 shadow-sm rounded-sm">
                    <h1 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        {connection.name}
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === "overview" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === "sga" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setActiveTab("sga")}
                        >
                            SGA
                        </Button>
                        <Button
                            variant={activeTab === "timemachine" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setActiveTab("timemachine")}
                        >
                            Time Machine
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-2 ml-2"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={twMerge("size-4", isRefreshing && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {activeTab === "timemachine" && (
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        {/* Main Grid */}
                        <div className="flex-1 overflow-auto grid grid-cols-12 gap-2 pb-12">

                            {/* Col 1: Network/CPU */}
                            <div className="col-span-2 flex flex-col gap-2">
                                <ArrowWidget title="SQLNet 221 KB/s" baseValue={2000000} data={mockChartData(20)} />
                                <div className="border border-slate-400 bg-white p-1 h-32 flex flex-col relative shadow-sm">
                                    <div className="absolute top-1 left-1 bg-purple-200 text-xs px-1 border border-purple-300">Users</div>
                                    <div className="text-center mt-6 text-2xl font-bold underline text-blue-800">{getDeterministicValue(748, 50, sliderValue)} ({getDeterministicValue(1121, 10, sliderValue)})</div>
                                    <div className="flex-1 flex items-end px-1 gap-[1px]">
                                        {mockChartData(15).map((v, i) => <div key={i} style={{ height: `${v}%` }} className="w-full bg-[lime] opacity-80" />)}
                                    </div>
                                    <div className="text-center text-xs text-blue-800 font-bold">Active: {getDeterministicValue(0, 5, sliderValue)} ({getDeterministicValue(65, 10, sliderValue)})</div>
                                </div>
                                <ArrowWidget title="SQLNet 243 KB/s" baseValue={243000} suffix=" KB/s" data={mockChartData(20)} />


                                <div className="border border-slate-400 bg-[#e6e6e6] p-1 shadow-sm">
                                    <div className="text-[10px]">User Commits</div>
                                    <div className="text-right font-bold">4.20 /s</div>
                                    <div className="h-10 flex items-end gap-[1px] mt-1 bg-white border border-gray-300">
                                        {mockChartData(15).map((v, i) => <div key={i} style={{ height: `${v}%` }} className="w-full bg-[lime]" />)}
                                    </div>
                                </div>
                                <div className="border border-slate-400 bg-[#e6e6e6] p-1 shadow-sm">
                                    <div className="text-[10px]">CPU Sys+User</div>
                                    <div className="text-[9px]">CPU Sys: 0.96%</div>
                                    <div className="text-[9px]">User: 4.70%</div>
                                    <div className="h-10 flex items-end gap-[1px] mt-1 bg-white border border-gray-300">
                                        {mockChartData(15).map((v, i) => <div key={i} style={{ height: `${v}%` }} className="w-full bg-[lime]" />)}
                                    </div>
                                </div>
                            </div>

                            {/* Col 2: Processes */}
                            <div className="col-span-2 flex flex-col gap-2 items-center">
                                <ProcessWidget title="Dedicated Servers" value="748 (1121)" />
                                <ProcessWidget title="PQ Servers" value="0 (0) busy" idle="1 (1)" />
                                <ProcessWidget title="MTS" value="0 (0) busy" idle="1 (1)" />
                                <ProcessWidget title="Dispatchers" value="0 (0) busy" idle="1 (1)" />
                                <ProcessWidget title="Jobs" value="0 (6) busy" idle="34 (34) broken" />
                            </div>

                            {/* Col 3: Throughput */}
                            <div className="col-span-2 flex flex-col gap-2">
                                <ArrowWidget title="Logical Reads" baseValue={15323} suffix=" blks/s" data={mockChartData(20)} />
                                <ArrowWidget title="DB Block Changes" baseValue={209} suffix=" chgs/s" data={mockChartData(20)} />
                                <ArrowWidget title="Redo Entries" baseValue={50} suffix=" ent/s" data={mockChartData(20)} />
                                <ArrowWidget title="Temp Reads" baseValue={12} suffix=" blks/s" data={mockChartData(20)} />
                                <ArrowWidget title="SQL Executions" baseValue={1655} suffix=" exec/s" data={mockChartData(20)} />
                                <ArrowWidget title="Redo Write" baseValue={25} suffix=" KB/s" data={mockChartData(20)} />
                            </div>

                            {/* Col 4: SGA Reuse */}
                            <div className="col-span-3">
                                <div className="flex flex-col gap-1 h-full min-h-[600px] border-blue-200 pl-2 pr-2 py-2 bg-blue-50/50 rounded-xl relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e0e4e8] px-2 text-blue-300 font-extrabold text-xl tracking-widest z-10 uppercase">SGA</div>

                                    <div className="h-28"><SgaPanel title="Block Buffers: 6.31 GB" primary="0% Keep, 0% Recycle" secondary="Avg Buffer Ratio: 99.5%" tertiary="Curr Buf Hit Ratio: 100%" data={mockChartData(20)} color="bg-[lime]" /></div>
                                    <div className="h-24"><SgaPanel title="Buffer Busy Wait 0%" primary="Limit: 5" data={[0, 0, 0, 0, 1]} color="bg-amber-600" /></div>
                                    <div className="h-24"><SgaPanel title="Free Buffer Wait 0%" primary="Limit: 5" data={[0, 0, 0]} color="bg-[lime]" /></div>
                                    <div className="h-32"><SgaPoolsPanel onClick={() => setActiveTab("sga")} /></div>
                                    <div className="h-24"><SgaPanel title="LibCache Miss Ratio: 0.00%" primary="Limit: 5" data={[0, 1]} color="bg-red-500" /></div>
                                    <div className="h-24 top-2"><SgaPanel title="Redo Log Buffer 128 MB" primary="Log Sync Wait: 1.21%" secondary="Limit: 100" data={[10, 20]} color="bg-amber-600" /></div>
                                </div>
                            </div>

                            {/* Col 5: Storage */}
                            <div className="col-span-3 flex flex-col gap-2">
                                <ArrowWidget title="Direct Phys Reads" baseValue={1.76} suffix=" blocks/s" data={mockChartData(10)} direction="left" />
                                <ArrowWidget title="Phys Reads" baseValue={0.39} suffix=" blocks/s" data={mockChartData(10)} direction="left" />

                                <TablespaceGrid />
                                <TransactionsPanel />
                                <TempTablespacePanel />

                                <div className="h-32 bg-[#e6e6e6] border border-slate-400 p-1 flex flex-col">
                                    <div className="text-[10px] font-bold">REDO LOG FILES: 4 x 400 MB</div>
                                    <div className="text-[10px]">Current seq# {getDeterministicValue(36369, 100, sliderValue)}</div>

                                    <div className="flex-1 flex gap-2 mt-1">
                                        {/* Switch Rate Chart */}
                                        <div className="flex-1 flex flex-col justify-end border border-gray-300 bg-white p-0.5">
                                            <div className="flex-1 flex items-end justify-between gap-[2px]">
                                                {mockChartData(10).map((v, i) => (
                                                    <div key={i} className="w-full bg-[lime]" style={{ height: `${v * 1.5}%` }}></div>
                                                ))}
                                            </div>
                                            <div className="text-[9px] text-center border-t border-gray-200 mt-0.5">Switch Rate {getDeterministicValue(0, 2, sliderValue).toFixed(0)}/hour</div>
                                        </div>

                                        {/* Not Archived Gauge */}
                                        <div className="flex-1 bg-white border border-gray-400 relative p-1 flex flex-col">
                                            <div className="text-[9px] w-full text-center font-bold mb-1">{getDeterministicValue(0, 40, sliderValue).toFixed(0)}% Not Archived</div>
                                            <div className="flex-1 bg-gray-100 relative">
                                                <div className="absolute bottom-0 w-full bg-amber-500 transition-all duration-300" style={{ height: `${getDeterministicValue(0, 40, sliderValue)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Time Scrubber Footer */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-800 text-white flex items-center px-4 gap-4 shadow-lg z-20">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-slate-700" onClick={() => setSliderValue(prev => prev - 15000)}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-slate-700" onClick={() => setSliderValue(prev => prev + 15000)}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                            <div className="font-mono text-sm bg-black px-2 py-0.5 rounded text-[lime] min-w-[200px] text-center">
                                {historyTime.toLocaleString()}
                            </div>
                            <input
                                type="range"
                                min={Date.now() - 3600000}
                                max={Date.now()}
                                step={15000}
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-[lime]"
                            />
                            <div className="text-xs text-slate-400">Live Replay</div>
                        </div>
                    </div>
                )}

                {activeTab === "overview" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {summaryCards.map((card) => (
                                <Card key={card.title} className={twMerge("cursor-pointer hover:bg-slate-50 transition-colors", card.onClick && "border-blue-200")} onClick={() => card.onClick?.()}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {card.title}
                                        </CardTitle>
                                        <card.icon className={twMerge("h-4 w-4", card.urgent ? 'text-red-500' : 'text-muted-foreground')} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{card.value}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {card.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <SystemHealthCharts health={metrics?.health} />

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Activity</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(val) => setSchemaFilter(val === 'ALL' ? '' : val)}>
                                            <SelectTrigger className="h-8 w-32 text-xs bg-muted/50">
                                                <SelectValue placeholder="Schema" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">ALL</SelectItem>
                                                {metrics?.active_schemas?.map((s: string) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="text"
                                            placeholder="Filter activity..."
                                            className="text-xs px-2 py-1 border rounded bg-muted/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setActivityFilter(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground min-h-[200px]">
                                        {metrics?.top_queries?.filter((q: any) =>
                                            (!activityFilter || q.sql_text?.toLowerCase().includes(activityFilter.toLowerCase()) || q.sql_id?.toLowerCase().includes(activityFilter.toLowerCase())) &&
                                            (!schemaFilter || q.owner?.toLowerCase().includes(schemaFilter.toLowerCase()))
                                        ).map((query: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-slate-50 px-2 cursor-pointer group rounded" onClick={() => navigate(`/sql-central/sql_details?sql_id=${query.sql_id}`)}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-1 rounded">{query.sql_id}</span>
                                                        <div className="font-mono text-xs text-blue-600 truncate">{query.sql_text || query.sql_snippet}</div>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        {query.owner} • {query.executions} executions
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-slate-700 ml-4 group-hover:text-blue-600">
                                                    {(query.cpu_s || query.elapsed_s || 0).toFixed(2)}s
                                                </div>
                                            </div>
                                        )) || (
                                                <div className="text-center py-10">No recent activity matching filter.</div>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="col-span-3">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Top Wait Events</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(val) => setSchemaFilter(val === 'ALL' ? '' : val)}>
                                            <SelectTrigger className="h-8 w-32 text-xs bg-muted/50">
                                                <SelectValue placeholder="Schema" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">ALL</SelectItem>
                                                {metrics?.active_schemas?.map((s: string) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="text"
                                            placeholder="Filter events..."
                                            className="text-xs px-2 py-1 border rounded bg-muted/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setWaitFilter(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground min-h-[200px]">
                                        {metrics?.wait_events?.filter((e: any) =>
                                            (!waitFilter || e.event?.toLowerCase().includes(waitFilter.toLowerCase())) &&
                                            (!schemaFilter || e.owner?.toLowerCase().includes(schemaFilter.toLowerCase()))
                                        ).map((event: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-slate-50 px-2 rounded">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-xs text-slate-800 truncate">{event.event}</div>
                                                    <div className="text-[10px] text-muted-foreground">{event.owner} • {event.wait_class}</div>
                                                </div>
                                                <div className="text-xs font-bold text-amber-600 ml-4">
                                                    {event.time_waited_s || 0}s
                                                </div>
                                            </div>
                                        )) || (
                                                <div className="text-center py-10">No wait events matching filter.</div>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "sga" && (
                    <div className="flex-1 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                        {/* Left Column: SGA Panels */}
                        <div className="w-80 flex flex-col gap-1 overflow-y-auto border-r border-slate-300 pr-4 shrink-0">
                            <h2 className="text-center font-bold text-blue-400/50 text-xl tracking-widest uppercase mb-2">SGA</h2>

                            <div className="h-28 shrink-0">
                                <SgaPanel
                                    title="Block Buffers: 6.31 GB"
                                    primary="0% Keep, 0% Recycle"
                                    secondary="Avg Buffer Ratio: 99.6%"
                                    tertiary="Curr Buf Hit Ratio: 99.9%"
                                    data={mockChartData(20)}
                                    color="bg-green-500"
                                    onClick={() => setSelectedSga('buffer_cache')}
                                    selected={selectedSga === 'buffer_cache'}
                                />
                            </div>

                            <div className="h-24 shrink-0">
                                <SgaPanel
                                    title="Buffer Busy Wait 0.02%"
                                    primary="Limit: 5"
                                    data={[0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 5, 0, 0, 0, 0]}
                                    color="bg-amber-600"
                                    onClick={() => setSelectedSga('buffer_busy')}
                                    selected={selectedSga === 'buffer_busy'}
                                />
                            </div>

                            <div className="h-24 shrink-0">
                                <SgaPanel
                                    title="Free Buffer Wait 0%"
                                    primary="Limit: 5"
                                    data={[0, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
                                    color="bg-green-500"
                                    onClick={() => setSelectedSga('free_buffer')}
                                    selected={selectedSga === 'free_buffer'}
                                />
                            </div>

                            <div className="h-32 shrink-0">
                                <SgaPanel
                                    title="Pools 8.44 GB"
                                    primary="Shared: 89.4%, Large: 0%"
                                    secondary="Streams: 0.02%, Java: 0%"
                                    tertiary="28.2 MB / 64.0 MB"
                                    data={[80, 80, 85, 80, 80, 5]}
                                    color="bg-green-500"
                                    onClick={() => setSelectedSga('pools')}
                                    selected={selectedSga === 'pools'}
                                />
                            </div>

                            <div className="h-24 shrink-0">
                                <SgaPanel
                                    title="LibCache Miss Ratio: 0.01%"
                                    primary="Limit: 5"
                                    data={[10, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0]}
                                    color="bg-red-500"
                                    onClick={() => setSelectedSga('libcache')}
                                    selected={selectedSga === 'libcache'}
                                />
                            </div>

                            <div className="h-24 shrink-0">
                                <SgaPanel
                                    title="Redo Log Buffer 128 MB"
                                    primary="Log Sync Wait: 723%"
                                    secondary="Limit: 5000"
                                    data={[10, 50, 20, 10, 80, 30, 10, 10, 20, 50]}
                                    color="bg-amber-600"
                                    onClick={() => setSelectedSga('redo_log')}
                                    selected={selectedSga === 'redo_log'}
                                />
                            </div>
                        </div>

                        {/* Right Column: Detail Panel */}
                        <div className="flex-1 bg-white border border-blue-200 rounded-md shadow-sm p-4 overflow-hidden flex flex-col">
                            <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight flex items-center gap-2 border-b pb-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                {selectedSga === 'buffer_cache' && "Top Segments in Buffer Cache"}
                                {selectedSga === 'pools' && "Top Consumers in Shared Pool"}
                                {selectedSga === 'redo_log' && "Redo Generation by Session"}
                                {(!selectedSga || (selectedSga !== 'buffer_cache' && selectedSga !== 'pools' && selectedSga !== 'redo_log')) && "Area Details"}
                            </h3>

                            {(!selectedSga || (selectedSga !== 'buffer_cache' && selectedSga !== 'pools' && selectedSga !== 'redo_log')) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-3">
                                    <Database className="h-12 w-12" />
                                    <p className="text-sm font-medium">Select an area on the left to view metrics</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-auto border rounded-sm">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 border-b sticky top-0">
                                            <tr>
                                                {selectedSga === 'buffer_cache' && <>
                                                    <th className="p-2">Owner</th>
                                                    <th className="p-2">Object Name</th>
                                                    <th className="p-2">Type</th>
                                                    <th className="p-2 text-right">Blocks</th>
                                                    <th className="p-2 text-right">% of Cache</th>
                                                </>}
                                                {selectedSga === 'pools' && <>
                                                    <th className="p-2">Namespace</th>
                                                    <th className="p-2">Count</th>
                                                    <th className="p-2 text-right">Size (MB)</th>
                                                    <th className="p-2 text-right">Avg Size (KB)</th>
                                                </>}
                                                {selectedSga === 'redo_log' && <>
                                                    <th className="p-2">SID</th>
                                                    <th className="p-2">User</th>
                                                    <th className="p-2">Program</th>
                                                    <th className="p-2 text-right">Redo Size (KB)</th>
                                                </>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSga === 'buffer_cache' && [
                                                { o: 'SYS', n: 'I_OBJ1', t: 'INDEX', b: '15,200', p: '2.5%' },
                                                { o: 'SCOTT', n: 'BIG_TABLE', t: 'TABLE', b: '12,500', p: '2.1%' },
                                                { o: 'SH', n: 'SALES', t: 'TABLE PARTITION', b: '8,400', p: '1.4%' },
                                                { o: 'SYS', n: 'C_OBJ#', t: 'CLUSTER', b: '5,000', p: '0.9%' },
                                            ].map((r, i) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-2">{r.o}</td><td className="p-2 font-medium">{r.n}</td><td className="p-2">{r.t}</td><td className="p-2 text-right">{r.b}</td><td className="p-2 text-right">{r.p}</td>
                                                </tr>
                                            ))}
                                            {selectedSga === 'pools' && [
                                                { n: 'SQL AREA', c: '4,521', s: '450.2', a: '102' },
                                                { n: 'PCURSOR', c: '8,200', s: '120.5', a: '15' },
                                                { n: 'CCURSOR', c: '12,000', s: '80.0', a: '7' },
                                                { n: 'KGLS', c: '500', s: '25.0', a: '50' },
                                            ].map((r, i) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-2 font-medium">{r.n}</td><td className="p-2">{r.c}</td><td className="p-2 text-right">{r.s}</td><td className="p-2 text-right">{r.a}</td>
                                                </tr>
                                            ))}
                                            {selectedSga === 'redo_log' && [
                                                { s: '125', u: 'DBSNMP', p: 'emagent', r: '15,023' },
                                                { s: '48', u: 'APP_USER', p: 'JDBC Thin Client', r: '8,200' },
                                                { s: '190', u: 'LGWR', p: 'oracle@db', r: '0' },
                                            ].map((r, i) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-2">{r.s}</td><td className="p-2">{r.u}</td><td className="p-2">{r.p}</td><td className="p-2 text-right">{r.r}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

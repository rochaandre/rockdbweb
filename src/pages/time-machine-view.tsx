import { useState, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/context/app-context'

// Re-importing or replicating the specialized widgets from DashboardView since they are visually distinct
// In a real refactor, these would be in @/components/shared/performance-widgets.tsx

const ArrowWidget = ({ title, value, data, direction = 'right' }: any) => {
    const clipRight = 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)';
    const clipLeft = 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)';

    return (
        <div className="relative h-20 w-full group">
            <div
                className="absolute inset-0 bg-[#fefcea] border border-[#d4d09b] flex flex-col p-1 shadow-sm"
                style={{ clipPath: direction === 'right' ? clipRight : clipLeft }}
            >
                <div className={`text-[10px] uppercase text-slate-600 font-bold leading-none truncate ${direction === 'left' ? 'pl-4' : 'pr-4'}`}>
                    {title}
                </div>
                <div className={`text-sm font-bold text-slate-800 leading-tight ${direction === 'left' ? 'pl-4' : ''}`}>
                    {value}
                </div>
                <div className="flex-1 flex items-end justify-between gap-[1px] mt-1 pb-1 px-2">
                    {data.map((v: number, i: number) => (
                        <div key={i} style={{ height: `${Math.min(v, 100)}%` }} className="w-full bg-[#82bd48] opacity-90 rounded-t-[1px]" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function TimeMachineView() {
    const [sliderValue, setSliderValue] = useState(Date.now())
    const [history, setHistory] = useState<any[]>([])
    const [snapshot, setSnapshot] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Fetch history for the timeline range (last 1 hour)
    const fetchHistory = async () => {
        const end = new Date().toISOString()
        const start = new Date(Date.now() - 3600000).toISOString()
        try {
            const res = await fetch(`${API_URL}/timemachine/history?start=${start}&end=${end}`)
            if (res.ok) setHistory(await res.json())
        } catch (e) {
            console.error("Error fetching history:", e)
        }
    }

    // Fetch specific snapshot when slider changes
    const fetchSnapshot = async (time: number) => {
        setIsLoading(true)
        try {
            const iso = new Date(time).toISOString()
            const res = await fetch(`${API_URL}/timemachine/snapshot?target=${iso}`)
            if (res.ok) {
                setSnapshot(await res.json())
            } else {
                setSnapshot(null)
            }
        } catch (e) {
            console.error("Error fetching snapshot:", e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
        // Initial snapshot
        fetchSnapshot(sliderValue)

        const hInterval = setInterval(fetchHistory, 60000)
        return () => clearInterval(hInterval)
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSnapshot(sliderValue)
        }, 300) // Debounce slider changes
        return () => clearTimeout(timeout)
    }, [sliderValue])

    const historyTime = new Date(sliderValue)

    return (
        <MainLayout>
            <div className="p-4 space-y-4 h-full flex flex-col bg-[#e0e4e8] overflow-hidden">
                <div className="flex items-center justify-between shrink-0 bg-white p-2 border border-slate-300 shadow-sm rounded-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-800 rounded text-white"><Clock className="size-5" /></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">Time Machine</h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Historical Performance Analysis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-mono font-bold text-blue-700">{historyTime.toLocaleString()}</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-tighter">InfluxDB Storage Mode</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { fetchHistory(); fetchSnapshot(sliderValue); }}>
                            <RefreshCw className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex gap-4 min-h-0 relative">
                    {/* Left Column: Sessions List from Snapshot */}
                    <div className="w-1/2 flex flex-col bg-white border border-slate-300 shadow-sm rounded-sm overflow-hidden">
                        <div className="bg-slate-50 p-2 border-b flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold uppercase text-slate-600 flex items-center gap-2">
                                <Activity className="size-4" />
                                Snapshot Sessions ({snapshot?.sessions?.length || 0})
                            </span>
                            {isLoading && <div className="size-3 border-2 border-primary border-t-transparent animate-spin rounded-full" />}
                        </div>
                        <div className="flex-1 overflow-auto">
                            {!snapshot ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-8 text-center">
                                    <Clock className="size-12 opacity-10" />
                                    <p className="text-sm">No historical data found for this timestamp in InfluxDB.</p>
                                    <p className="text-[10px]">Ensure the background collection worker is running.</p>
                                </div>
                            ) : (
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-2 border-b text-[10px] font-bold">SID</th>
                                            <th className="p-2 border-b text-[10px] font-bold">USER</th>
                                            <th className="p-2 border-b text-[10px] font-bold">STATUS</th>
                                            <th className="p-2 border-b text-[10px] font-bold">EVENT</th>
                                            <th className="p-2 border-b text-[10px] font-bold">SQL_ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {snapshot.sessions.map((s: any, i: number) => (
                                            <tr key={i} className={twMerge("border-b hover:bg-slate-50 transition-colors", s.status === 'ACTIVE' ? "bg-amber-50/30" : "")}>
                                                <td className="p-2 font-mono">{s.sid}</td>
                                                <td className="p-2">{s.username || 'SYS'}</td>
                                                <td className="p-2">
                                                    <span className={twMerge(
                                                        "text-[9px] px-1 rounded-full font-bold uppercase",
                                                        s.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 truncate max-w-[150px]" title={s.event}>{s.event}</td>
                                                <td className="p-2 font-mono text-blue-600">{s.sql_id || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Performance Widgets & Long Ops */}
                    <div className="w-1/2 flex flex-col gap-4 overflow-auto pb-12">
                        {/* High Level Metrics Arrow Row */}
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            <ArrowWidget
                                title="Logical Reads"
                                value={`${(snapshot?.sessions?.length * 10 || 0).toLocaleString()} blks/s`}
                                data={history.map(h => h.active_sessions * 2)}
                            />
                            <ArrowWidget
                                title="Active Sessions"
                                value={snapshot?.sessions?.filter((s: any) => s.status === 'ACTIVE').length || 0}
                                data={history.map(h => h.active_sessions)}
                            />
                        </div>

                        {/* Long Operations List */}
                        <Card className="rounded-sm border-slate-300 shadow-sm">
                            <CardHeader className="p-3 bg-slate-50 border-b">
                                <CardTitle className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
                                    <Layers className="size-4" />
                                    Long Operations Snapshot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-60 overflow-auto">
                                {!snapshot || snapshot.long_ops.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-muted-foreground italic">
                                        No active long operations during this interval.
                                    </div>
                                ) : (
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="p-2 border-b">Opname</th>
                                                <th className="p-2 border-b">Progress</th>
                                                <th className="p-2 border-b text-right">Elapsed</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {snapshot.long_ops.map((lo: any, i: number) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    <td className="p-2">{lo.opname}</td>
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2 w-full">
                                                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
                                                                <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${lo.sofar / lo.totalwork * 100}%` }} />
                                                            </div>
                                                            <span className="text-[9px] font-bold">{(lo.sofar / lo.totalwork * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-right font-mono">{lo.elapsed_seconds}s</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Wait Event Distribution Card (Visual Mock for Snapshot) */}
                        <Card className="rounded-sm border-slate-300 shadow-sm h-64 flex flex-col">
                            <CardHeader className="p-3 bg-slate-50 border-b">
                                <CardTitle className="text-xs uppercase font-bold text-slate-600">Wait Event Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col justify-center gap-4">
                                {['CPU', 'User I/O', 'Concurrency', 'Network', 'Other'].map((event, i) => {
                                    const val = Math.floor(Math.sin((sliderValue / 1000) + i) * 50) + 50;
                                    return (
                                        <div key={event} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold px-1">
                                                <span>{event}</span>
                                                <span className="text-slate-400">{val} ms</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={twMerge(
                                                        "h-full transition-all duration-500",
                                                        event === 'CPU' ? 'bg-green-500' :
                                                            event === 'User I/O' ? 'bg-blue-500' :
                                                                event === 'Concurrency' ? 'bg-red-400' : 'bg-slate-400'
                                                    )}
                                                    style={{ width: `${val}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- TIME TRAVEL CONTROLS --- */}
                <div className="bg-slate-800 text-white rounded-md p-3 pb-4 shadow-xl border border-slate-700 relative z-50 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent border-slate-600 text-white hover:bg-slate-700"
                                onClick={() => setSliderValue(prev => prev - 10000)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent border-slate-600 text-white hover:bg-slate-700"
                                onClick={() => setSliderValue(prev => prev + 10000)}
                                disabled={sliderValue >= Date.now()}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Slider (10s Intervals)</span>
                                <span className="text-xs font-mono text-[lime] bg-black/50 px-2 py-0.5 rounded border border-slate-700 shadow-inner">
                                    {historyTime.toLocaleTimeString()}
                                    <span className="text-[10px] opacity-60 ml-2">{historyTime.toLocaleDateString()}</span>
                                </span>
                            </div>
                            <input
                                type="range"
                                min={Date.now() - 3600000} // 1 hour ago
                                max={Date.now()}
                                step={10000} // 10 seconds steps
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[lime] hover:accent-green-400 transition-all shadow-inner"
                            />
                            <div className="flex justify-between text-[8px] text-slate-500 font-bold font-mono">
                                <span>T - 1 HOUR</span>
                                <span>LIVE VIEW</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-700 p-2 rounded flex flex-col items-center justify-center min-w-[80px]">
                            <div className={twMerge("size-2 rounded-full mb-1 shadow-[0_0_5px_lime]", sliderValue >= (Date.now() - 15000) ? "bg-[lime] animate-pulse" : "bg-red-500 shadow-red-500")} />
                            <span className="text-[9px] font-bold tracking-tighter uppercase">{sliderValue >= (Date.now() - 15000) ? 'Streaming' : 'Playback'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

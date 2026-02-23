/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: long-operations-view.tsx
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 * ==============================================================================
 */
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Clock, Activity,
    Search, Loader2, PlayCircle, Database, RefreshCw,
    Timer, AlertCircle, Zap
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '@/context/app-context'
import { toast } from 'sonner'

export function LongOperationsView() {
    const [operations, setOperations] = useState<any[]>([])
    const [rmanProgress, setRmanProgress] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('longops')

    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true)
        try {
            const sidParam = searchTerm ? encodeURIComponent(searchTerm) : '%';
            const [opsRes, rmanRes] = await Promise.all([
                fetch(`${API_URL}/sessions/longops?sid=${sidParam}`),
                fetch(`${API_URL}/sessions/longops/rman`)
            ])

            if (opsRes.ok) setOperations(await opsRes.json())
            if (rmanRes.ok) setRmanProgress(await rmanRes.json())

            if (isManual) toast.success('Data refreshed')
        } catch (error) {
            console.error('Error fetching long ops:', error)
            if (isManual) toast.error('Failed to refresh data')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [searchTerm])

    useEffect(() => {
        fetchData()
        const interval = setInterval(() => fetchData(false), 3000)
        return () => clearInterval(interval)
    }, [fetchData])

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Long Operations</h1>
                            <Badge variant="outline" className="h-5 px-1.5 gap-1 bg-primary/10 text-primary border-primary/20 animate-pulse">
                                <RefreshCw className="size-2.5 animate-spin" />
                                LIVE
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <Activity className="size-3 text-primary" /> Tracking active database tasks
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full md:w-48 group">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Filter by SID..."
                                className="pl-9 h-9 bg-card border-border focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className="h-9 gap-2 border-border hover:bg-muted"
                        >
                            <RefreshCw className={cn("size-4 text-primary", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                    <div className="border-b border-border flex items-center justify-between shrink-0 h-10">
                        <TabsList className="bg-transparent p-0 h-full gap-6">
                            <TabsTrigger
                                value="longops"
                                className="h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-xs uppercase"
                            >
                                <span className="flex items-center gap-2">
                                    <Clock className="size-3.5" />
                                    Long Operations
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="rman"
                                className="h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-xs uppercase"
                            >
                                <span className="flex items-center gap-2">
                                    <Database className="size-3.5" />
                                    RMAN Progress
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="hidden md:flex items-center gap-4 px-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                <div className="size-2 rounded-full bg-primary" /> General
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                <div className="size-2 rounded-full bg-amber-500" /> RMAN / Backup
                            </div>
                        </div>
                    </div>

                    <TabsContent value="longops" className="flex-1 mt-6 overflow-auto min-h-0 pr-2 custom-scrollbar">
                        {isLoading && operations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="size-10 text-primary animate-spin" />
                                <p className="text-muted-foreground animate-pulse">Analyzing session metrics...</p>
                            </div>
                        ) : operations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card">
                                <PlayCircle className="size-16 text-muted-foreground/20 mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">No active long operations</h3>
                                <p className="text-muted-foreground text-sm">All operations are currently running within regular thresholds.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
                                {operations.map((op, i) => (
                                    <Card key={`${op.sid}-${i}`} className="bg-card border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                                        <Activity className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-none">{op.opname}</h3>
                                                        <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                                                            SID <span className="text-primary font-bold">{op.sid}</span> • Ser# {op['serial#']}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-slate-100 text-slate-700 border-border text-[10px]">
                                                    {op.username || 'SYS'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-muted-foreground uppercase tracking-wider">Operation Progress</span>
                                                        <span className="text-primary font-mono text-sm">{Math.min(op.pct_complete || 0, 100)}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-1000 ease-in-out relative"
                                                            style={{ width: `${Math.min(op.pct_complete || 0, 100)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-muted/50 p-2.5 rounded-lg border border-border/40">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-1">
                                                            <Timer className="size-3 text-primary" /> Elapsed
                                                        </div>
                                                        <div className="font-mono text-sm font-bold text-foreground">{op.elapsed_s || 0}s</div>
                                                    </div>
                                                    <div className="bg-muted/50 p-2.5 rounded-lg border border-border/40">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-1">
                                                            <Clock className="size-3 text-amber-500" /> Remaining
                                                        </div>
                                                        <div className="font-mono text-sm font-bold text-foreground">{op.time_remaining_s || 0}s</div>
                                                    </div>
                                                    <div className="bg-muted/50 p-2.5 rounded-lg border border-border/40">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-1">
                                                            <Zap className="size-3 text-blue-400" /> Work
                                                        </div>
                                                        <div className="font-mono text-sm font-bold text-foreground truncate">{op.sofar || 0} / {op.totalwork || 0}</div>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-muted rounded-md border border-border/50">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <div className="text-xs text-muted-foreground leading-relaxed italic">
                                                            Target: <span className="text-foreground font-medium not-italic">{op.target || 'N/A'}</span>
                                                            <div className="mt-1 line-clamp-1">{op.message}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rman" className="flex-1 mt-6 overflow-auto min-h-0 pr-2 custom-scrollbar">
                        {isLoading && rmanProgress.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="size-10 text-amber-600 animate-spin" />
                                <p className="text-muted-foreground animate-pulse">Fetching RMAN backup state...</p>
                            </div>
                        ) : rmanProgress.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card">
                                <PlayCircle className="size-16 text-muted-foreground/20 mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">No active RMAN backups</h3>
                                <p className="text-muted-foreground text-sm">RMAN processes will appear here during backup or recovery windows.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
                                {rmanProgress.map((op, i) => (
                                    <Card key={`${op.sid}-${i}`} className="bg-card border-border border-l-4 border-l-amber-500 hover:border-amber-400/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                        <Database className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-none">{op.operation || 'RMAN Task'}</h3>
                                                        <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                                                            SID <span className="text-amber-600 font-bold">{op.sid}</span> • Ser# {op['serial#']}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                                                        RMAN
                                                    </Badge>
                                                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">{op.start_time}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-muted-foreground uppercase tracking-wider">Backup Progress</span>
                                                        <span className="text-amber-600 font-mono text-sm">{Math.min(op.pct_complete || 0, 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                                        <div
                                                            className="h-full bg-amber-500 transition-all duration-1000 ease-in-out relative shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                                            style={{ width: `${Math.min(op.pct_complete || 0, 100)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-muted/50 p-2.5 rounded-lg border border-border/40">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-1">
                                                            <Timer className="size-3 text-amber-500" /> Time Elapsed
                                                        </div>
                                                        <div className="font-mono text-sm font-bold text-foreground">
                                                            {Math.floor((op.elapsed_s || 0) / 60)}m {(op.elapsed_s || 0) % 60}s
                                                        </div>
                                                    </div>
                                                    <div className="bg-muted/50 p-2.5 rounded-lg border border-border/40">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-1">
                                                            <Clock className="size-3 text-red-500" /> Time Remaining
                                                        </div>
                                                        <div className="font-mono text-sm font-bold text-foreground">
                                                            {Math.floor((op.time_remaining_s || 0) / 60)}m {(op.time_remaining_s || 0) % 60}s
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-muted rounded-md border border-border/50">
                                                    <div className="text-[11px] font-mono text-muted-foreground break-all leading-tight">
                                                        {op.message || 'Executing RMAN command...'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

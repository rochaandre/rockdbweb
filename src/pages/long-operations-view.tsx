/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: long-operations-view.tsx
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 *
 * TERMS:
 * 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
 * 2. YOU MAY NOT MODIFY, transform, or build upon this code.
 * 3. You must maintain this header and original naming/ownership information.
 *
 * This software is provided "AS IS", without warranty of any kind.
 * Copyright (c) 2026 Andre Rocha. All rights reserved.
 * ==============================================================================
 */
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Clock, Activity, Info, CheckCircle2,
    Search, Loader2, PlayCircle, Database, RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { API_URL } from '@/context/app-context'
import { toast } from 'sonner'

export function LongOperationsView() {
    const navigate = useNavigate()
    const [operations, setOperations] = useState<any[]>([])
    const [stats, setStats] = useState({ active_total: 0, active_detailed: 0, datapump_jobs: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSimulating, setIsSimulating] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchData = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true)
        try {
            const [opsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/sessions/longops`),
                fetch(`${API_URL}/sessions/longops/stats`)
            ])

            if (opsRes.ok) setOperations(await opsRes.json())
            if (statsRes.ok) setStats(await statsRes.json())
            if (isManual) toast.success('Data refreshed')
        } catch (error) {
            console.error('Error fetching long ops:', error)
            if (isManual) toast.error('Failed to refresh data')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 3000)
        return () => clearInterval(interval)
    }, [fetchData])

    const handleSimulate = async () => {
        setIsSimulating(true)
        try {
            const res = await fetch(`${API_URL}/sessions/longops/simulate`, { method: 'POST' })
            if (res.ok) {
                toast.success('Simulation started')
                fetchData()
            }
        } catch (error) {
            toast.error('Failed to start simulation')
        } finally {
            setIsSimulating(false)
        }
    }

    const filteredOps = operations.filter(op =>
        op.opname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.sid.toString().includes(searchTerm)
    )

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Long-Running Operations</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Clock className="size-3" /> Real-time tracking of heavy <code>V$SESSION_LONGOPS</code> tasks
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search operations..."
                                className="pl-9 h-9 bg-muted/50"
                                value={searchTerm}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            className="gap-2 font-bold"
                            onClick={handleSimulate}
                            disabled={isSimulating}
                        >
                            {isSimulating ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
                            Simulate Long Op
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 border-y border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Activity className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">{stats.active_total} Active</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Total LongOps</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                            <CheckCircle2 className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">{stats.active_detailed} Tracked</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Active Sessions</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                            <Database className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">{stats.datapump_jobs} Jobs</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">DataPump Background</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto pr-2 space-y-4 pb-6">
                    {isLoading && operations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading operations...</p>
                        </div>
                    ) : filteredOps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/5 border-2 border-dashed border-border/50 rounded-xl">
                            <Clock className="size-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium">No active long operations found</p>
                            <p className="text-[10px] opacity-70">Monitor V$SESSION_LONGOPS here</p>
                        </div>
                    ) : (
                        filteredOps.map((op, i) => (
                            <Card key={`${op.sid}-${op.serial}-${i}`} className="group hover:border-primary/50 transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="py-4 bg-muted/10 border-b border-border/30">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                                                {op.opname}
                                                <Badge variant="outline" className="text-[10px] font-mono font-normal">SID: {op.sid}</Badge>
                                            </CardTitle>
                                            <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Activity className="size-3" /> Target: <span className="font-bold text-foreground">{op.target}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Time Remaining</span>
                                                <span className="text-sm font-black text-amber-600 font-mono">{op.time_remaining}s</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 pb-4 space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Completion Progress</span>
                                            <span className="text-primary">{op.pct || 0}%</span>
                                        </div>
                                        <div className="relative h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-1000 ease-in-out relative shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                style={{ width: `${op.pct || 0}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/30">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Time</div>
                                            <div className="text-xs font-mono font-bold">{op.start_tim}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Elapsed (Sec)</div>
                                            <div className="text-xs font-mono font-bold">{op.elapsed_seconds}s</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Work Ratio</div>
                                            <div className="text-xs font-mono font-bold text-muted-foreground">{op.sofar} / {op.totalwork}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">SQL ID</div>
                                            <div
                                                className={cn(
                                                    "text-xs font-mono font-bold truncate transition-colors",
                                                    op.sql_id ? "text-blue-500 hover:text-blue-600 cursor-pointer underline underline-offset-2" : "text-muted-foreground"
                                                )}
                                                onClick={() => {
                                                    if (op.sql_id) {
                                                        navigate(`/sql-central/session_longops_replace?SID=${op.sid}&SERIAL=${op.serial}`)
                                                    }
                                                }}
                                            >
                                                {op.sql_id || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-muted/20 rounded-lg flex gap-3 items-start border border-border/30">
                                        <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                                            <Info className="size-3.5" />
                                        </div>
                                        <div className="text-xs font-medium text-muted-foreground leading-relaxed">
                                            {op.message}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

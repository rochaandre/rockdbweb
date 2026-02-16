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
import { Progress } from '@/components/ui/progress'
import { Clock, Activity, Loader2, Info, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const MOCK_OPERATIONS = [
    {
        sid: 124,
        serial: 4521,
        opname: 'Table Scan',
        target: 'SALES_HISTORY',
        sobject_id: 88214,
        percentage: 64,
        start_time: '2026-02-16 14:10:22',
        time_remaining: '00:04:12',
        elapsed_seconds: 452,
        message: 'Table scan: SALES_HISTORY: 4521 of 7021 blocks done'
    },
    {
        sid: 82,
        serial: 1102,
        opname: 'RMAN: Aggregate Output',
        target: 'DATABASE',
        sobject_id: 0,
        percentage: 88,
        start_time: '2026-02-16 13:00:00',
        time_remaining: '00:12:45',
        elapsed_seconds: 3600,
        message: 'RMAN backup: 88% completed'
    }
]

export function LongOperationsView() {
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
                            <Input placeholder="Search operations..." className="pl-9 h-9 bg-muted/50" />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="size-4" /> Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 border-y border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Activity className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">2 Active</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Monitored Tasks</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <CheckCircle2 className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">14 Completed</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Last 24 Hours</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <AlertTriangle className="size-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">0 Stalled</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Performance Alerts</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto pr-2 space-y-4 pb-6">
                    {MOCK_OPERATIONS.map((op, i) => (
                        <Card key={i} className="group hover:border-primary/50 transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="py-4 bg-muted/10 border-b border-border/30">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                                            {op.opname}
                                            <Badge variant="secondary" className="text-[10px] font-bold bg-blue-50 text-blue-600 border-none">SID: {op.sid}</Badge>
                                        </CardTitle>
                                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                            <Activity className="size-3" /> Target: <span className="font-bold text-foreground">{op.target}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Time Remaining</span>
                                            <span className="text-sm font-black text-foreground font-mono">{op.time_remaining}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 pb-4 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Completion Progress</span>
                                        <span className="text-primary">{op.percentage}%</span>
                                    </div>
                                    <div className="relative h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000 ease-in-out relative"
                                            style={{ width: `${op.percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/30">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Time</div>
                                        <div className="text-xs font-mono font-bold">{op.start_time}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Elapsed (Sec)</div>
                                        <div className="text-xs font-mono font-bold">{op.elapsed_seconds}s</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Serial #</div>
                                        <div className="text-xs font-mono font-bold text-muted-foreground">{op.serial}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Object ID</div>
                                        <div className="text-xs font-mono font-bold text-muted-foreground">{op.sobject_id || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="p-3 bg-muted/20 rounded-lg flex gap-3 items-start border border-border/30">
                                    <div className="mt-0.5 p-1 rounded-full bg-blue-50 text-blue-500">
                                        <Info className="size-3.5" />
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground italic leading-relaxed">
                                        {op.message}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}

/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: time-machine-view.tsx
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
import { Clock, History, Calendar, Search, Filter, Database, ArrowRight, Play, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function TimeMachineView() {
    const [selectedDate, setSelectedDate] = useState('2026-02-16')

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Clock className="size-7 text-primary" /> Time Machine
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <History className="size-3" /> Historical performance analysis via Oracle AWR/ASH snapshots
                        </p>
                    </div>
                    <div className="flex items-center gap-3 p-1 bg-muted/30 rounded-xl border border-border/50">
                        <div className="px-3 flex items-center gap-2 border-r border-border/50">
                            <Calendar className="size-4 text-muted-foreground" />
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:ring-0 uppercase h-8" />
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                            Go Back <ArrowRight className="size-3" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 border-border/50 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Database className="size-4 text-primary" /> Snapshot Registry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1142, 1141, 1140, 1139].map((snap) => (
                                <div key={snap} className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/50 transition-all cursor-pointer group flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="text-xs font-bold group-hover:text-primary transition-colors">Snapshot #{snap}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">2026-02-16 {10 + (1142 - snap)}:00:00</div>
                                    </div>
                                    <Play className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Filter className="size-4 text-emerald-500" /> Historical Metrics
                            </CardTitle>
                            <Badge variant="outline" className="text-[9px] font-bold border-primary text-primary">Snapshot Selected: #1142</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center border-4 border-dashed border-primary/20">
                                <Search className="size-8 text-primary/40" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Select a snapshot</h3>
                                <p className="text-xs text-muted-foreground max-w-sm mt-3 leading-relaxed">Choose a performance snapshot from the registry on the left to reconstruct the database state at that specific moment.</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 text-left max-w-md mt-6">
                                <div className="mt-1">
                                    <Info className="size-4 text-amber-600" />
                                </div>
                                <div className="text-[11px] text-amber-800 leading-relaxed">
                                    <span className="font-bold">AWR Diagnostics:</span> Snapshot data is retrieved from <code>DBA_HIST_SNAPSHOT</code>. Ensure the statistics collection level is set to 'TYPICAL' or 'ALL'.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

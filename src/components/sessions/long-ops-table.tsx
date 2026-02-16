/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: long-ops-table.tsx
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
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, Database, ChevronRight, BarChart3, Timer } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LongOpsTable({ data = [], onSelectSession }: { data?: any[], onSelectSession?: (sid: string) => void }) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 border border-dashed border-border/50 rounded-2xl animate-in fade-in duration-700">
                <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 shadow-inner">
                    <Activity className="size-8 opacity-20" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">No Active Long Operations</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1 italic">No long-running tasks currently executing</p>
            </div>
        )
    }

    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                        <BarChart3 className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black tracking-tight uppercase">V$SESSION_LONGOPS</CardTitle>
                        <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Execution progress for intensive database tasks</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[100px] text-[9px] uppercase font-black pl-6">SID</TableHead>
                            <TableHead className="w-[150px] text-[9px] uppercase font-black">Operation</TableHead>
                            <TableHead className="w-[150px] text-[9px] uppercase font-black">Target</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Progress</TableHead>
                            <TableHead className="text-[9px] uppercase font-black text-right pr-6">Time Left</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, idx) => {
                            const percentage = Math.round((row.sofar / row.totalwork) * 100) || 0

                            return (
                                <TableRow key={idx} className="hover:bg-blue-500/5 transition-colors border-b border-border/10 group/row">
                                    <TableCell className="pl-6 py-4">
                                        <Badge variant="outline" className="h-6 font-black bg-blue-500/10 text-blue-600 border-none px-2 cursor-pointer" onClick={() => onSelectSession?.(row.sid)}>#{row.sid}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-foreground leading-tight">{row.opname}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">{row.username}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground truncate" title={row.target}>
                                            <Database className="size-3 shrink-0" /> {row.target || 'GLOBAL'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2 w-full max-w-[200px]">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest leading-none">
                                                <span className="text-primary">{percentage}%</span>
                                                <span className="text-muted-foreground opacity-50">{row.sofar} / {row.totalwork} {row.units}</span>
                                            </div>
                                            <Progress value={percentage} className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-1000 ease-in-out" style={{ width: `${percentage}%` }} />
                                            </Progress>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <Timer className="size-3 text-amber-500" /> {row.time_remaining || '0'}s
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">ET: {row.elapsed_seconds}s</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

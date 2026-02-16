/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: blocking-table.tsx
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
import { AlertCircle, Lock, ShieldAlert, Clock, ChevronRight, Activity, Terminal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BlockingTable({ data = [], onSelectSession }: { data?: any[], onSelectSession?: (sid: string) => void }) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 border border-dashed border-border/50 rounded-2xl animate-in fade-in duration-700">
                <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                    <Lock className="size-8 opacity-20" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">No Blocking Sessions</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1 italic">System performance is currently optimal</p>
            </div>
        )
    }

    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner group-hover:animate-pulse">
                        <ShieldAlert className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black tracking-tight uppercase">Lock Hierarchies & Blockers</CardTitle>
                        <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Active session contention identified</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[120px] text-[9px] uppercase font-black pl-6">Blocker SID</TableHead>
                            <TableHead className="w-[120px] text-[9px] uppercase font-black">Waiter SID</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Hold Time</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Lock Type</TableHead>
                            <TableHead className="text-[9px] uppercase font-black pr-6 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-rose-500/5 transition-colors border-b border-border/10 group/row">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="h-6 font-black bg-rose-500/10 text-rose-600 border-none px-2">{row.blocking_sid}</Badge>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-foreground">Bloker Instance</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{row.inst_id}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold text-foreground">{row.waiting_sid}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground">
                                        <Clock className="size-3" /> {row.seconds_in_wait}s
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-muted text-[10px] font-black tracking-tighter rounded-md uppercase border-none">{row.lock_type}</Badge>
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => onSelectSession?.(row.blocking_sid)} className="h-7 px-3 bg-muted/30 hover:bg-primary/10 hover:text-primary rounded-lg transition-all group/btn">
                                        <span className="text-[10px] font-black uppercase tracking-widest mr-2">Trace Blocker</span>
                                        <ChevronRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

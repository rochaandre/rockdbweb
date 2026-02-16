/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sessions-table.tsx
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Activity,
    Clock,
    Terminal,
    Monitor,
    User,
    AlertCircle,
    Zap,
    ChevronRight,
    ShieldAlert,
    Hash,
    Activity as PulseIcon
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function SessionsTable({ data = [], onSelect, selectedSid }: { data: any[], onSelect: (s: any) => void, selectedSid?: string }) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <Table>
                <TableHeader className="bg-muted/20 border-b border-border/30">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px] text-[9px] uppercase font-black pl-6">SID</TableHead>
                        <TableHead className="text-[9px] uppercase font-black">Database User</TableHead>
                        <TableHead className="text-[9px] uppercase font-black">Status</TableHead>
                        <TableHead className="text-[9px] uppercase font-black">Wait Event</TableHead>
                        <TableHead className="text-[9px] uppercase font-black">Program / Module</TableHead>
                        <TableHead className="text-[9px] uppercase font-black pr-6 text-right">Logon Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((session, idx) => {
                        const isActive = session.status === 'ACTIVE'
                        const isBlocker = session.blocking_status === 'BLOCKER'
                        const isWaiting = session.blocking_status === 'WAITING'
                        const isSelected = selectedSid === session.sid

                        return (
                            <TableRow
                                key={idx}
                                onClick={() => onSelect(session)}
                                className={cn(
                                    "cursor-pointer transition-all border-b border-border/10 group/row",
                                    isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-primary/5 border-l-2 border-l-transparent",
                                    isBlocker ? "bg-rose-500/5" : ""
                                )}
                            >
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn(
                                            "h-6 font-mono font-black border-none px-2",
                                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>{session.sid}</Badge>
                                        {isBlocker && <ShieldAlert className="size-3.5 text-rose-500 animate-pulse" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-foreground">{session.username || 'INTERNAL'}</span>
                                            {isWaiting && <Badge variant="destructive" className="h-4 text-[8px] font-black px-1">WAITING</Badge>}
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-40 group-hover/row:opacity-100 transition-opacity">
                                            <Monitor className="size-3" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter truncate max-w-[150px]">{session.osuser} @ {session.machine}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "size-2 rounded-full",
                                            isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-400 opacity-40"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isActive ? "text-emerald-600" : "text-muted-foreground opacity-60"
                                        )}>{session.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-foreground leading-tight truncate max-w-[200px]" title={session.event}>{session.event}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 mt-0.5 italic">{session.wait_class} | {session.seconds_in_wait}s</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Terminal className="size-3.5 text-primary/50" />
                                        <span className="text-xs font-bold text-foreground truncate max-w-[180px]" title={session.program}>{session.program}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] font-bold text-foreground">{session.logon_time.split(' ')[1]}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{session.logon_time.split(' ')[0]}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

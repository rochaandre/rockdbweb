/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: detail-sidebar.tsx
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
import { Badge } from "@/components/ui/badge"
import {
    X,
    Terminal,
    User,
    Monitor,
    Clock,
    Activity,
    Database,
    FileCode,
    Hash,
    Zap,
    HardDrive,
    Cpu,
    Network,
    Calendar,
    Layers,
    Info,
    ShieldAlert,
    Dna
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function SessionDetailSidebar({ session, onClose }: { session: any, onClose: () => void }) {
    if (!session) return null

    const isActive = session.status === 'ACTIVE'
    const isBlocking = session.blocking_status === 'BLOCKER'

    return (
        <aside className="w-[450px] border-l border-border/50 bg-card/60 backdrop-blur-2xl flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-30 animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-6 border-b border-border/30 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center shadow-inner group transition-transform duration-500 hover:rotate-6",
                        isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                    )}>
                        <User className="size-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black tracking-tight text-foreground">{session.username || 'INTERNAL'}</h2>
                            <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest bg-muted border-none mt-1">SID: {session.sid}</Badge>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 italic flex items-center gap-1.5 leading-none">
                            <Monitor className="size-3" /> {session.osuser} @ {session.machine}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                    <X className="size-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Status Highlights */}
                    <div className="grid grid-cols-2 gap-3">
                        <DetailCard
                            label="Session Status"
                            value={session.status}
                            icon={<Zap className="size-3.5" />}
                            variant={isActive ? 'emerald' : 'slate'}
                        />
                        <DetailCard
                            label="Contention"
                            value={session.blocking_status || 'NONE'}
                            icon={<ShieldAlert className="size-3.5" />}
                            variant={isBlocking ? 'rose' : 'slate'}
                        />
                    </div>

                    <div className="h-px bg-border/20" />

                    {/* Technical Info */}
                    <Section label="Technical Context" icon={<Dna className="size-4" />}>
                        <InfoRow label="Serial Number" value={session.serial} icon={<Hash />} />
                        <InfoRow label="Instance ID" value={session.inst_id} icon={<Layers />} />
                        <InfoRow label="Process ID" value={session.paddr} icon={<Cpu />} />
                        <InfoRow label="Logon Time" value={session.logon_time} icon={<Calendar />} />
                        <InfoRow label="Last Call ET" value={`${session.last_call_et}s`} icon={<Clock />} />
                    </Section>

                    <div className="h-px bg-border/20" />

                    {/* Performance */}
                    <Section label="Runtime Performance" icon={<Activity className="size-4" />}>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                    <Activity className="size-3.5 text-primary" /> Current Wait Event
                                </p>
                                <p className="text-sm font-black text-foreground mb-1">{session.event || 'SQL*Net message from client'}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground">Class: {session.wait_class || 'Network'}</div>
                                    <div className="text-[10px] font-mono font-bold text-primary italic">Waited: {session.seconds_in_wait || 0}s</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/10 border border-border/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                    <FileCode className="size-3.5 text-amber-500" /> Current SQL ID
                                </p>
                                <p className="text-sm font-mono font-bold text-foreground bg-black/20 p-2 rounded-lg border border-white/5 select-all">{session.sql_id || '9y6zghyqw1z77'}</p>
                                <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase text-primary mt-3 gap-1 hover:no-underline">
                                    Analyze Full SQL Statement <ChevronRight className="size-3" />
                                </Button>
                            </div>
                        </div>
                    </Section>

                    <div className="h-px bg-border/20" />

                    {/* Environment */}
                    <Section label="Environment & Location" icon={<Globe className="size-4" />}>
                        <InfoRow label="Program" value={session.program} icon={<Terminal />} />
                        <InfoRow label="Module" value={session.module || 'N/A'} icon={<Layers />} />
                        <InfoRow label="Machine" value={session.machine} icon={<Monitor />} />
                    </Section>
                </div>
            </ScrollArea>

            <div className="p-6 bg-muted/20 border-t border-border/30 grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-11 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-card border-border/50 hover:bg-muted">
                    <Activity className="size-3.5" /> Monitor
                </Button>
                <Button className="h-11 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20">
                    <ShieldAlert className="size-3.5" /> Kill Session
                </Button>
            </div>
        </aside>
    )
}

function Section({ label, icon, children }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="text-primary">{icon}</div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{label}</h3>
            </div>
            <div className="space-y-3 pl-1">
                {children}
            </div>
        </div>
    )
}

function InfoRow({ label, value, icon }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {React.cloneElement(icon, { className: 'size-3.5' })}
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{label}</span>
            </div>
            <span className="text-xs font-bold text-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/10">{value}</span>
        </div>
    )
}

function DetailCard({ label, value, icon, variant }: any) {
    const variants: any = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        slate: "bg-muted text-muted-foreground border-border/50",
        rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        amber: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    }

    return (
        <div className={cn("p-4 rounded-2xl border flex flex-col gap-2 relative overflow-hidden", variants[variant])}>
            <div className="absolute top-2 right-2 opacity-10">
                {React.cloneElement(icon, { className: 'size-12' })}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5 leading-none">
                {icon} {label}
            </span>
            <span className="text-sm font-black tracking-tight leading-none mt-1">{value}</span>
        </div>
    )
}

/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: status-bar.tsx
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
import { useApp } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Server, Clock } from 'lucide-react'

export function StatusBar() {
    const { activeConnection } = useApp()

    return (
        <footer className="h-6 flex items-center justify-between px-3 bg-card border-t border-border/50 text-[10px] text-muted-foreground font-medium select-none z-30">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Server className="size-3" />
                    <span className="uppercase tracking-widest font-black text-[9px]">Server:</span>
                    <span className="text-foreground">{activeConnection ? activeConnection.label : 'Idle'}</span>
                </div>
                <div className="flex items-center gap-1.5 pl-4 border-l border-border/50">
                    <span className="uppercase tracking-widest font-black text-[9px]">Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`size-1.5 rounded-full ${activeConnection ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                        <span className={activeConnection ? 'text-emerald-500 font-bold' : ''}>{activeConnection ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 pr-4 border-r border-border/50">
                    <Clock className="size-3" />
                    <span>UTC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="opacity-50 uppercase font-black text-[8px]">App Build</span>
                    <Badge variant="outline" className="h-4 px-1 text-[8px] font-bold border-muted/50 text-muted-foreground/60">v0.1.0-alpha</Badge>
                </div>
            </div>
        </footer>
    )
}

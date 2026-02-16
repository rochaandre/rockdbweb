/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: control-bar.tsx
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    RefreshCw,
    Filter,
    ChevronDown,
    LayoutGrid,
    List,
    Settings2,
    Download,
    AlertCircle,
    Clock,
    Zap,
    ShieldCheck,
    Activity
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function SessionsControlBar({
    onRefresh,
    onFilterChange,
    filterValue,
    stats,
    isRefreshing,
    viewMode,
    onViewModeChange
}: any) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Filter sessions by SID, User, Program, OS User..."
                            className="h-10 pl-10 bg-card/40 border-border/50 rounded-xl font-medium text-xs focus-visible:ring-primary/20 transition-all"
                            value={filterValue}
                            onChange={(e) => onFilterChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50 mr-2">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="size-8 rounded-lg"
                            onClick={() => onViewModeChange('grid')}
                        >
                            <LayoutGrid className="size-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="size-8 rounded-lg"
                            onClick={() => onViewModeChange('list')}
                        >
                            <List className="size-4" />
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 gap-2 rounded-xl bg-card border-border/50 font-black text-[10px] tracking-widest uppercase hover:bg-muted"
                    >
                        <Filter className="size-3.5" /> Advanced
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        className={`h-10 px-6 gap-2 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20 ${isRefreshing ? 'opacity-80' : ''}`}
                        onClick={onRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Syncing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <SessionMetric
                    label="Total"
                    value={stats.total}
                    icon={<Activity className="size-3.5" />}
                    variant="primary"
                />
                <SessionMetric
                    label="Active"
                    value={stats.active}
                    icon={<Zap className="size-3.5" />}
                    variant="emerald"
                    animate
                />
                <SessionMetric
                    label="Inative"
                    value={stats.inactive}
                    icon={<Clock className="size-3.5" />}
                    variant="slate"
                />
                <SessionMetric
                    label="Blocking"
                    value={stats.blocking}
                    icon={<AlertCircle className="size-3.5" />}
                    variant="rose"
                    alert={stats.blocking > 0}
                />
                <SessionMetric
                    label="Parallel"
                    value={stats.parallel}
                    icon={<LayoutGrid className="size-3.5" />}
                    variant="indigo"
                />
                <SessionMetric
                    label="Background"
                    value={stats.background}
                    icon={<ShieldCheck className="size-3.5" />}
                    variant="amber"
                />
            </div>
        </div>
    )
}

function SessionMetric({ label, value, icon, variant, animate, alert }: any) {
    const colors: any = {
        primary: "bg-primary/10 text-primary border-primary/20",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        slate: "bg-slate-500/10 text-slate-600 border-slate-500/20"
    }

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card/40 backdrop-blur-md transition-all group overflow-hidden relative",
            colors[variant],
            alert && "animate-pulse shadow-lg shadow-rose-500/10"
        )}>
            {animate && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/20">
                    <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
                </div>
            )}
            <div className="p-1.5 rounded-lg bg-current opacity-10" />
            <div className="absolute left-4 p-1.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{label}</p>
                <p className="text-sm font-black mt-1 leading-none">{value}</p>
            </div>
        </div>
    )
}

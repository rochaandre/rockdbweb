/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sidebar.tsx
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
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Database,
    Activity,
    Server,
    HardDrive,
    Search,
    Settings,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    History,
    FileCode,
    Wrench,
    Clock,
    RotateCw,
    Box,
    Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
}

const MENU_ITEMS = [
    {
        group: 'Monitoring', items: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { name: 'Redo Log Switch', icon: RotateCw, path: '/redo-log' },
            { name: 'Long Operations', icon: Activity, path: '/long_operations' },
            { name: 'Healthcheck', icon: ShieldCheck, path: '/healthcheck' },
        ]
    },
    {
        group: 'Exploration', items: [
            { name: 'ASM Explorer', icon: Box, path: '/asm_explorer' },
            { name: 'Block Explorer', icon: HardDrive, path: '/block_explorer' },
            { name: 'SQL Central', icon: FileCode, path: '/sql-central' },
            { name: 'Explain Plan', icon: Key, path: '/explain-plan' },
        ]
    },
    {
        group: 'Management', items: [
            { name: 'Servers', icon: Server, path: '/servers' },
            { name: 'DB Connections', icon: Database, path: '/db-connections' },
            { name: 'Backups', icon: History, path: '/backups' },
            { name: 'Time Machine', icon: Clock, path: '/time-machine' },
        ]
    },
    {
        group: 'System', items: [
            { name: 'Configuration', icon: Settings, path: '/configuration' },
            { name: 'Tools', icon: Wrench, path: '/tools' },
        ]
    }
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const location = useLocation()

    return (
        <aside className={cn(
            "flex flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-500 ease-in-out z-20 shadow-2xl overflow-hidden",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="flex items-center justify-between p-4 mb-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-700">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Database className="size-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-foreground">ROCK<span className="text-primary italic">DB</span></span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-primary/20 animate-in zoom-in duration-500">
                        <Database className="size-4 text-white" />
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 px-3">
                <TooltipProvider delayDuration={0}>
                    <div className="space-y-6 pb-6 mt-2">
                        {MENU_ITEMS.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-2">
                                {!isCollapsed && (
                                    <h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1 animate-in slide-in-from-left-2 duration-500">
                                        {group.group}
                                    </h4>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = location.pathname === item.path
                                        const Icon = item.icon

                                        return (
                                            <Tooltip key={item.path}>
                                                <TooltipTrigger asChild>
                                                    <Link to={item.path}>
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "w-full justify-start transition-all duration-300 relative group h-10 px-3",
                                                                isActive
                                                                    ? "bg-primary/10 text-primary font-black hover:bg-primary/20"
                                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                                                isCollapsed && "justify-center px-0"
                                                            )}
                                                        >
                                                            <Icon className={cn(
                                                                "size-4.5 shrink-0 transition-transform duration-300",
                                                                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
                                                            )} />
                                                            {!isCollapsed && <span className="ml-3 text-xs tracking-tight">{item.name}</span>}

                                                            {isActive && (
                                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                                            )}
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                {isCollapsed && (
                                                    <TooltipContent side="right" className="font-bold text-xs uppercase bg-slate-900 border-slate-800 text-white">
                                                        {item.name}
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
            </ScrollArea>

            <div className="p-3 border-t border-border/30 mt-auto bg-muted/5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="w-full h-8 hover:bg-muted font-bold text-muted-foreground transition-all"
                >
                    {isCollapsed ? <ChevronRight className="size-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="size-4" /> <span className="text-[10px] uppercase font-black">Collapse Sidebar</span></div>}
                </Button>
            </div>
        </aside>
    )
}

function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("overflow-y-auto overflow-x-hidden scrollbar-hide", className)}>
            {children}
        </div>
    )
}

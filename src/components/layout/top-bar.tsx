/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: top-bar.tsx
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
import {
    Database,
    Search,
    Bell,
    User,
    ExternalLink,
    Wifi,
    Shield,
    Zap,
    ChevronDown,
    Monitor,
    Command,
    HelpCircle,
    Activity
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
    const { activeConnection } = useApp()
    const navigate = useNavigate()

    return (
        <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Quick search (⌘ K)..."
                        className="pl-10 h-9 bg-muted/40 border-none shadow-inner text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-xl w-full"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30 select-none">
                        <Command className="size-3" />
                        <span className="text-[10px] font-bold">K</span>
                    </div>
                </div>

                {activeConnection && (
                    <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                        <div className="h-6 w-px bg-border/50 mx-2" />
                        <Badge variant="secondary" className="h-7 px-3 bg-primary/10 text-primary border-none flex items-center gap-2 hover:bg-primary/20 transition-all cursor-default">
                            <Database className="size-3" />
                            <span className="text-[10px] font-black tracking-tight">{activeConnection.label}</span>
                        </Badge>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase">Active</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 mr-3">
                    <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-primary transition-all relative">
                        <Bell className="size-4.5" />
                        <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-card" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
                        <Monitor className="size-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground">
                        <HelpCircle className="size-4.5" />
                    </Button>
                </div>

                <div className="h-6 w-px bg-border/50 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 pl-2 pr-1 gap-3 hover:bg-muted/50 rounded-xl group transition-all">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                AR
                            </div>
                            <div className="flex flex-col items-start min-w-0 pr-2">
                                <span className="text-xs font-bold text-foreground">Andre Rocha</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">SysAdmin</span>
                            </div>
                            <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 p-1.5 rounded-xl border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-300">
                        <DropdownMenuLabel className="px-3 py-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Account Workspace</div>
                            <div className="text-xs font-bold">TechMax Consultoria</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/30" />
                        <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-primary/10 hover:text-primary">
                            <User className="size-4" /> <span className="text-xs font-bold">User Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-primary/10 hover:text-primary">
                            <Zap className="size-4" /> <span className="text-xs font-bold">Preferences</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/30" />
                        <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
                            <ExternalLink className="size-4" /> <span className="text-xs font-bold">Logout System</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

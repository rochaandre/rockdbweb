/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: tools-view.tsx
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
import {
    Wrench,
    Terminal,
    Play,
    Copy,
    Database,
    Activity,
    History,
    ShieldCheck,
    Workflow,
    ExternalLink,
    Zap,
    Cpu,
    Lock,
    Settings,
    LayoutDashboard,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const ORACLE_TOOLS = [
    {
        name: 'SQL*Plus',
        description: 'Command line interface for executing SQL and PL/SQL.',
        icon: <Terminal className="size-5" />,
        color: 'blue'
    },
    {
        name: 'RMAN',
        description: 'Recovery Manager for database backup and recovery.',
        icon: <Database className="size-5" />,
        color: 'emerald'
    },
    {
        name: 'Data Pump',
        description: 'High-speed export and import of data and metadata.',
        icon: <Zap className="size-5" />,
        color: 'amber'
    },
    {
        name: 'SQL Loader',
        description: 'Load data from external files into Oracle tables.',
        icon: <Workflow className="size-5" />,
        color: 'purple'
    },
    {
        name: 'ADRCI',
        description: 'Automatic Diagnostic Repository Command Interpreter.',
        icon: <Activity className="size-5" />,
        color: 'rose'
    },
    {
        name: 'oratop',
        description: 'Near real-time monitor for Oracle database activity.',
        icon: <Cpu className="size-5" />,
        color: 'indigo'
    }
]

export function ToolsView() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">External Tools</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Wrench className="size-3" /> Management and execution wrappers for Oracle Binary Tools
                        </p>
                    </div>
                    <Badge variant="outline" className="h-6 gap-1.5 font-bold border-primary text-primary bg-primary/5 uppercase tracking-widest text-[9px]">
                        <ShieldCheck className="size-3" /> Mandatory SSH Execution Enabled
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto pr-2 pb-6">
                    {ORACLE_TOOLS.map((tool, i) => (
                        <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden flex flex-col bg-card/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/30 bg-muted/5 relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                        {tool.icon}
                                    </div>
                                    <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">
                                        {tool.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-6">
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {tool.description}
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <span>Last Execution</span>
                                        <span className="flex items-center gap-1.5 text-emerald-600">
                                            <CheckCircle2 className="size-3" /> SUCCESS
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg font-mono text-[9px] text-muted-foreground border border-border/40 select-all">
                                        $ {tool.name.toLowerCase().replace('*', 'plus')} -V
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-3 bg-muted/10 border-t border-border/30 flex gap-2">
                                <Button size="sm" className="flex-1 text-[10px] font-black uppercase h-8 gap-2 shadow-lg shadow-primary/20">
                                    Execute <Play className="size-3 fill-current" />
                                </Button>
                                <Button size="sm" variant="ghost" className="size-8 p-0 text-muted-foreground hover:text-foreground">
                                    <Settings className="size-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    <Card className="border-2 border-dashed border-border/50 bg-transparent hover:border-primary/50 transition-all flex flex-col items-center justify-center p-8 text-center gap-4 group cursor-pointer hover:bg-primary/5">
                        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ExternalLink className="size-6" />
                        </div>
                        <div>
                            <div className="text-sm font-black uppercase tracking-widest">Register Tool</div>
                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[140px]">Map a new binary or custom script as a tool</p>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-dashboard-view.tsx
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, Database, Clock, Zap } from 'lucide-react'

const MOCK_PERF_DATA = [
    { time: '10:00', reads: 400, writes: 240, cpu: 32 },
    { time: '10:10', reads: 300, writes: 139, cpu: 28 },
    { time: '10:20', reads: 200, writes: 980, cpu: 56 },
    { time: '10:30', reads: 278, writes: 390, cpu: 41 },
    { time: '10:40', reads: 189, writes: 480, cpu: 38 },
    { time: '10:50', reads: 239, writes: 380, cpu: 44 },
    { time: '11:00', reads: 349, writes: 430, cpu: 48 }
]

export function SqlDashboardView() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">SQL Performance Dashboard</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Activity className="size-3" /> Advanced visualization of database execution metrics
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto pr-2 pb-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Zap className="size-4 text-amber-500" /> IO Wait / Throughput
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_PERF_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', borderRadius: '8px' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="reads" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} animationDuration={1500} />
                                    <Line type="monotone" dataKey="writes" stroke="hsl(var(--rose-500))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--rose-500))' }} activeDot={{ r: 6 }} animationDuration={1500} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Database className="size-4 text-primary" /> Global CPU Load
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_PERF_DATA}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

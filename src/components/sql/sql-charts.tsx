/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-charts.tsx
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts'
import { Activity, BarChart3, PieChart as PieIcon, Zap } from 'lucide-react'

export function SqlMetricChart({ data, title, description, dataKey, color }: any) {
    return (
        <Card className="shadow-xl bg-card/40 backdrop-blur-md border-border/50 group hover:shadow-primary/5 transition-all duration-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 bg-muted/10 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500 shadow-inner`}>
                        <BarChart3 className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--muted-foreground))', opacity: 0.5 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--muted-foreground))', opacity: 0.5 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                                itemStyle={{ color: 'hsl(var(--primary))' }}
                                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                            />
                            <Bar
                                dataKey={dataKey}
                                radius={[6, 6, 0, 0]}
                                animationDuration={1500}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} opacity={0.7 + (index / data.length) * 0.3} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function WaitClassPieChart({ data }: any) {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

    return (
        <Card className="shadow-xl bg-card/40 backdrop-blur-md border-border/50 group hover:shadow-primary/5 transition-all duration-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 bg-muted/10 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shadow-inner">
                        <PieIcon className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Wait Class Distribution</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">Database activity by wait category</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                animationDuration={1500}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

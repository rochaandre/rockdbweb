/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: system-health-charts.tsx
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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Activity } from 'lucide-react'

interface ChartProps {
    data: any[]
    title: string
    description: string
    dataKey: string
    color: string
}

export function SystemHealthChart({ data, title, description, dataKey, color }: ChartProps) {
    return (
        <Card className="shadow-xl bg-card/40 backdrop-blur-md border-border/50 group hover:shadow-primary/5 transition-all duration-500">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
                        <Activity className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/60">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[180px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#3b82f6'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#3b82f6'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                                itemStyle={{ color: 'hsl(var(--primary))' }}
                            />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#3b82f6'}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#gradient-${dataKey})`}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

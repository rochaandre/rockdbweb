/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: storage-components.tsx
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Database,
    HardDrive,
    Activity,
    TrendingUp,
    Clock,
    ChevronRight,
    Layers,
    Search,
    ShieldCheck,
    AlertTriangle,
    Info,
    Server,
    Zap,
    BarChart3,
    FileCode,
    Box,
    Layout,
    PieChart as PieIcon
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie, BarChart, Bar } from 'recharts'
import { Button } from "@/components/ui/button"

export function TablespaceGrid({ data = [], onSelect }: { data?: any[], onSelect?: (ts: any) => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.map((ts, idx) => {
                const usedPercent = Math.round(parseFloat(ts.USED_PERCENT || '0'))
                const isCritical = usedPercent > 90
                const isWarning = usedPercent > 80
                const usedGb = (ts.USED_MB / 1024).toFixed(1)
                const totalGb = (ts.TOTAL_MB / 1024).toFixed(1)

                return (
                    <Card
                        key={idx}
                        onClick={() => onSelect?.(ts)}
                        className={cn(
                            "group cursor-pointer p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden",
                            isCritical ? "border-rose-500/30 bg-rose-500/5 shadow-rose-500/5 ring-1 ring-rose-500/10" :
                                isWarning ? "border-amber-500/30 bg-amber-500/5 shadow-amber-500/5" :
                                    "border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
                        )}
                    >
                        <div className="absolute -top-10 -right-10 size-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center justify-between mb-5 relative">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500",
                                    isCritical ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                                )}>
                                    <Database className="size-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight text-foreground leading-none">{ts.TABLESPACE_NAME}</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Status: {ts.STATUS}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={cn(
                                "h-5 text-[9px] font-black uppercase tracking-widest border-none px-2",
                                isCritical ? "bg-rose-500/10 text-rose-600" : isWarning ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground opacity-50"
                            )}>
                                {ts.CONTENTS}
                            </Badge>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                <span className={cn(isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-primary')}>{usedPercent}% USED</span>
                                <span>{usedGb}GB / {totalGb}GB</span>
                            </div>
                            <Progress value={usedPercent} className="h-2 rounded-full bg-muted overflow-hidden ring-1 ring-white/5 shadow-inner">
                                <div className={cn(
                                    "h-full transition-all duration-1000",
                                    isCritical ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                        isWarning ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                            "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                )} style={{ width: `${usedPercent}%` }} />
                            </Progress>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Free Space</p>
                                    <p className="text-xs font-bold text-foreground leading-none">{(ts.FREE_MB / 1024).toFixed(1)} GB</p>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Files</p>
                                    <p className="text-xs font-bold text-foreground leading-none">{ts.FILE_COUNT || 1}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}

export function DatafilesTable({ data = [] }: { data?: any[] }) {
    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-12 transition-transform">
                        <FileCode className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight uppercase">Tablespace Datafiles</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Detailed OS-level file mapping and status</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto scrollbar-hide">
                    <Table>
                        <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                            <TableRow className="border-b border-border/30">
                                <TableHead className="w-[80px] text-[10px] uppercase font-black tracking-widest pl-8">ID</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest">Filename / Location</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest">TS Name</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest">Status</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest pr-8 text-right">Size MB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((file, idx) => (
                                <TableRow key={idx} className="hover:bg-indigo-500/5 transition-colors border-b border-border/10 group/row">
                                    <TableCell className="pl-8 py-4 font-mono text-[11px] font-black text-muted-foreground">{file.FILE_ID}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-foreground leading-relaxed break-all select-all">{file.FILE_NAME}</span>
                                            <div className="flex items-center gap-2 mt-1 opacity-40 group-hover/row:opacity-100 transition-opacity">
                                                <HardDrive className="size-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">ASM / DISK</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest border-none bg-muted px-2">{file.TABLESPACE_NAME}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest border-none bg-emerald-500/10 text-emerald-600 px-2">{file.STATUS}</Badge>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <span className="text-[11px] font-mono font-black text-foreground">{file.BYTES_MB} MB</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export function StorageMetrics({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard label="Allocated Space" value={`${data.allocated_gb}GB`} icon={<Box />} color="primary" />
            <MetricCard label="Used Space" value={`${data.used_gb}GB`} icon={<Activity />} color="emerald" percentage={Math.round((data.used_gb / data.allocated_gb) * 100)} />
            <MetricCard label="Free Space" value={`${data.free_gb}GB`} icon={<Zap />} color="amber" />
            <MetricCard label="Datafiles" value={data.file_count} icon={<FileCode />} color="indigo" />
        </div>
    )
}

function MetricCard({ label, value, icon, color, percentage }: any) {
    return (
        <Card className="bg-card/40 border-border/50 shadow-xl relative overflow-hidden group">
            <div className={cn("absolute inset-y-0 left-0 w-1.5", `bg-${color}-500/40`)} />
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(`size-10 rounded-xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`)}>
                        {React.cloneElement(icon, { className: 'size-5' })}
                    </div>
                    {percentage !== undefined && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{percentage}% Utilization</div>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{label}</p>
                    <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
                </div>
                {percentage !== undefined && (
                    <div className="mt-4 h-1 w-full bg-muted rounded-full">
                        <div className={cn(`h-full rounded-full bg-${color}-500 shadow-[0_0_8px_rgba(var(--${color}-500),0.3)]`)} style={{ width: `${percentage}%` }} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/* 
  Usage Trend Chart for Tablespaces 
  Visualizes usage over last 7 snapshots
*/
export function StorageTrendChart({ data = [] }: { data: any[] }) {
    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                        <TrendingUp className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight uppercase">Usage Growth Trend</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Historical database size evolution (Last 7 Days)</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 pb-4">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', fontSize: '10px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                                itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', color: 'hsl(var(--primary))' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsage)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

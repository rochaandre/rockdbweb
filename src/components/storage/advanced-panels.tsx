/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: advanced-panels.tsx
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

// --- ASM Panel ---
export const ASMPanel = ({ diskGroups = [] }: { diskGroups?: any[] }) => (
    <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
        <CardHeader className="border-b border-border/30 bg-muted/20 py-5">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Database className="size-5" />
                </div>
                <div>
                    <CardTitle className="text-base font-black tracking-tight uppercase">ASM Disk Groups</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Automatic Storage Management utilization</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-auto scrollbar-hide">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[150px] text-[10px] uppercase font-black tracking-widest pl-8">Disk Group</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Type / State</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Utilization</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest pr-8 text-right">Capacity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {diskGroups.map((group, idx) => {
                            const usagePercent = Math.round(((group.TOTAL_MB - group.FREE_MB) / group.TOTAL_MB) * 100)
                            const isCrit = usagePercent > 85
                            const isWarn = usagePercent > 70

                            return (
                                <TableRow key={idx} className="hover:bg-primary/5 transition-colors border-b border-border/10">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-black text-foreground">{group.NAME}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-0.5">{group.BLOCK_SIZE} Block</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest border-none bg-muted text-muted-foreground px-2">{group.TYPE}</Badge>
                                            <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest border-none bg-emerald-500/10 text-emerald-600 px-2">{group.STATE}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2.5 w-full max-w-[200px]">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className={cn(isCrit ? 'text-rose-500' : isWarn ? 'text-amber-500' : 'text-primary')}>{usagePercent}% USED</span>
                                                <span className="text-muted-foreground/50">{Math.round((group.TOTAL_MB - group.FREE_MB) / 1024)}GB</span>
                                            </div>
                                            <Progress value={usagePercent} className="h-1.5 bg-muted rounded-full">
                                                <div className={cn("h-full transition-all duration-1000", isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${usagePercent}%` }} />
                                            </Progress>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-foreground">{(group.TOTAL_MB / 1024).toFixed(1)} GB</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Free: {(group.FREE_MB / 1024).toFixed(1)} GB</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
)

// --- SYSAUX Detail Panel ---
export const SysauxPanel = ({ data = [], occupants = [], chartData = [] }: { data?: any[], occupants?: any[], chartData?: any[] }) => {
    const totalBytes = data.reduce((acc, curr) => acc + (curr.BYTES || 0), 0)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl border-l-[6px] border-l-amber-500">
                <CardHeader className="bg-muted/20 border-b border-border/30 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                <Layers className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-black tracking-tight uppercase">SYSAUX Occupants</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Internal component space distribution</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-amber-500/20 text-amber-600 font-black text-[10px] bg-amber-500/5 px-3 py-1 uppercase tracking-widest">Total: {(totalBytes / 1024 / 1024).toFixed(2)} MB</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-auto scrollbar-hide">
                        <Table>
                            <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow className="border-b border-border/30">
                                    <TableHead className="w-[180px] text-[10px] uppercase font-black tracking-widest pl-8">Component / Schema</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest">Status / Occupant</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest pr-8 text-right">Space Usage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {occupants.map((occ, i) => (
                                    <TableRow key={i} className="hover:bg-amber-500/5 transition-colors border-b border-border/10">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-foreground uppercase tracking-tight">{occ.OCCUPANT_NAME}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{occ.SCHEMA_NAME}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed truncate max-w-[300px]" title={occ.OCCUPANT_DESC}>{occ.OCCUPANT_DESC}</p>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <span className="text-xs font-mono font-black text-amber-600">{Math.round(occ.SPACE_USAGE_KBYTES / 1024)} MB</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl flex flex-col">
                <CardHeader className="bg-muted/20 border-b border-border/30 py-5">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <PieIcon className="size-5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight uppercase">Space Ratio</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-8 pb-6">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', fontSize: '10px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                                    itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 space-y-3 px-6">
                        {chartData.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground/70">{item.name}</span>
                                </div>
                                <span className="text-foreground">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Fra (Fast Recovery Area) Panel ---
export const FRAPanel = ({ data = [], usageChart = [] }: { data?: any[], usageChart?: any[] }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-emerald-500/5 border-l-[6px] border-l-emerald-500">
            <CardHeader className="bg-muted/20 border-b border-border/30 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:rotate-12 transition-transform">
                        <Activity className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight uppercase">Fast Recovery Area</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Managed recovery files usage distribution</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[180px] text-[10px] uppercase font-black tracking-widest pl-8">File Type</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Usage %</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Reclaimable</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest pr-8 text-right">File Count</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i} className="hover:bg-emerald-500/5 transition-colors border-b border-border/10">
                                <TableCell className="pl-8 py-4">
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{row.FILE_TYPE}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 opacity-60" style={{ width: `${row.PERCENT_SPACE_USED}%` }} />
                                        </div>
                                        <span className="text-[10px] font-mono font-black text-emerald-600">{row.PERCENT_SPACE_USED}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{row.PERCENT_SPACE_RECLAIMABLE}%</span>
                                </TableCell>
                                <TableCell className="pr-8 text-right">
                                    <Badge variant="outline" className="h-5 text-[9px] font-black border-none bg-muted text-muted-foreground">{row.NUMBER_OF_FILES}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Usage Trend Card */}
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500">
            <CardHeader className="bg-muted/20 border-b border-border/30 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <TrendingUp className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight uppercase">FRA Space Statistics</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Total capacity vs available space</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 pb-6 px-10 flex flex-col items-center justify-center space-y-8">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageChart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--muted-foreground))', opacity: 0.5 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '10px' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                                {usageChart.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full">
                    {usageChart.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">{item.name}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-foreground">{item.value}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GB</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full mt-1">
                                <div className="h-full rounded-full" style={{ backgroundColor: item.color, width: '100%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
)

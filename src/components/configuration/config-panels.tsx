/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: config-panels.tsx
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
import { Database, Server, FileCode, Activity, HardDrive, ShieldCheck, Box, Settings } from 'lucide-react'

// --- DB Properties Panel ---
export const DBPropertiesPanel = ({ data = [] }: { data?: any[] }) => (
    <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
        <CardHeader className="border-b border-border/30 bg-muted/20 py-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Database className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight uppercase">Database Properties</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">View core database identity and runtime settings</CardDescription>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="max-h-[500px] overflow-auto scrollbar-hide">
                <Table>
                    <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[30%] text-[10px] uppercase font-black tracking-widest pl-6">Parameter Name</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Value</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest pr-6">Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((prop, idx) => (
                            <TableRow key={idx} className="hover:bg-primary/5 transition-colors border-b border-border/10 group/row">
                                <TableCell className="font-mono text-[11px] font-bold text-foreground py-4 pl-6">
                                    <span className="opacity-70">{prop.NAME}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-muted font-bold text-[10px] border-none px-2 py-0.5">{prop.VALUE}</Badge>
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground pr-6 font-medium leading-relaxed italic">
                                    {prop.DESCRIPTION}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
)

// --- Instance Parameters Panel ---
export const InstanceParametersPanel = ({ data = [] }: { data?: any[] }) => (
    <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-primary/5">
        <CardHeader className="border-b border-border/30 bg-muted/20 py-5">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-12 transition-transform">
                    <Settings className="size-5" />
                </div>
                <div>
                    <CardTitle className="text-base font-black tracking-tight uppercase">Initialization Parameters</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Active init.ora / SPFILE parameter configurations</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="max-h-[500px] overflow-auto scrollbar-hide">
                <Table>
                    <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="border-b border-border/30">
                            <TableHead className="w-[30%] text-[10px] uppercase font-black tracking-widest pl-6">Parameter Name</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest">Value</TableHead>
                            <TableHead className="text-[10px] uppercase font-black tracking-widest pr-6">Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((param, idx) => (
                            <TableRow key={idx} className="hover:bg-amber-500/5 transition-colors border-b border-border/10 group/row">
                                <TableCell className="font-mono text-[11px] font-bold text-foreground py-4 pl-6">
                                    <span className="opacity-70">{param.NAME}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-amber-500/20 text-amber-600 font-bold text-[10px] bg-amber-500/5 px-2 py-0.5">{param.VALUE}</Badge>
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground pr-6 font-medium italic">
                                    {param.DESCRIPTION}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
)

// --- Environment Panel ---
export const EnvironmentPanel = ({ data = [] }: { data?: any[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, idx) => (
            <Card key={idx} className="bg-card/40 border-border/40 hover:border-primary/30 transition-all p-4 flex items-center gap-4 group">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Server className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{item.property}</p>
                    <p className="text-xs font-bold truncate text-foreground mt-0.5">{item.value}</p>
                </div>
            </Card>
        ))}
    </div>
)

// --- Files Panel ---
export const FilesPanel = ({ controlFiles = [], redoLogs = [] }: { controlFiles?: any[], redoLogs?: any[] }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 py-4 px-6 border-b border-border/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="size-4 text-emerald-500" /> Control Files
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {controlFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/20 group hover:bg-emerald-50/5 hover:border-emerald-500/20 transition-all">
                        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-mono truncate text-muted-foreground">{file.file_name}</p>
                            <Badge variant="outline" className="h-4 text-[8px] mt-1 bg-emerald-500/5 text-emerald-600 border-none font-black">{file.status}</Badge>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 py-4 px-6 border-b border-border/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="size-4 text-rose-500" /> Redo Logs
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/5">
                        <TableRow className="border-b border-border/20">
                            <TableHead className="text-[9px] uppercase font-black pl-5">Group</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Size</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Status</TableHead>
                            <TableHead className="text-[9px] uppercase font-black pr-5 text-right">Arch</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {redoLogs.map((log, i) => (
                            <TableRow key={i} className="border-b border-border/10 hover:bg-rose-500/5 transition-colors">
                                <TableCell className="pl-5 py-3 font-bold text-xs">{log.GROUP}</TableCell>
                                <TableCell className="text-xs font-mono">{log.BYTES_MB} MB</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`text-[8px] font-black border-none ${log.STATUS === 'CURRENT' ? 'bg-rose-500/10 text-rose-600' : 'bg-muted text-muted-foreground'}`}>
                                        {log.STATUS}
                                    </Badge>
                                </TableCell>
                                <TableCell className="pr-5 text-right font-black text-[9px] text-muted-foreground">{log.ARCHIVED}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
)

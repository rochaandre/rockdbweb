/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-plan-panel.tsx
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
// React import removed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Layers } from 'lucide-react'

export function SqlPlanPanel({ plan = [] }: { plan: any[] }) {
    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black tracking-tight uppercase">Execution Plan</CardTitle>
                        <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Optimizer path and cost analysis</CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-muted text-[10px] font-black tracking-widest uppercase border-none">PHV: 282115162</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="border-border/20">
                            <TableHead className="w-[80px] text-[9px] uppercase font-black pl-6">ID</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Operation</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Object</TableHead>
                            <TableHead className="text-[9px] uppercase font-black">Cost</TableHead>
                            <TableHead className="text-[9px] uppercase font-black pr-6 text-right">Rows</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plan.map((step, idx) => (
                            <TableRow key={idx} className="hover:bg-primary/5 transition-colors border-border/10">
                                <TableCell className="pl-6 py-3 font-mono text-[11px] font-bold text-muted-foreground">{step.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <pre className="text-[11px] font-bold text-foreground font-sans m-0">{step.operation} {step.options}</pre>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-black uppercase text-primary/70">{step.object_name}</span>
                                </TableCell>
                                <TableCell className="font-mono text-[10px] font-bold">{step.cost}</TableCell>
                                <TableCell className="pr-6 text-right font-mono text-[10px] font-bold">{step.rows}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

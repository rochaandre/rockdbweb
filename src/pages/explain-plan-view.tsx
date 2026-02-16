/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: explain-plan-view.tsx
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
import { Button } from '@/components/ui/button'
import { Play, Copy, Trash2, FileCode, Database, Activity, TableProperties, Info } from 'lucide-react'
import { useState } from 'react'

export function ExplainPlanView() {
    const [sql, setSql] = useState('')
    const [plan, setPlan] = useState<any[]>([])

    const generatePlan = () => {
        // Mock generation
        setPlan([
            { id: 0, operation: 'SELECT STATEMENT', options: '', object: '', cost: 124 },
            { id: 1, operation: ' SORT', options: 'ORDER BY', object: '', cost: 124 },
            { id: 2, operation: '  HASH JOIN', options: '', object: '', cost: 122 },
            { id: 3, operation: '   TABLE ACCESS', options: 'FULL', object: 'EMPLOYEES', cost: 45 },
            { id: 4, operation: '   TABLE ACCESS', options: 'FULL', object: 'DEPARTMENTS', cost: 76 },
        ])
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Explain Plan</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <TableProperties className="size-3" /> Oracle Optimizer Execution Plan Visualization
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                    <Card className="flex flex-col overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="py-3 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <FileCode className="size-3.5 text-primary" /> SQL Input
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                                    <Copy className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => setSql('')}>
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 relative">
                            <textarea
                                className="w-full h-full p-4 bg-transparent resize-none font-mono text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 transition-colors"
                                placeholder="Paste your SQL script here to analyze execution path..."
                                value={sql}
                                onChange={(e) => setSql(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
                                <Button size="sm" className="font-bold gap-2 shadow-lg shadow-primary/20" onClick={generatePlan} disabled={!sql}>
                                    Generate Plan <Play className="size-3.5 fill-current" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="py-3 bg-muted/20 border-b border-border/50">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Activity className="size-3.5 text-emerald-500" /> Optimizer Strategy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto bg-slate-900/5">
                            {plan.length > 0 ? (
                                <table className="w-full text-[11px] text-left">
                                    <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2 font-bold uppercase tracking-widest border-b border-slate-800">Operation</th>
                                            <th className="px-4 py-2 font-bold uppercase tracking-widest border-b border-slate-800">Options</th>
                                            <th className="px-4 py-2 font-bold uppercase tracking-widest border-b border-slate-800">Object</th>
                                            <th className="px-4 py-2 font-bold uppercase tracking-widest border-b border-slate-800 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-mono text-slate-300">
                                        {plan.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/20">
                                                <td className="px-4 py-2 whitespace-pre text-emerald-400/90 font-bold">{p.operation}</td>
                                                <td className="px-4 py-2 text-slate-400">{p.options}</td>
                                                <td className="px-4 py-2">{p.object}</td>
                                                <td className="px-4 py-2 text-right text-amber-500 font-bold">{p.cost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30 select-none">
                                    <Database className="size-16 mb-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">No Plan Available</h3>
                                    <p className="text-xs mt-2 max-w-xs">Input a SQL query and click Generate Plan to visualize the Oracle CBO execution strategy.</p>
                                </div>
                            )}
                        </CardContent>
                        {plan.length > 0 && (
                            <div className="p-2 bg-muted/10 border-t border-border/50 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Info className="size-3" />
                                <span>Note: Full table scans (FTS) detected. Index optimization suggested for object 'EMPLOYEES'.</span>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

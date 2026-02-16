/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: redo-log-view.tsx
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Database, RotateCw, History, FileText, Activity, AlertTriangle, ShieldCheck, Zap, ArrowRight, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const MOCK_GROUPS = [
    { id: 1, thread: 1, sequence: 5412, bytes: '512 MB', members: 2, status: 'CURRENT', archived: 'YES' },
    { id: 2, thread: 1, sequence: 5411, bytes: '512 MB', members: 2, status: 'ACTIVE', archived: 'YES' },
    { id: 3, thread: 1, sequence: 5410, bytes: '512 MB', members: 2, status: 'INACTIVE', archived: 'YES' }
]

export function RedoLogView() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Redo Log Groups</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <RotateCw className="size-3" /> Monitor online redo logs status and switching frequency
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                            <Zap className="size-4" /> Switch Log File
                        </Button>
                        <Button variant="default" size="sm" className="gap-2">
                            <Gauge className="size-4" /> Performance Metrics
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Health Status</div>
                                <div className="text-sm font-black text-emerald-700">OPTIMAL</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <History className="size-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Switch Rate</div>
                                <div className="text-sm font-black text-blue-700">12 mins</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="size-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Multiplexing</div>
                                <div className="text-sm font-black text-amber-700">2 Members/Grp</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50/50 border-purple-100 shadow-sm">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="size-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Archive Path</div>
                                <div className="text-sm font-black text-purple-700">VALID</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="status" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="bg-muted/10 p-1 self-start border border-border/50">
                        <TabsTrigger value="status" className="text-xs font-bold uppercase py-1.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">Live Groups</TabsTrigger>
                        <TabsTrigger value="history" className="text-xs font-bold uppercase py-1.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">Switch History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="flex-1 mt-4 space-y-4 overflow-auto pr-2 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_GROUPS.map((group) => (
                                <Card key={group.id} className={`group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative ${group.status === 'CURRENT' ? 'ring-2 ring-emerald-500/20 border-emerald-500/30' : ''}`}>
                                    {group.status === 'CURRENT' && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/5">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                GROUP {group.id}
                                                <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 uppercase">Thread {group.thread}</Badge>
                                            </CardTitle>
                                            <Badge className={`text-[9px] font-black h-4 px-1.5 border-none shadow-none ${group.status === 'CURRENT' ? 'bg-emerald-500 text-white' : group.status === 'ACTIVE' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'}`}>
                                                {group.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Size</div>
                                                <div className="text-sm font-black text-foreground">{group.bytes}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sequence</div>
                                                <div className="text-sm font-mono font-bold">#{group.sequence}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                                <span>Members Health</span>
                                                <span className="text-emerald-500">{group.members} Valid</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(group.members)].map((_, i) => (
                                                    <div key={i} className="flex-1 h-1.5 rounded-full bg-emerald-500" />
                                                ))}
                                                <div className="flex-1 h-1.5 rounded-full bg-muted" />
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between text-[10px] font-bold">
                                            <div className="text-muted-foreground uppercase tracking-wider">Archived</div>
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <ShieldCheck className="size-3" /> {group.archived}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-2 bg-muted/5 border-t border-border/30 flex justify-center">
                                        <Button variant="ghost" size="xs" className="w-full text-[10px] h-7 font-bold gap-1 text-muted-foreground hover:text-primary">
                                            View Logs <ArrowRight className="size-3" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 mt-4">
                        <Card className="border-border/50">
                            <CardContent className="p-0">
                                <div className="border border-border/50 rounded-md overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                                            <tr>
                                                <th className="px-4 py-3 font-bold uppercase tracking-widest">Date / Time</th>
                                                <th className="px-4 py-3 font-bold uppercase tracking-widest">Thread</th>
                                                <th className="px-4 py-3 font-bold uppercase tracking-widest">Sequence</th>
                                                <th className="px-4 py-3 font-bold uppercase tracking-widest">MB Switched</th>
                                                <th className="px-4 py-3 font-bold uppercase tracking-widest">Interval</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30 text-foreground font-medium">
                                            <tr className="hover:bg-muted/10 transition-colors">
                                                <td className="px-4 py-3 font-mono">2026-02-16 14:12:01</td>
                                                <td className="px-4 py-3">1</td>
                                                <td className="px-4 py-3">#5412</td>
                                                <td className="px-4 py-3 font-bold">512 MB</td>
                                                <td className="px-4 py-3">14m 22s</td>
                                            </tr>
                                            <tr className="hover:bg-muted/10 transition-colors">
                                                <td className="px-4 py-3 font-mono">2026-02-16 13:57:39</td>
                                                <td className="px-4 py-3">1</td>
                                                <td className="px-4 py-3">#5411</td>
                                                <td className="px-4 py-3 font-bold">512 MB</td>
                                                <td className="px-4 py-3">12m 45s</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

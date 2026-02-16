/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-details-view.tsx
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
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Code2, Database, Activity, FileText, Table, Clock, Zap, Loader2, Search, Link2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp, API_URL } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SqlDetailsView() {
    const { sqlId } = useParams()
    const navigate = useNavigate()
    const { logAction } = useApp()
    const [isLoading, setIsLoading] = useState(true)
    const [details, setDetails] = useState<any>(null)
    const [plan, setPlan] = useState<any[]>([])

    const fetchDetails = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/sql/${sqlId}`)
            if (res.ok) {
                const json = await res.json()
                setDetails(json)
                // Simulated plan
                setPlan([
                    { id: 0, operation: 'SELECT STATEMENT', options: '', object: '', cost: 42 },
                    { id: 1, operation: ' HASH JOIN', options: '', object: '', cost: 42 },
                    { id: 2, operation: '  TABLE ACCESS', options: 'FULL', object: 'CUSTOMERS', cost: 18 },
                    { id: 3, operation: '  TABLE ACCESS', options: 'FULL', object: 'ORDERS', cost: 24 }
                ])
                logAction('Browse', 'SQL_Details', `Viewed details for SQL ID: ${sqlId}`)
            }
        } catch (error) {
            console.error("Error fetching SQL details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (sqlId) fetchDetails()
    }, [sqlId])

    if (isLoading) {
        return (
            <MainLayout>
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-muted">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                            <Code2 className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">SQL Profile Details</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] font-bold border-primary/30">SQL_ID: {sqlId}</Badge>
                                <Badge variant="secondary" className="text-[10px] font-bold bg-muted text-muted-foreground border-none tracking-widest uppercase">Oracle Hash: {details?.hash_value}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-auto pr-2 pb-6">
                    <div className="lg:col-span-12 space-y-6">
                        {/* SQL Text Area */}
                        <Card className="border-border/50 shadow-sm overflow-hidden group">
                            <CardHeader className="py-3 bg-muted/10 border-b border-border/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                    <FileText className="size-3.5" /> Source Query
                                </CardTitle>
                                <Button variant="ghost" size="xs" className="h-6 gap-1 text-[10px] font-bold uppercase" onClick={() => navigate(`/sql-central?script=sessions_sqlid.sql&sid=0&serial=0`)}>
                                    <Link2 className="size-3" /> Explore in SQL Central
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 bg-slate-900 text-emerald-400 font-mono text-sm leading-relaxed overflow-auto max-h-[300px]">
                                    {details?.sql_text || '-- No SQL text available'}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <MetricCard title="Executions" value={details?.executions || 0} icon={<Activity className="size-4 text-primary" />} />
                            <MetricCard title="CPU Time" value={`${details?.cpu_time || 0}ms`} icon={<Zap className="size-4 text-amber-500" />} />
                            <MetricCard title="Disk Reads" value={details?.disk_reads || 0} icon={<Database className="size-4 text-blue-500" />} />
                            <MetricCard title="Optimizer" value={details?.optimizer_mode || 'N/A'} icon={<Search className="size-4 text-emerald-500" />} subtitle="Mode" />
                        </div>

                        <Tabs defaultValue="plan" className="w-full">
                            <TabsList className="bg-muted/10 p-1 border border-border/50">
                                <TabsTrigger value="plan" className="text-[10px] font-black uppercase px-6">Execution Plan</TabsTrigger>
                                <TabsTrigger value="stats" className="text-[10px] font-black uppercase px-6">Detailed Stats</TabsTrigger>
                            </TabsList>
                            <TabsContent value="plan" className="mt-4">
                                <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-sm">
                                    <CardContent className="p-0">
                                        <table className="w-full text-[11px] text-left">
                                            <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                                                <tr>
                                                    <th className="px-4 py-2 font-black uppercase tracking-widest">ID</th>
                                                    <th className="px-4 py-2 font-black uppercase tracking-widest">Operation</th>
                                                    <th className="px-4 py-2 font-black uppercase tracking-widest">Object</th>
                                                    <th className="px-4 py-2 font-black uppercase tracking-widest text-right">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-mono divide-y divide-border/20">
                                                {plan.map((p, i) => (
                                                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                                                        <td className="px-4 py-2 text-muted-foreground">{p.id}</td>
                                                        <td className="px-4 py-2 font-bold">{p.operation}</td>
                                                        <td className="px-4 py-2 text-primary">{p.object}</td>
                                                        <td className="px-4 py-2 text-right font-black text-foreground">{p.cost}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="stats">
                                <div className="py-12 text-center text-muted-foreground opacity-50 space-y-2">
                                    <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                                    <p className="font-bold uppercase tracking-widest text-[10px]">Fetching wait events data...</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

function MetricCard({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle?: string }) {
    return (
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="size-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{title}</div>
                    <div className="text-lg font-black text-foreground truncate">{value}</div>
                    {subtitle && <div className="text-[9px] font-bold text-muted-foreground/60 -mt-1">{subtitle}</div>}
                </div>
            </CardContent>
        </Card>
    )
}

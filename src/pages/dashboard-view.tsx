/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: dashboard-view.tsx
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
import { Progress } from '@/components/ui/progress'
import { Database, Users, Cpu, Activity, AlertCircle, Clock, Zap, Server, ShieldCheck, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp, API_URL } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useNavigate } from 'react-router-dom'

export function DashboardView() {
    const { logAction } = useApp()
    const navigate = useNavigate()
    const [stats, setStats] = useState<any>({
        sessions: { active: 0, total: 0 },
        sga: { total: '0 GB', pct_used: 0 },
        objects: { invalid: 0, total: 0 },
        cursors: 0,
        triggers: 0,
        longOps: [],
        sysaux: { usedMb: 0, totalMb: 0 },
        rac: { instances: [] },
        version: 'Unknown',
        archivelog: 'Unknown'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/dashboard/stats`)
            if (res.ok) setStats(await res.json())
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Oracle Dashboard</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Server className="size-3" /> Oracle Database {stats.version} | {stats.archivelog} Mode
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search metrics..."
                                className="pl-9 h-9 bg-muted/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                            onClick={fetchStats}
                            disabled={isLoading}
                        >
                            <Zap className={`mr-2 h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
                            Live
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Active Sessions */}
                    <Card className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sessions.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-blue-500 font-semibold">{stats.sessions.total}</span> total database connections
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => navigate('/sessions')}>View Details</Badge>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/10">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(stats.sessions.active / stats.sessions.total) * 100}%` }} />
                        </div>
                    </Card>

                    {/* Memory SGA Usage */}
                    <Card className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-amber-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SGA Usage</CardTitle>
                            <Cpu className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sga.total}</div>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Used Capacity</span>
                                    <span className="font-semibold text-amber-600">{stats.sga.pct_used}%</span>
                                </div>
                                <Progress value={stats.sga.pct_used} className="h-1.5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invalid Objects */}
                    <Card className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-rose-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Health Check</CardTitle>
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.objects.invalid}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Invalid database objects found
                            </p>
                            <div className="mt-4 flex gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="destructive" className="text-[10px] cursor-help">Critical</Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>Recompilation suggested</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Indicators */}
                    <Card className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resources</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <div className="text-lg font-bold">{stats.cursors}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Cursors</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold">{stats.triggers}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Triggers</div>
                                </div>
                            </div>
                            <div className="absolute right-4 bottom-4 opacity-5">
                                <Database className="size-16" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* RAC Instances Status */}
                    <Card className="lg:col-span-1 border-none shadow-sm bg-muted/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Server className="size-4 text-primary" /> RAC Cluster Status
                                <Badge variant="outline" className="ml-auto text-[10px] font-normal">{stats.rac.instances.length} Nodes</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.rac.instances.map((inst: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border group transition-all hover:border-primary/50">
                                        <div className={`size-2 rounded-full ${inst.status === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'} animate-pulse`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold truncate">INSTANCE {inst.id}</div>
                                            <div className="text-[10px] text-muted-foreground">{inst.host}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4">{inst.status}</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-border/50">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3">SYSAUX TBS Usage</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Capacity</span>
                                        <span>{Math.round((stats.sysaux.usedMb / stats.sysaux.totalMb) * 100)}%</span>
                                    </div>
                                    <Progress value={(stats.sysaux.usedMb / stats.sysaux.totalMb) * 100} className="h-1 bg-muted" />
                                    <p className="text-[9px] text-muted-foreground">{stats.sysaux.usedMb} MB used of {stats.sysaux.totalMb} MB</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Long Running Operations */}
                    <Card className="lg:col-span-2 border-none shadow-sm pb-2">
                        <CardHeader className="flex flex-row items-center border-b border-border/50 pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="size-4 text-primary" /> Active Operations
                                </CardTitle>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Real-time status of long-running database tasks</p>
                            </div>
                            <Button variant="ghost" size="xs" className="ml-auto text-[10px] h-6" onClick={() => navigate('/sessions')}>
                                Full Table
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-auto max-h-[320px]">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/30 text-muted-foreground sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Operation</th>
                                            <th className="px-4 py-2 font-medium">Progress</th>
                                            <th className="px-4 py-2 font-medium text-right">Time Left</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {stats.longOps.length > 0 ? (
                                            stats.longOps.map((op: any, i: number) => (
                                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-primary">{op.opname}</div>
                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Activity className="size-2.5" /> SID: {op.sid}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 min-w-[120px]">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                                                                <div
                                                                    className="bg-primary h-full transition-all duration-500"
                                                                    style={{ width: `${op.percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold w-6">{op.percentage}%</span>
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground truncate italic">{op.target}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Badge variant="secondary" className="font-mono text-[9px] h-5">{op.time_remaining || 'Calculating...'}</Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                                        <ShieldCheck className="size-10" />
                                                        <p className="text-sm font-medium">System Idle</p>
                                                        <p className="text-[10px]">No long-running operations detected</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

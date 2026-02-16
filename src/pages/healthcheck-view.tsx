/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: healthcheck-view.tsx
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
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, Copy, RefreshCw, Info, Lock, Key, Activity, Heart } from 'lucide-react'
import { useApp, API_URL } from '@/context/app-context'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function HealthCheckView() {
    const { logAction } = useApp()
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({ pass: 0, fail: 0, total: 0, score: 0 })

    const runCheck = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/healthcheck/run`)
            if (res.ok) {
                const data = await res.json()
                setResults(data)

                const pass = data.filter((r: any) => r.status === 'PASS').length
                const total = data.length
                setStats({
                    pass,
                    fail: total - pass,
                    total,
                    score: Math.round((pass / total) * 100)
                })
                logAction('Audit', 'HealthCheck', `Executed. Score: ${Math.round((pass / total) * 100)}%`)
            }
        } catch (error) {
            console.error('Error running health check:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        runCheck()
    }, [])

    const copySql = (sql: string) => {
        navigator.clipboard.writeText(sql)
        // could add toast
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Health & Security Audit</h1>
                        <p className="text-muted-foreground text-sm">Automated evaluation of Oracle parameters and best practices</p>
                    </div>
                    <Button onClick={runCheck} disabled={isLoading} className="gap-2">
                        <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Run Analysis
                    </Button>
                </div>

                {/* Score Summary */}
                <Card className="bg-muted/30 border-none">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl border border-border">
                                <Activity className="size-5 text-muted-foreground mb-2" />
                                <div className="text-3xl font-bold">{stats.score}%</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Overall Health Score</div>
                            </div>
                            <div className="md:col-span-3 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Heart className="size-4 text-rose-500 fill-rose-500" />
                                            <span className="font-bold">{stats.pass} / {stats.total} Checks Passed</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">The system detected {stats.fail} items that need attention based on Oracle security benchmarks.</p>
                                    </div>
                                    <Badge variant={stats.score > 80 ? 'default' : 'destructive'} className="h-6">
                                        {stats.score > 80 ? 'Optimized' : 'Needs Attention'}
                                    </Badge>
                                </div>
                                <Progress value={stats.score} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between border-b border-border pb-px">
                        <TabsList className="bg-transparent h-10 p-0 gap-6">
                            <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-10">All Checks</TabsTrigger>
                            <TabsTrigger value="failed" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-rose-500 rounded-none px-0 h-10 text-rose-600">Failed / Remediation</TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none px-0 h-10">Security Only</TabsTrigger>
                        </TabsList>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest hidden md:block">
                            Oracle 19c Compliance Baseline
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto mt-4 pr-2 space-y-4">
                        <TabsContent value="all" className="m-0 space-y-3">
                            {results.map((check, i) => (
                                <HealthCheckItem key={i} check={check} onCopy={copySql} />
                            ))}
                        </TabsContent>
                        <TabsContent value="failed" className="m-0 space-y-3">
                            {results.filter(r => r.status === 'FAIL').map((check, i) => (
                                <HealthCheckItem key={i} check={check} onCopy={copySql} />
                            ))}
                            {stats.fail === 0 && !isLoading && (
                                <div className="py-20 text-center space-y-3 opacity-50">
                                    <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                                    <p className="text-lg font-bold">Perfect Score!</p>
                                    <p className="text-sm">No critical issues detected in this environment.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="security" className="m-0 space-y-3">
                            {results.filter(r => r.category === 'SECURITY').map((check, i) => (
                                <HealthCheckItem key={i} check={check} onCopy={copySql} />
                            ))}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

function HealthCheckItem({ check, onCopy }: { check: any, onCopy: (sql: string) => void }) {
    const isPass = check.status === 'PASS'
    const isSecurity = check.category === 'SECURITY'

    return (
        <Card className={`overflow-hidden border-l-4 ${isPass ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
            <CardContent className="p-0">
                <div className="p-4 flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full ${isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPass ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{check.name}</span>
                            {isSecurity && <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[9px] h-4 py-0"><Lock className="size-2 mr-1" /> SECURITY</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{check.description}</p>

                        {!isPass && (
                            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Current Value</div>
                                    <div className="px-2 py-1 bg-muted rounded text-xs font-mono truncate">{check.current_value}</div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase text-emerald-600">Recommended Policy</div>
                                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs font-mono truncate font-bold">{check.recommended}</div>
                                </div>

                                {check.sql && (
                                    <div className="md:col-span-2 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                <Key className="size-2.5" /> Remediation SQL
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => onCopy(check.sql)}>
                                                <Copy className="size-3" />
                                            </Button>
                                        </div>
                                        <div className="p-2 bg-slate-900 text-slate-100 rounded text-[10px] font-mono whitespace-pre-wrap overflow-x-auto border-none">
                                            {check.sql}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

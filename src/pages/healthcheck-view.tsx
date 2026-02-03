import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Activity, AlertTriangle, CheckCircle, Terminal, Copy, RefreshCw } from 'lucide-react'
import { API_URL } from '@/context/app-context'
import { twMerge } from 'tailwind-merge'

interface Finding {
    category: string
    item: string
    status: 'Critical' | 'Warning' | 'Recommended' | 'Notice'
    current: string
    suggested: string
    description: string
    fix_sql: string
    restart_required: boolean
}

export function HealthcheckView() {
    const [findings, setFindings] = useState<Finding[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('all')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/healthcheck`)
            if (res.ok) {
                setFindings(await res.json())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const categories = ['all', ...new Set(findings.map(f => f.category.toLowerCase()))]
    const filteredFindings = activeTab === 'all'
        ? findings
        : findings.filter(f => f.category.toLowerCase() === activeTab)

    const allFixSql = findings.map(f => f.fix_sql).join('\n')

    return (
        <MainLayout>
            <div className="p-6 space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
                        <ShieldCheck className="h-7 w-7" />
                        Database Health & Tuning Advisor
                    </h1>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="gap-2">
                        <RefreshCw className={twMerge("size-4", isLoading && "animate-spin")} />
                        Run Diagnostic
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <Card className="bg-blue-500/5 border-blue-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Findings</p>
                                <p className="text-xl font-bold">{findings.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/5 border-amber-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Warnings</p>
                                <p className="text-xl font-bold text-amber-600">{findings.filter(f => f.status === 'Warning').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/5 border-green-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <CheckCircle className="size-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Recommendations</p>
                                <p className="text-xl font-bold text-green-600">{findings.filter(f => f.status === 'Recommended').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/5 border-purple-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <Terminal className="size-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Scripts Ready</p>
                                <p className="text-xl font-bold text-purple-600">YES</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="flex justify-between items-center border-b pr-4">
                            <TabsList className="h-10 p-0 bg-transparent rounded-none">
                                {categories.map(cat => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-xs font-semibold uppercase tracking-wider transition-none"
                                    >
                                        {cat}
                                    </TabsTrigger>
                                ))}
                                <TabsTrigger
                                    value="scripts"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-xs font-semibold uppercase tracking-wider transition-none"
                                >
                                    Consolidated Fix SQL
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50/50 p-4 min-h-0">
                            <TabsContent value="scripts" className="mt-0 h-full">
                                <Card className="h-full border-0 shadow-none bg-slate-900 overflow-hidden flex flex-col">
                                    <div className="p-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Terminal className="size-4" />
                                            <span className="text-xs font-mono">Tuning_Scripts_Consolidated.sql</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-slate-300 hover:bg-slate-800 gap-2"
                                            onClick={() => navigator.clipboard.writeText(allFixSql)}
                                        >
                                            <Copy className="size-3" /> Copy All
                                        </Button>
                                    </div>
                                    <div className="flex-1 p-4 overflow-auto font-mono text-xs text-blue-300 bg-slate-950">
                                        <pre>{allFixSql || '-- No scripts generated or all checks passed.'}</pre>
                                    </div>
                                </Card>
                            </TabsContent>

                            {categories.filter(c => c !== 'scripts').map(cat => (
                                <TabsContent key={cat} value={cat} className="mt-0 h-full space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredFindings.length > 0 ? filteredFindings.map((f, i) => (
                                            <Card key={i} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="space-y-1 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-bold text-foreground capitalize">{f.item}</span>
                                                                <Badge variant={f.status === 'Warning' ? 'destructive' : f.status === 'Recommended' ? 'secondary' : 'outline'} className="text-[9px] h-4 uppercase px-1.5">
                                                                    {f.status}
                                                                </Badge>
                                                                {f.restart_required && (
                                                                    <Badge variant="outline" className="text-[9px] h-4 uppercase border-amber-500 text-amber-600 font-bold">
                                                                        RESTART REQ.
                                                                    </Badge>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{f.category}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{f.description}</p>
                                                            <div className="grid grid-cols-2 gap-4 pt-3">
                                                                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                                    <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Current State</p>
                                                                    <p className="text-xs font-mono font-semibold truncate" title={f.current}>{f.current}</p>
                                                                </div>
                                                                <div className="bg-primary/5 p-2 rounded border border-primary/10">
                                                                    <p className="text-[9px] uppercase font-bold text-primary mb-1">RockDB Suggested</p>
                                                                    <p className="text-xs font-mono font-bold text-primary">{f.suggested}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-900 rounded-lg p-3 w-72 shrink-0 group relative overflow-hidden">
                                                            <p className="text-[9px] uppercase font-bold text-slate-500 mb-2">Correction SQL</p>
                                                            <code className="text-[10px] text-blue-300 font-mono block break-all leading-relaxed pr-6">
                                                                {f.fix_sql}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => navigator.clipboard.writeText(f.fix_sql)}
                                                            >
                                                                <Copy className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-white rounded-lg border border-dashed border-border/60">
                                                <div className="p-3 bg-green-500/10 rounded-full text-green-600">
                                                    <CheckCircle className="size-8" />
                                                </div>
                                                <div className="max-w-xs">
                                                    <h3 className="text-sm font-bold">Optimization Optimal</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        No critical findings detected for this category. Your database aligns with RockDB best practices.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    )
}

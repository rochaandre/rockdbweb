
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { API_URL, useApp } from '@/context/app-context'
import {
    PieChartView,
    BarChartView,
    LineChartView,
    GaugeChartView
} from '@/components/sql/sql-charts'
import {
    Loader2,
    LayoutDashboard,
    ChevronRight,
    Database,
    AlertCircle,
    Maximize2
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface SqlScript {
    id: number
    name: string
    link_label: string
    link_url: string
    codmenutype: number
    type_icon: string
}

interface ChartCardProps {
    script: SqlScript
}

function ChartCard({ script }: ChartCardProps) {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch content first
                const contentRes = await fetch(`${API_URL}/sql/content?path=${encodeURIComponent(script.link_url)}`)
                const contentData = await contentRes.json()

                if (!contentData.content) throw new Error("Could not load script content")

                // Execute
                const execRes = await fetch(`${API_URL}/sql/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sql_text: contentData.content })
                })
                const execData = await execRes.json()

                if (execData.type === 'error') {
                    setError(execData.message)
                } else if (execData.type === 'grid') {
                    setData(execData.data)
                } else {
                    setData([])
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [script.link_url])

    const renderChart = () => {
        if (data.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] italic">No data</div>

        switch (script.codmenutype) {
            case 2: return <PieChartView data={data} />
            case 3: return <BarChartView data={data} />
            case 4: return <GaugeChartView data={data} />
            case 6: return <LineChartView data={data} />
            default: return <BarChartView data={data} />
        }
    }

    return (
        <Card className="flex flex-col h-[280px] overflow-hidden group hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-3 space-y-0 flex flex-row items-center justify-between border-b bg-muted/20">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <CardTitle className="text-[11px] font-bold truncate uppercase tracking-tight" title={script.link_label}>
                        {script.link_label}
                    </CardTitle>
                    <div className="text-[9px] text-muted-foreground truncate opacity-70">
                        {script.link_url}
                    </div>
                </div>
                <Link to={`/sql-central`} className="p-1 hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100">
                    <Maximize2 className="h-3 w-3 text-muted-foreground" />
                </Link>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-hidden relative">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary opacity-50" />
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-2 text-red-500 gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-[9px] font-mono whitespace-normal line-clamp-3">{error}</span>
                    </div>
                ) : (
                    <div className="h-full w-full">
                        {renderChart()}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function SqlDashboardView() {
    const { connection } = useApp()
    const [scripts, setScripts] = useState<SqlScript[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const res = await fetch(`${API_URL}/sql/registry`)
                const data = await res.json()
                // Filter for chart types (2: Pie, 3: Bar, 4: Gauge, 6: Line)
                const chartScripts = data.filter((s: SqlScript) => [2, 3, 4, 6].includes(s.codmenutype))
                setScripts(chartScripts)
            } catch (err) {
                console.error("Failed to fetch registry", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRegistry()
    }, [])

    // Group by category (folder)
    const grouped = scripts.reduce((acc: any, s) => {
        const parts = s.link_url.split('/')
        // Category is the folder after oracle/ (e.g. pie/sga -> "sga")
        const category = parts.length > 3 ? parts[parts.length - 2] : parts[0]
        const cleanCategory = category.replace(/_/g, ' ').toUpperCase()

        if (!acc[cleanCategory]) acc[cleanCategory] = []
        acc[cleanCategory].push(s)
        return acc
    }, {})

    if (connection.status !== 'Connected') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 opacity-50">
                <Database className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-bold">No Active Connection</h2>
                <p className="text-sm text-muted-foreground">Connect to a database to view the dashboard reports.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden px-2">
            <header className="h-12 border-b px-6 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight uppercase">SQL Dashboard</h1>
                        <p className="text-[10px] text-muted-foreground -mt-0.5">Automated visual reports and metrics</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-mono h-6 px-2 bg-muted/50">
                        {scripts.length} ACTIVE REPORTS
                    </Badge>
                </div>
            </header>

            <ScrollArea className="flex-1">
                <div className="p-6 pb-20 space-y-10 max-w-[1600px] mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground animate-pulse">Analyzing script registry and fetching metrics...</p>
                        </div>
                    ) : Object.keys(grouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">No charts found in SQL Central.</p>
                            <p className="text-xs text-muted-foreground">Charts are automatically detected from the 'pie', 'line', and 'gauge' folders.</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]: [string, any]) => (
                            <section key={category} className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <h2 className="text-[12px] font-black tracking-[0.1em] text-foreground/80 flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3 text-primary" />
                                        {category}
                                    </h2>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-muted to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {items.map((script: SqlScript) => (
                                        <ChartCard key={script.id} script={script} />
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { API_URL } from '@/context/app-context'
import { Terminal, Copy, ExternalLink, Activity, Clock, Database, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SQLDetailsPanelProps {
    sqlId: string | null
    sid: number | null
}

export function SQLDetailsPanel({ sqlId, sid }: SQLDetailsPanelProps) {
    const navigate = useNavigate()
    const [sqlText, setSqlText] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!sqlId) return

        const fetchSql = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`${API_URL}/sessions/sql/${sqlId}`)
                if (res.ok) {
                    const data = await res.json()
                    setSqlText(data.sql_text || 'No SQL text available')
                } else {
                    setSqlText('Failed to fetch SQL text')
                }
            } catch (error) {
                console.error('Error fetching SQL:', error)
                setSqlText('Error connecting to backend')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSql()
    }, [sqlId])

    if (!sqlId) {
        return (
            <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2">
                <Database className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Select a session to view SQL details</p>
                <p className="text-xs text-muted-foreground/60 mt-2">Active SQL statements will be displayed here</p>
            </Card>
        )
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sqlText)
    }

    return (
        <Card className="flex-1 flex flex-col min-h-0 bg-card/50 backdrop-blur-sm shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="py-4 px-5 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Terminal className="size-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                SQL Details
                                <Badge variant="outline" className="font-mono bg-background/50">{sqlId}</Badge>
                            </CardTitle>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">Active Session SID: {sid}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="size-8" onClick={copyToClipboard} title="Copy SQL">
                            <Copy className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(`/sql-central/sqlarea_replace?SQL_ID=${sqlId}`)} title="Open in SQL Central">
                            <ExternalLink className="size-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                {/* Stats Strip */}
                <div className="flex items-center gap-4 px-5 py-2.5 bg-background/40 border-b text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="size-3 text-amber-500" />
                        <span>Execution: 1.2s</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l pl-4">
                        <Activity className="size-3 text-emerald-500" />
                        <span>CPU: 450ms</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l pl-4">
                        <Database className="size-3 text-blue-500" />
                        <span>Buffer Gets: 12.5k</span>
                    </div>
                </div>

                {/* SQL Code Area */}
                <div className="flex-1 bg-zinc-950 font-mono text-[13px] leading-relaxed p-5 text-zinc-300 relative overflow-auto custom-scrollbar group">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse flex items-center gap-2 text-zinc-500">
                                <Activity className="size-4 animate-spin" />
                                <span>Loading metadata...</span>
                            </div>
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap selection:bg-primary/30">
                            {sqlText}
                        </pre>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-muted/20 border-t flex gap-3">
                    <Button
                        className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all active:scale-95"
                        onClick={() => navigate(`/explain-plan/${sqlId}`)}
                    >
                        Explain Plan
                        <ChevronRight className="size-3.5 ml-1.5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-9 border-primary/20 hover:bg-primary/5 text-primary text-xs font-semibold"
                        onClick={() => navigate(`/sql-report/statistics/${sqlId}`)}
                    >
                        Full Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

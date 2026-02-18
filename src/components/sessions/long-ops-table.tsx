import { twMerge } from 'tailwind-merge'
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { Skull, FileText, Activity, Loader2, Database } from "lucide-react"
import { useState, useEffect } from 'react'
import { API_URL } from '@/context/app-context'

export interface LongOpsTableProps {
    onSelect?: (sid: number) => void
    onAction?: (action: string, session: any) => void
    selectedId?: number | null
    instId?: number
    refreshKey?: number
}

export function LongOpsTable({ onSelect, onAction, selectedId, instId, refreshKey }: LongOpsTableProps) {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLongOps = async () => {
        setIsLoading(true)
        try {
            const instParam = instId ? `?inst_id=${instId}` : ""
            const res = await fetch(`${API_URL}/sessions/longops${instParam}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Error fetching long ops:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLongOps()
    }, [instId, refreshKey])



    return (
        <div className="flex-1 overflow-auto bg-surface border border-border rounded-md shadow-sm">
            <div className="min-w-[1400px]">
                {/* Header */}
                <div className="flex h-8 w-full items-center bg-muted/50 text-[11px] font-bold text-muted-foreground sticky top-0 z-10 border-b border-border shadow-sm">
                    <div className="w-10 px-1 text-center shrink-0 border-r border-border/50">INST</div>
                    <div className="w-14 px-1 text-center shrink-0 border-r border-border/50">SID</div>
                    <div className="w-20 px-1 shrink-0 border-r border-border/50 text-center">ELAPSED</div>
                    <div className="w-20 px-1 shrink-0 border-r border-border/50 text-center text-amber-600">REMAIN</div>
                    <div className="w-24 px-1 shrink-0 border-r border-border/50 text-center">PCT %</div>
                    <div className="w-40 px-2 shrink-0 border-r border-border/50 flex items-center justify-center">PROGRESS</div>
                    <div className="w-32 px-1 shrink-0 border-r border-border/50 text-center">STARTED</div>
                    <div className="w-20 px-1 shrink-0 border-r border-border/50 text-center text-blue-600">COMPL.</div>
                    <div className="w-28 px-1 shrink-0 border-r border-border/50 text-center font-mono">SQL_ID</div>
                    <div className="flex-1 px-2 shrink-0 min-w-[300px]">MESSAGE</div>
                </div>

                {/* Rows */}
                {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <Loader2 className="mx-auto size-8 animate-spin mb-4" />
                        <p>Loading long operations...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <p>No active long operations found.</p>
                    </div>
                ) : (
                    data.map((op, idx) => {
                        const isSelected = selectedId === op.sid

                        return (
                            <ContextMenu
                                key={`${op.sid}-${op.serial}-${idx}`}
                                trigger={
                                    <div
                                        className={twMerge(
                                            "group flex h-9 items-center border-b border-border/50 text-xs transition-colors hover:bg-muted/50 cursor-pointer select-none",
                                            isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-surface odd:bg-secondary/5"
                                        )}
                                        onClick={() => onSelect?.(op.sid)}
                                    >
                                        <div className="w-10 px-1 text-center shrink-0 border-r border-border/50 font-mono opacity-60 text-[10px]">{op.inst_id}</div>
                                        <div className="w-14 px-1 text-center shrink-0 border-r border-border/50 font-mono">{op.sid}</div>
                                        <div className="w-20 px-1 text-center shrink-0 border-r border-border/50 font-mono text-[10px]">{op.elapsed_seconds}s</div>
                                        <div className={twMerge("w-20 px-1 text-center shrink-0 border-r border-border/50 font-bold", isSelected ? "text-white" : "text-amber-600")}>
                                            {op.time_remaining}s
                                        </div>
                                        <div className="w-24 px-1 text-center shrink-0 border-r border-border/50 font-bold">{op.pct}%</div>
                                        <div className="w-40 px-2 shrink-0 border-r border-border/50 flex items-center justify-center">
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800 border border-gray-300">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                    style={{ width: `${op.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-32 px-1 text-center shrink-0 border-r border-border/50 font-mono text-[10px] opacity-80">{op.start_tim}</div>
                                        <div className={twMerge("w-20 px-1 text-center shrink-0 border-r border-border/50 font-bold", isSelected ? "text-white" : "text-blue-600")}>
                                            {op.tim}
                                        </div>
                                        <div className="w-28 px-1 shrink-0 border-r border-border/50 text-center font-mono text-[10px] text-blue-500 hover:underline">{op.sql_id}</div>
                                        <div className="flex-1 px-2 shrink-0 truncate opacity-80" title={op.message}>
                                            {op.message}
                                        </div>
                                    </div>
                                }
                            >
                                <ContextMenuItem onClick={() => onAction?.('KILL_SESSION', op)}>
                                    <Skull className="mr-2 h-4 w-4 text-destructive" />
                                    <span className="text-destructive">Kill Session</span>
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => onAction?.('SHOW_SQL', op)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Show SQL
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => onAction?.('SQL_CENTRAL', op)}>
                                    <Database className="mr-2 h-4 w-4 text-primary" />
                                    Show in SQL Central
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => onAction?.('TRACE_SESSION', op)}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Trace Session
                                </ContextMenuItem>
                            </ContextMenu>
                        )
                    })
                )}
            </div>
        </div>
    )
}

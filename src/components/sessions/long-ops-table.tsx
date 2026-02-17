import { twMerge } from 'tailwind-merge'
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { Skull, FileText, Activity, Loader2 } from "lucide-react"
import { useState, useEffect } from 'react'
import { API_URL } from '@/context/app-context'

export interface LongOpsTableProps {
    onSelect?: (op: any) => void
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

    // Helper to calculate percentage and render progress bar
    const renderProgressBar = (sofar: number, totalwork: number) => {
        if (totalwork === 0) return <div className="h-2 w-full bg-gray-100 rounded-full" />

        const pct = Math.min(100, Math.max(0, (sofar / totalwork) * 100))
        const pctStr = pct.toFixed(1) + '%'

        return (
            <div className="flex flex-col gap-1 w-full max-w-[140px]">
                <div className="flex justify-between text-[10px] text-muted-foreground leading-none">
                    <span>{pctStr}</span>
                    <span>{sofar} / {totalwork}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: pctStr }}
                    />
                </div>
            </div>
        )
    }

    // Helper to format remaining time
    const formatTimeRemaining = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        const mins = Math.floor(seconds / 60)
        return `${mins}m`
    }

    return (
        <div className="flex-1 overflow-auto bg-surface">
            <div className="min-w-[1000px] border-b border-border">
                {/* Header */}
                <div className="flex h-8 w-full items-center bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0 z-10 border-b border-border">
                    <div className="w-12 px-2 text-center shrink-0 border-r border-border/50">INST</div>
                    <div className="w-16 px-2 text-center shrink-0 border-r border-border/50">SID</div>
                    <div className="w-16 px-2 text-center shrink-0 border-r border-border/50">Serial#</div>
                    <div className="w-32 px-2 shrink-0 border-r border-border/50">Username</div>
                    <div className="w-40 px-2 shrink-0 border-r border-border/50">OpName</div>
                    <div className="w-40 px-2 shrink-0 border-r border-border/50">Target</div>
                    <div className="w-40 px-2 shrink-0 border-r border-border/50">Progress</div>
                    <div className="w-20 px-2 shrink-0 border-r border-border/50 text-center">Remaining</div>
                    <div className="flex-1 px-2 shrink-0 min-w-[200px]">Message</div>
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
                                            isSelected ? "bg-blue-50/80 dark:bg-blue-950/30" : "bg-surface"
                                        )}
                                        onClick={() => onSelect?.(op)}
                                    >
                                        <div className="w-12 px-2 text-center shrink-0 border-r border-border/50 font-mono text-muted-foreground opacity-60">{op.inst_id}</div>
                                        <div className="w-16 px-2 text-center shrink-0 border-r border-border/50 font-mono text-muted-foreground">{op.sid}</div>
                                        <div className="w-16 px-2 text-center shrink-0 border-r border-border/50 font-mono text-muted-foreground">{op.serial}</div>
                                        <div className="w-32 px-2 shrink-0 border-r border-border/50 font-medium truncate" title={op.username}>{op.username}</div>
                                        <div className="w-40 px-2 shrink-0 border-r border-border/50 truncate" title={op.opname}>{op.opname}</div>
                                        <div className="w-40 px-2 shrink-0 border-r border-border/50 truncate font-mono text-[11px]" title={op.target}>{op.target}</div>
                                        <div className="w-40 px-2 shrink-0 border-r border-border/50 flex items-center">
                                            {renderProgressBar(op.sofar, op.totalwork)}
                                        </div>
                                        <div className="w-20 px-2 shrink-0 border-r border-border/50 text-center font-mono">
                                            {formatTimeRemaining(op.time_remaining)}
                                        </div>
                                        <div className="flex-1 px-2 shrink-0 truncate text-muted-foreground" title={op.message}>
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

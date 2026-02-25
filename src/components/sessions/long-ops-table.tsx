import { twMerge } from 'tailwind-merge'
import { Skull, FileText, Activity, Database } from "lucide-react"
import { useState, useEffect } from 'react'
import { API_URL } from '@/context/app-context'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

export interface LongOpSession {
    inst_id: number
    sid: number
    serial: number
    elapsed_seconds: number
    time_remaining: number
    pct: number
    start_tim: string
    tim: string
    sql_id?: string
    message: string
}

export interface LongOpsTableProps {
    onSelect?: (sid: number) => void
    onAction?: (action: string, session: any) => void
    selectedId?: number | null
    instId?: number
    refreshKey?: number
    data?: LongOpSession[]
}

export function LongOpsTable({ onSelect, onAction, selectedId, instId, refreshKey, data: propData }: LongOpsTableProps) {
    const [data, setData] = useState<LongOpSession[]>(propData || [])
    const [isLoading, setIsLoading] = useState(!propData)
    const [menuOpen, setMenuOpen] = useState(false)
    const [selectedOp, setSelectedOp] = useState<LongOpSession | null>(null)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

    const virtualAnchor = {
        getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            x: menuPosition.x,
            y: menuPosition.y,
            top: menuPosition.y,
            left: menuPosition.x,
            right: menuPosition.x,
            bottom: menuPosition.y,
            toJSON: () => { }
        })
    }

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
        if (propData) {
            setData(propData)
            setIsLoading(false)
        } else {
            fetchLongOps()
        }
    }, [instId, refreshKey, propData])

    const handleContextMenu = (e: React.MouseEvent, op: LongOpSession) => {
        e.preventDefault()
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setSelectedOp(op)
        setMenuOpen(true)
    }

    return (
        <div className="flex-1 overflow-auto border border-border/40 bg-surface/30 backdrop-blur-sm rounded-xl shadow-inner relative ring-1 ring-white/10 group/table">
            <div className="min-w-[1400px]">
                {/* Modern Header */}
                <div className="flex h-10 w-full items-center bg-surface-raised/80 backdrop-blur-md sticky top-0 z-20 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm ring-1 ring-black/5 divide-x divide-border/10">
                    <div className="w-12 px-3 text-center shrink-0">INST</div>
                    <div className="w-16 px-3 text-center shrink-0">SID</div>
                    <div className="w-24 px-3 text-center shrink-0">ELAPSED</div>
                    <div className="w-24 px-3 text-center shrink-0 text-amber-500">REMAIN</div>
                    <div className="w-24 px-3 text-center shrink-0">PCT %</div>
                    <div className="w-48 px-4 shrink-0 flex items-center justify-center">PROGRESS</div>
                    <div className="w-40 px-3 shrink-0 text-center">STARTED</div>
                    <div className="w-24 px-3 shrink-0 text-center text-primary">COMPL.</div>
                    <div className="w-32 px-3 shrink-0 text-center">SQL_ID</div>
                    <div className="flex-1 px-4 shrink-0 min-w-[300px]">MESSAGE</div>
                </div>

                {/* Rows */}
                {isLoading ? (
                    <div className="py-24 text-center">
                        <Activity className="mx-auto size-10 text-primary animate-pulse mb-4" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Gathering Operation Metrics...</h3>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="size-16 rounded-3xl bg-surface-raised border border-border/40 flex items-center justify-center mx-auto mb-4 shadow-xl">
                            <Activity className="size-8 text-muted-foreground/20" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No Long Operations</h3>
                        <p className="text-[10px] text-muted-foreground/30 mt-1">Database is performing within optimal latency parameters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/10">
                        {data.map((op, idx) => {
                            const isSelected = selectedId === op.sid

                            return (
                                <div
                                    key={`${op.sid}-${op.serial}-${idx}`}
                                    onContextMenu={(e) => handleContextMenu(e, op)}
                                    className={twMerge(
                                        "group flex h-10 items-center text-[11px] transition-all duration-75 cursor-pointer select-none divide-x divide-border/5",
                                        isSelected
                                            ? "bg-primary/20 text-primary-foreground font-bold shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)] ring-1 ring-primary/30 relative z-10"
                                            : "hover:bg-primary/5 odd:bg-muted/5 text-foreground/80 hover:text-foreground"
                                    )}
                                    onClick={() => onSelect?.(op.sid)}
                                >
                                    <div className="w-12 px-3 text-center shrink-0 font-mono opacity-60 text-[10px]">{op.inst_id}</div>
                                    <div className="w-16 px-3 text-center shrink-0 font-mono">{op.sid}</div>
                                    <div className="w-24 px-3 text-center shrink-0 font-mono text-[10px] opacity-70">{op.elapsed_seconds}s</div>
                                    <div className={twMerge("w-24 px-3 text-center shrink-0 font-black", isSelected ? "" : "text-amber-500")}>
                                        {op.time_remaining}s
                                    </div>
                                    <div className="w-24 px-3 text-center shrink-0 font-black tracking-tighter">{op.pct}%</div>
                                    <div className="w-48 px-4 shrink-0 flex items-center justify-center">
                                        <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden border border-black/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-primary-raised rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)] relative"
                                                style={{ width: `${op.pct}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-40 px-3 text-center shrink-0 font-mono text-[10px] opacity-60">{op.start_tim}</div>
                                    <div className={twMerge("w-24 px-3 text-center shrink-0 font-black", isSelected ? "" : "text-primary")}>
                                        {op.tim}
                                    </div>
                                    <div className="w-32 px-3 shrink-0 text-center font-mono text-[10px] text-primary/80 hover:underline">{op.sql_id}</div>
                                    <div className="flex-1 px-4 shrink-0 truncate opacity-90 font-medium tracking-tight" title={op.message}>
                                        {op.message}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Premium Context Menu */}
            <MenuPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
                <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner
                        anchor={virtualAnchor}
                        side="right"
                        align="start"
                        sideOffset={2}
                    >
                        <MenuPrimitive.Popup className="z-50 min-w-[200px] overflow-hidden rounded-2xl border border-border/40 bg-surface/80 backdrop-blur-2xl p-1.5 text-foreground shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100 focus:outline-none">
                            {selectedOp && (
                                <>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600"
                                        onClick={() => onAction?.('KILL_SESSION', selectedOp)}
                                    >
                                        <Skull className="size-4 text-rose-500" />
                                        <span>Terminate Session</span>
                                    </MenuPrimitive.Item>

                                    <MenuPrimitive.Separator className="my-1 h-px bg-border/20 mx-2" />

                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => onAction?.('SHOW_SQL', selectedOp)}
                                    >
                                        <FileText className="size-4 text-primary" />
                                        <span>Show Statement</span>
                                    </MenuPrimitive.Item>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => onAction?.('SQL_CENTRAL', selectedOp)}
                                    >
                                        <Database className="size-4 text-primary" />
                                        <span>Open in SQL Central</span>
                                    </MenuPrimitive.Item>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => onAction?.('TRACE_SESSION', selectedOp)}
                                    >
                                        <Activity className="size-4 text-primary" />
                                        <span>Trace Execution</span>
                                    </MenuPrimitive.Item>
                                </>
                            )}
                        </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
        </div>
    )
}

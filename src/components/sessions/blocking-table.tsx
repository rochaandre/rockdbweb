import { twMerge } from 'tailwind-merge'
import { Skull, Activity, Lock, Database, ChevronRight, FileCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

export interface BlockingSession {
    inst_id: number
    sid: number
    serial: number
    username: string
    status: string
    event: string
    type: 'blocker' | 'blocked'
    level: number
    sql_id?: string
}

interface BlockingTableProps {
    onAction: (action: string, session: BlockingSession) => void
    instId?: number
    refreshKey?: number
    data?: BlockingSession[]
}

export function BlockingTable({ onAction, instId, refreshKey, data: propData }: BlockingTableProps) {
    const navigate = useNavigate()
    const [data, setData] = useState<BlockingSession[]>(propData || [])
    const [isLoading, setIsLoading] = useState(!propData)
    const [menuOpen, setMenuOpen] = useState(false)
    const [selectedSession, setSelectedSession] = useState<BlockingSession | null>(null)
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

    const fetchBlockingData = async () => {
        setIsLoading(true)
        try {
            const instParam = instId ? `?inst_id=${instId}` : ""
            const res = await fetch(`${API_URL}/sessions/blocking${instParam}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Error fetching blocking sessions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (propData) {
            setData(propData)
            setIsLoading(false)
        } else {
            fetchBlockingData()
        }
    }, [instId, refreshKey, propData])

    const handleContextMenu = (e: React.MouseEvent, session: BlockingSession) => {
        e.preventDefault()
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setSelectedSession(session)
        setMenuOpen(true)
    }

    return (
        <div className="flex-1 overflow-auto border border-border/40 bg-surface/30 backdrop-blur-sm rounded-xl shadow-inner relative ring-1 ring-white/10 group/table">
            <table className="min-w-full text-[11px] text-left border-collapse isolate">
                <thead className="bg-surface-raised/80 backdrop-blur-md sticky top-0 z-20 text-muted-foreground font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5">
                    <tr>
                        <th className="px-3 py-2 border-r border-border/10 w-12 text-center">INST</th>
                        <th className="px-3 py-2 border-r border-border/10 w-16 text-center">SID</th>
                        <th className="px-3 py-2 border-r border-border/10 w-20 text-center">SERIAL#</th>
                        <th className="px-3 py-2 border-r border-border/10">USERNAME</th>
                        <th className="px-3 py-2 border-r border-border/10 w-24">STATUS</th>
                        <th className="px-3 py-2 border-r border-border/10">EVENT</th>
                        <th className="px-3 py-2 w-36 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="py-20 text-center">
                                <Activity className="mx-auto size-8 text-primary animate-pulse mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 animate-pulse">Analyzing locking hierarchy...</p>
                            </td>
                        </tr>
                    )}
                    {!isLoading && data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-20 text-center">
                                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-sm">
                                    <Activity className="size-6 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">No Blocks Detected</h3>
                                <p className="text-[10px] text-muted-foreground/40 mt-1">SGA is currently free of significant contention.</p>
                            </td>
                        </tr>
                    )}
                    {!isLoading && data.length > 0 && data.map((session, idx) => (
                        <tr
                            key={`${session.sid}-${idx}`}
                            onContextMenu={(e) => handleContextMenu(e, session)}
                            className={twMerge(
                                "group transition-all duration-75 select-none",
                                session.type === 'blocker'
                                    ? "bg-rose-500/10 text-rose-700 font-bold shadow-[inset_0_0_20px_rgba(244,63,94,0.05)] ring-1 ring-rose-500/20"
                                    : "bg-amber-500/5 text-amber-700 hover:bg-amber-500/10"
                            )}
                        >
                            <td className="px-3 py-2 border-r border-black/5 text-center font-mono opacity-60">{session.inst_id}</td>
                            <td className={twMerge("px-3 py-2 border-r border-black/5", (session.level ?? 0) > 0 && "pl-8")}>
                                <div className="flex items-center">
                                    {(session.level ?? 0) > 0 && <ChevronRight className="size-3 text-muted-foreground/40 mr-1" />}
                                    <span className="font-mono">{session.sid}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 border-r border-black/5 text-center font-mono opacity-80">{session.serial}</td>
                            <td className="px-3 py-2 border-r border-black/5 font-bold tracking-tight">{session.username || 'SYSTEM'}</td>
                            <td className="px-3 py-2 border-r border-black/5">
                                <span className={twMerge(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                    session.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/30 text-muted-foreground"
                                )}>
                                    {session.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 border-r border-black/5 truncate opacity-80 font-mono text-[10px]" title={session.event}>
                                {session.event}
                            </td>
                            <td className="px-3 py-2 flex items-center justify-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction('KILL_SESSION', session);
                                    }}
                                    className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20 transition-all"
                                >
                                    <Skull className="size-3 mr-1" /> Kill
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/block-explorer/${session.sid}?inst_id=${session.inst_id}`);
                                    }}
                                    className="h-7 px-2 text-[9px] font-black uppercase tracking-widest bg-surface/50 border-border/40 hover:bg-surface rounded-lg transition-all shadow-sm"
                                >
                                    <Lock className="size-3 mr-1" /> Map
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
                            {selectedSession && (
                                <>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600"
                                        onClick={() => onAction('KILL_SESSION', selectedSession)}
                                    >
                                        <Skull className="size-4 text-rose-500" />
                                        <span>Kill Session Now</span>
                                    </MenuPrimitive.Item>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600"
                                        onClick={() => onAction('KILL_COMMANDS', selectedSession)}
                                    >
                                        <Skull className="size-4 text-rose-500 animate-pulse" />
                                        <span>Generate Kill Scripts</span>
                                    </MenuPrimitive.Item>

                                    <MenuPrimitive.Separator className="my-1 h-px bg-border/20 mx-2" />

                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => navigate(`/block-explorer/${selectedSession.sid}?inst_id=${selectedSession.inst_id}`)}
                                    >
                                        <Lock className="size-4 text-amber-500" />
                                        <span>Hierarchical Map</span>
                                    </MenuPrimitive.Item>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => onAction('SHOW_SQL', selectedSession)}
                                    >
                                        <FileCode className="size-4 text-primary" />
                                        <span>SQL Content Trace</span>
                                    </MenuPrimitive.Item>
                                    <MenuPrimitive.Item
                                        className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-bold outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                        onClick={() => onAction('SQL_CENTRAL', selectedSession)}
                                    >
                                        <Database className="size-4 text-primary" />
                                        <span>Analyze in SQL Central</span>
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

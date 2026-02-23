import { twMerge } from 'tailwind-merge'
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skull, Activity, FileCode, Lock, Loader2, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from '@/context/app-context'

interface BlockingSession {
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

    return (
        <div className="flex-1 overflow-auto border border-border bg-white rounded-md shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-surface-raised sticky top-0 z-10 text-foreground font-medium shadow-sm">
                    <tr>
                        <th className="border-b border-r border-border px-1 py-1 w-10">INST</th>
                        <th className="border-b border-r border-border px-1 py-1 w-12">SID</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16">SERIAL#</th>
                        <th className="border-b border-r border-border px-1 py-1">USERNAME</th>
                        <th className="border-b border-r border-border px-1 py-1 w-20">STATUS</th>
                        <th className="border-b border-r border-border px-1 py-1">EVENT</th>
                        <th className="border-b border-border px-1 py-1 w-32">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="py-10 text-center text-muted-foreground">
                                <Loader2 className="mx-auto size-6 animate-spin mb-2" />
                                Loading blocking data...
                            </td>
                        </tr>
                    )}
                    {!isLoading && data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-10 text-center text-muted-foreground">
                                No blocking or waiting sessions found.
                            </td>
                        </tr>
                    )}
                    {!isLoading && data.length > 0 && data.map((session, idx) => (
                        <tr key={`${session.sid}-${idx}`}>
                            <td colSpan={7} className="p-0 border-0">
                                <ContextMenu
                                    trigger={
                                        <div
                                            className={twMerge(
                                                "grid grid-cols-[2.5rem_3rem_4rem_1fr_5rem_1fr_8rem] w-full border-b border-border cursor-context-menu hover:brightness-95 transition-colors items-center",
                                                session.type === 'blocker'
                                                    ? "bg-red-100 text-red-900 font-medium"
                                                    : "bg-yellow-50 text-foreground"
                                            )}
                                        >
                                            <div className="px-1 py-0.5 border-r border-border/50 flex items-center h-full justify-center font-mono opacity-60">
                                                {session.inst_id}
                                            </div>
                                            <div className={twMerge("px-1 py-0.5 border-r border-border/50 flex items-center h-full", (session.level ?? 0) > 0 && "pl-4")}>
                                                {(session.level ?? 0) > 0 && <span className="text-muted-foreground mr-1">└</span>}
                                                {session.sid}
                                            </div>
                                            <div className="px-1 py-0.5 border-r border-border/50 h-full flex items-center">{session.serial}</div>
                                            <div className="px-1 py-0.5 border-r border-border/50 h-full flex items-center">{session.username}</div>
                                            <div className="px-1 py-0.5 border-r border-border/50 h-full flex items-center">{session.status}</div>
                                            <div className="px-1 py-0.5 border-r border-border/50 h-full flex items-center">{session.event}</div>
                                            <div className="px-1 py-0.5 h-full flex items-center justify-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAction('KILL_SESSION', session);
                                                    }}
                                                    className="p-1 hover:bg-red-600 hover:text-white rounded flex items-center gap-1 text-[10px] border border-red-200 text-red-700 bg-red-50/50"
                                                    title="Kill Session"
                                                >
                                                    <Skull className="w-3 h-3" /> Kill
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/block-explorer/${session.sid}?inst_id=${session.inst_id}`);
                                                    }}
                                                    className="p-1 hover:bg-black/10 rounded flex items-center gap-1 text-[10px] border border-black/20"
                                                    title="Open Block Explorer"
                                                >
                                                    <Lock className="w-3 h-3" /> Explorer
                                                </button>
                                            </div>
                                        </div>
                                    }
                                >
                                    <ContextMenuItem onClick={() => onAction('KILL_SESSION', session)}>
                                        <Skull className="mr-2 size-3.5 text-destructive" />
                                        Kill Session
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('KILL_COMMANDS', session)}>
                                        <Skull className="mr-2 size-3.5 text-destructive animate-pulse" />
                                        Kill Commands (Manual)
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('TRACE_SESSION', session)}>
                                        <Activity className="mr-2 size-3.5" />
                                        Trace Session
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => navigate(`/block-explorer/${session.sid}?inst_id=${session.inst_id}`)}>
                                        <Lock className="mr-2 size-3.5 text-amber-600" />
                                        Block Explorer
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('SHOW_SQL', session)}>
                                        <FileCode className="mr-2 size-3.5" />
                                        Show SQL
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('SQL_CENTRAL', session)}>
                                        <Database className="mr-2 h-4 w-4 text-primary" />
                                        Show in SQL Central
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('SHOW_KILL_SQL_CENTRAL', session)}>
                                        <Database className="mr-2 h-4 w-4 text-amber-600 animate-pulse" />
                                        Show Kill Session in SQL Central
                                    </ContextMenuItem>
                                </ContextMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

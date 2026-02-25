import { twMerge } from 'tailwind-merge'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skull, Activity, ChevronRight, BarChart, Lock, Terminal, ShieldAlert, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

export interface SessionsTableProps {
    data: any[]
    selectedId: number | null
    onSelect: (id: number) => void
    onAction: (action: string, session: any) => void
}

export function SessionsTable({ data, selectedId, onSelect, onAction }: SessionsTableProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [menuSession, setMenuSession] = useState<any>(null)

    const handleContextMenu = (e: React.MouseEvent, session: any) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setMenuSession(session)
        setMenuOpen(true)
        onSelect(session.sid)
    }

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

    return (
        <div className="flex-1 overflow-auto border border-border/40 bg-surface/30 backdrop-blur-sm rounded-xl shadow-inner relative ring-1 ring-white/10 group/table">
            <table className="min-w-full text-[11px] text-left border-collapse isolate">
                <thead className="bg-surface-raised/80 backdrop-blur-md sticky top-0 z-20 text-muted-foreground font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5">
                    <tr>
                        <th className="px-3 py-2.5 w-14 text-right">SID</th>
                        <th className="px-3 py-2.5 w-18 text-right">Serial</th>
                        <th className="px-3 py-2.5 w-20 text-right font-mono">SO PID</th>
                        <th className="px-3 py-2.5 min-w-[120px]">User</th>
                        <th className="px-3 py-2.5 w-16 text-right">I/O</th>
                        <th className="px-3 py-2.5 w-16 text-right">CPU</th>
                        <th className="px-3 py-2.5 min-w-[120px]">Command</th>
                        <th className="px-3 py-2.5 w-14 text-center">Locks</th>
                        <th className="px-3 py-2.5 min-w-[90px]">Status</th>
                        <th className="px-3 py-2.5 w-12 text-right">PQs</th>
                        <th className="px-3 py-2.5 min-w-[110px]">Owner</th>
                        <th className="px-3 py-2.5 w-20 text-right">Comp%</th>
                        <th className="px-3 py-2.5 w-18 text-right">Time</th>
                        <th className="px-3 py-2.5 w-18 text-right">PGA(M)</th>
                        <th className="px-3 py-2.5 min-w-[220px]">Wait Event</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                    {data.map((session, idx) => (
                        <tr
                            key={`${session.sid}-${idx}`}
                            onClick={() => onSelect(session.sid)}
                            onContextMenu={(e) => handleContextMenu(e, session)}
                            className={twMerge(
                                "group cursor-pointer select-none transition-all duration-75",
                                selectedId === session.sid
                                    ? "bg-primary/20 text-primary-foreground font-bold shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)] ring-1 ring-primary/30 relative z-10"
                                    : "hover:bg-primary/5 odd:bg-muted/5 text-foreground/80 hover:text-foreground"
                            )}
                        >
                            <td className="px-3 py-1.5 text-right font-mono font-bold">{session.sid}</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground/70 font-mono text-[10px]">{session['serial#']}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-primary/80">{session.spid}</td>
                            <td className="px-3 py-1.5 font-bold truncate max-w-[120px]">{session.username || 'SYS'}</td>
                            <td className="px-3 py-1.5 text-right">{session.file_io}</td>
                            <td className="px-3 py-1.5 text-right font-medium text-amber-600/90">{session.cpu}</td>
                            <td className="px-3 py-1.5 truncate max-w-[120px] font-mono text-[10px] uppercase opacity-80">{session.command}</td>
                            <td className="px-3 py-1.5 text-center">
                                {session.lck_obj > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 font-black border border-rose-500/20">
                                        <Lock className="size-2.5" /> {session.lck_obj}
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="px-3 py-1.5">
                                <span className={twMerge(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                    session.status === 'ACTIVE'
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : "bg-muted/30 text-muted-foreground border-border/40"
                                )}>
                                    {session.status}
                                </span>
                            </td>
                            <td className="px-3 py-1.5 text-right opacity-60">{session.pqs > 0 ? session.pqs : ''}</td>
                            <td className="px-3 py-1.5 truncate max-w-[110px] text-muted-foreground font-medium">{session.owner}</td>
                            <td className="px-3 py-1.5 text-right">
                                {session.completed > 0 ? (
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-12 h-1 bg-muted/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/60" style={{ width: `${session.completed}%` }} />
                                        </div>
                                        <span className="font-mono text-[10px]">{session.completed}%</span>
                                    </div>
                                ) : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-medium">{session.elapsed}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-blue-600/80">{session.pga_used_mb || 0}</td>
                            <td className="px-3 py-1.5 truncate max-w-[220px] text-muted-foreground italic font-medium group-hover:text-foreground transition-colors">
                                {session.event}
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
                        <MenuPrimitive.Popup
                            className="z-50 min-w-[200px] overflow-hidden rounded-2xl border border-border/40 bg-surface/80 backdrop-blur-2xl p-1.5 text-foreground shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100"
                        >
                            <div className="px-3 py-2 mb-1 border-b border-border/20">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Session Controls</div>
                                <div className="text-xs font-bold font-mono text-primary mt-0.5">SID {menuSession?.sid} <span className="text-muted-foreground/30 mx-1">/</span> {menuSession?.username || 'SYSTEM'}</div>
                            </div>

                            <ContextMenuItem onClick={() => menuSession && onAction('KILL_SESSION', menuSession)} className="text-rose-600 hover:bg-rose-500/10 rounded-xl">
                                <Skull className="mr-3 size-4" />
                                Terminate Session
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => menuSession && onAction('KILL_COMMANDS', menuSession)} className="text-rose-600/70 hover:bg-rose-500/10 rounded-xl">
                                <ShieldAlert className="mr-3 size-4" />
                                Manual Kill Logic
                            </ContextMenuItem>

                            <ContextMenuSeparator className="my-1 bg-border/20" />

                            <MenuPrimitive.Root>
                                <MenuPrimitive.Trigger className="flex w-full cursor-pointer select-none items-center rounded-xl px-2 py-2 text-xs font-bold outline-none hover:bg-muted/50 data-[state=open]:bg-primary/10 transition-all">
                                    <Database className="mr-3 size-4 text-primary" />
                                    Open in SQL Central
                                    <ChevronRight className="ml-auto size-3.5 opacity-50" />
                                </MenuPrimitive.Trigger>
                                <MenuPrimitive.Portal>
                                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={8}>
                                        <MenuPrimitive.Popup className="z-[60] min-w-[180px] overflow-hidden rounded-2xl border border-border/40 bg-surface/90 backdrop-blur-2xl p-1.5 text-foreground shadow-2xl ring-1 ring-white/10">
                                            <ContextMenuItem
                                                onClick={() => {
                                                    if (menuSession) {
                                                        onAction('EXPLORE_SQL_DETAILS', menuSession);
                                                        setMenuOpen(false);
                                                    }
                                                }}
                                                className="rounded-xl"
                                            >
                                                <Database className="mr-3 size-4 text-blue-500" />
                                                Explore SQL Details
                                            </ContextMenuItem>
                                            <ContextMenuItem
                                                onClick={() => {
                                                    if (menuSession) {
                                                        onAction('CREATE_TUNING_TASK', menuSession);
                                                        setMenuOpen(false);
                                                    }
                                                }}
                                                className="rounded-xl"
                                            >
                                                <Activity className="mr-3 size-4 text-emerald-500" />
                                                Create Tunning Task
                                            </ContextMenuItem>
                                            <ContextMenuSeparator className="my-1 bg-border/20" />
                                            <ContextMenuItem
                                                onClick={() => {
                                                    if (menuSession) {
                                                        onAction('SQL_CENTRAL', menuSession);
                                                        setMenuOpen(false);
                                                    }
                                                }}
                                                className="rounded-xl opacity-70"
                                            >
                                                <Terminal className="mr-3 size-4 text-slate-400" />
                                                Generic Session View
                                            </ContextMenuItem>
                                        </MenuPrimitive.Popup>
                                    </MenuPrimitive.Positioner>
                                </MenuPrimitive.Portal>
                            </MenuPrimitive.Root>

                            <ContextMenuItem
                                disabled={!menuSession || !(menuSession.blocking_session || menuSession.blocked_cnt > 0)}
                                onClick={() => menuSession && onAction('BLOCK_EXPLORER', menuSession)}
                                className="rounded-xl"
                            >
                                <Lock className="mr-3 size-4 text-amber-500" />
                                Block Analysis
                            </ContextMenuItem>

                            <ContextMenuSeparator className="my-1 bg-border/20" />

                            <MenuPrimitive.Root>
                                <MenuPrimitive.Trigger className="flex w-full cursor-pointer select-none items-center rounded-xl px-2 py-2 text-xs font-bold outline-none hover:bg-muted/50 data-[state=open]:bg-primary/10 transition-all">
                                    <BarChart className="mr-3 size-4 text-emerald-500" />
                                    Diagnostics
                                    <ChevronRight className="ml-auto size-3.5 opacity-50" />
                                </MenuPrimitive.Trigger>
                                <MenuPrimitive.Portal>
                                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={8}>
                                        <MenuPrimitive.Popup className="z-[60] min-w-[180px] overflow-hidden rounded-2xl border border-border/40 bg-surface/90 backdrop-blur-2xl p-1.5 text-foreground shadow-2xl ring-1 ring-white/10">
                                            <ContextMenuItem onClick={() => {
                                                if (menuSession) {
                                                    onAction('SQL_STATS', menuSession);
                                                    setMenuOpen(false);
                                                }
                                            }} className="rounded-xl">
                                                <Activity className="mr-3 size-4 text-amber-500" />
                                                SQL Statistics
                                            </ContextMenuItem>
                                            <ContextMenuItem disabled className="rounded-xl opacity-50">
                                                <Activity className="mr-3 size-4" />
                                                Active Session History
                                            </ContextMenuItem>
                                        </MenuPrimitive.Popup>
                                    </MenuPrimitive.Positioner>
                                </MenuPrimitive.Portal>
                            </MenuPrimitive.Root>

                            <ContextMenuSeparator className="my-1 bg-border/20" />

                            <div className="px-2 py-1.5">
                                <Button variant="ghost" size="sm" onClick={() => setMenuOpen(false)} className="w-full h-7 rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground">
                                    Dismiss Menu
                                </Button>
                            </div>
                        </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
        </div>
    )
}

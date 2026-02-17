import { twMerge } from 'tailwind-merge'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skull, Activity, FileCode } from 'lucide-react'
import { useState } from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

export interface SessionsTableProps {
    sessions: any[]
    onSelectSql: (sqlId: string, sid: number) => void
    onKill: (sid: number, serial: number, inst_id?: number) => Promise<void>
    filter: string
}

export function SessionsTable({ sessions, onSelectSql, onKill, filter }: SessionsTableProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [menuSession, setMenuSession] = useState<any>(null)

    const filteredSessions = sessions.filter(s =>
        !filter ||
        s.sid?.toString().includes(filter) ||
        s.username?.toLowerCase().includes(filter.toLowerCase()) ||
        s.command?.toLowerCase().includes(filter.toLowerCase()) ||
        s.event?.toLowerCase().includes(filter.toLowerCase())
    )

    const handleContextMenu = (e: React.MouseEvent, session: any) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setMenuSession(session)
        setMenuOpen(true)
        setSelectedId(session.sid)
        onSelectSql(session.sql_id || '', session.sid)
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
        <div className="flex-1 overflow-auto border border-border bg-white rounded-md shadow-sm relative">
            <table className="w-full text-xs text-left border-collapse table-fixed">
                <thead className="bg-muted/50 sticky top-0 z-10 text-xs font-medium text-muted-foreground border-b border-border shadow-sm">
                    <tr>
                        <th className="border-r border-border/50 px-2 py-1.5 w-12 text-right">SID</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-right">OS PID</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-16 text-right">SERIAL#</th>
                        <th className="border-r border-border/50 px-2 py-1.5 text-left">USERNAME</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-right">File IO</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-16 text-right">CPU Usage</th>
                        <th className="border-r border-border/50 px-2 py-1.5 text-left">COMMAND</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-center">LckObj</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-16 text-left">STATUS</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-8 text-right">PQs</th>
                        <th className="border-r border-border/50 px-2 py-1.5 text-left">OWNER</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-16 text-right">Progress,%</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-right">Elapsed,s</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-right">Remain,s</th>
                        <th className="border-r border-border/50 px-2 py-1.5 w-14 text-right">Temp,M</th>
                        <th className="px-2 py-1.5 text-left">Event</th>
                    </tr>
                </thead>
                <tbody className="bg-surface">
                    {filteredSessions.map((session) => (
                        <tr
                            key={session.sid}
                            onClick={() => {
                                setSelectedId(session.sid)
                                onSelectSql(session.sql_id || '', session.sid)
                            }}
                            onContextMenu={(e) => handleContextMenu(e, session)}
                            className={twMerge(
                                "group cursor-pointer select-none h-9 border-b border-border/50 text-xs transition-colors hover:bg-muted/50",
                                selectedId === session.sid ? "bg-blue-50/80 dark:bg-blue-950/30" : ""
                            )}
                        >
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.sid}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.ospid}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session['serial#']}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap font-medium text-foreground">{session.username}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.file_io}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.cpu}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.command}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-center overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.lck_obj}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.status}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.pqs}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.owner}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.compl_pct || 0}%</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.elaps_s || 0}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.rem_s || 0}</td>
                            <td className="border-r border-border/50 px-2 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-muted-foreground/60">{session.temp || 0}</td>
                            <td className="px-2 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">{session.event}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Global Context Menu */}
            <MenuPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
                <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner
                        anchor={virtualAnchor}
                        side="right"
                        align="start"
                        sideOffset={0}
                    >
                        <MenuPrimitive.Popup
                            className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                        >
                            <ContextMenuItem onClick={() => menuSession && onKill(menuSession.sid, menuSession['serial#'], menuSession.inst_id)}>
                                <Skull className="mr-2 size-3.5 text-destructive" />
                                Kill Session
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => menuSession && onSelectSql(menuSession.sql_id || '', menuSession.sid)}>
                                <Activity className="mr-2 size-3.5" />
                                Trace Session
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => menuSession && onSelectSql(menuSession.sql_id || '', menuSession.sid)}>
                                <FileCode className="mr-2 size-3.5" />
                                Show SQL
                            </ContextMenuItem>
                        </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
        </div>
    )
}

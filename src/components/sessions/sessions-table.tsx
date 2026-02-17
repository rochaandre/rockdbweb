import { twMerge } from 'tailwind-merge'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skull, Activity, FileCode, Database } from 'lucide-react'
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
        onSelect(session.sid) // Also select logic on right click
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
            <table className="min-w-full text-xs text-left border-collapse">
                <thead className="bg-surface-raised sticky top-0 z-10 text-foreground font-medium shadow-sm">
                    <tr>
                        <th className="border-b border-r border-border px-1 py-1 w-12 text-right">SID</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">SERIAL#</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">PID SO</th>
                        <th className="border-b border-r border-border px-1 py-1 min-w-[100px] text-left">USERNAME</th>
                        <th className="border-b border-r border-border px-1 py-1 w-14 text-right">File IO</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">CPU Usage</th>
                        <th className="border-b border-r border-border px-1 py-1 min-w-[100px] text-left">COMMAND</th>
                        <th className="border-b border-r border-border px-1 py-1 w-14 text-center">LckObj</th>
                        <th className="border-b border-r border-border px-1 py-1 min-w-[80px] text-left">STATUS</th>
                        <th className="border-b border-r border-border px-1 py-1 w-8 text-right">PQs</th>
                        <th className="border-b border-r border-border px-1 py-1 min-w-[100px] text-left">OWNER</th>
                        <th className="border-b border-r border-border px-1 py-1 w-20 text-right">Comp,%</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">Elapsed</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">Remain</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">Temp,M</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">PGA,M</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16 text-right">PGA Max</th>
                        <th className="border-b border-border px-1 py-1 min-w-[200px] text-left">Event</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((session, idx) => (
                        <tr
                            key={`${session.sid}-${idx}`}
                            onClick={() => onSelect(session.sid)}
                            onContextMenu={(e) => handleContextMenu(e, session)}
                            className={twMerge(
                                "group cursor-pointer select-none",
                                selectedId === session.sid ? "bg-[#0066cc] text-white hover:bg-[#0052a3]" : "hover:bg-muted/50 odd:bg-secondary/20"
                            )}
                        >
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.sid}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session['serial#']}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px]">{session.spid}</td>
                            <td className="border-r border-border px-1 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.username}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.file_io}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.cpu}</td>
                            <td className="border-r border-border px-1 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.command}</td>
                            <td className="border-r border-border px-1 py-0.5 text-center overflow-hidden text-ellipsis whitespace-nowrap">{session.lck_obj}</td>
                            <td className="border-r border-border px-1 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.status}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.pqs}</td>
                            <td className="border-r border-border px-1 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.owner}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.completed || session.compl_pct || 0}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.elapsed}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.remain || session.rem_s || 0}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap">{session.temp || 0}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 font-bold">{session.pga_used_mb || 0}</td>
                            <td className="border-r border-border px-1 py-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap text-amber-600">{session.pga_max_mb || 0}</td>
                            <td className="px-1 py-0.5 text-left overflow-hidden text-ellipsis whitespace-nowrap">{session.event}</td>
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
                            <ContextMenuItem onClick={() => menuSession && onAction('KILL_SESSION', menuSession)}>
                                <Skull className="mr-2 size-3.5 text-destructive" />
                                Kill Session
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => menuSession && onAction('Trace Session', menuSession)}>
                                <Activity className="mr-2 size-3.5" />
                                Trace Session
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => menuSession && onAction('Show SQL', menuSession)}>
                                <FileCode className="mr-2 size-3.5" />
                                Show SQL
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => menuSession && onAction('SQL_CENTRAL', menuSession)}>
                                <Database className="mr-2 size-3.5 text-primary" />
                                Show in SQL Central
                            </ContextMenuItem>
                        </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
        </div>
    )
}

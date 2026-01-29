import { twMerge } from 'tailwind-merge'
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Skull, Activity, FileCode } from 'lucide-react'

interface BlockingSession {
    id: string
    sid: number
    serial: number
    username: string
    status: string
    event: string
    type: 'blocker' | 'blocked'
    level: number
}

// Expanded Data
const BLOCKING_DATA: BlockingSession[] = [
    { id: '1', sid: 105, serial: 4521, username: 'SYSTEM', status: 'ACTIVE', event: 'enq: TX - row lock contention', type: 'blocker', level: 0 },
    { id: '2', sid: 230, serial: 1022, username: 'APP_USER', status: 'ACTIVE', event: 'enq: TX - row lock contention', type: 'blocked', level: 1 },
    { id: '3', sid: 245, serial: 8891, username: 'REPORT_SVC', status: 'ACTIVE', event: 'enq: TX - row lock contention', type: 'blocked', level: 1 },
    { id: '4', sid: 290, serial: 1121, username: 'BATCH_JOB', status: 'INACTIVE', event: 'SQL*Net message from client', type: 'blocked', level: 2 },
    { id: '5', sid: 310, serial: 3341, username: 'WEB_APP', status: 'ACTIVE', event: 'enq: TX - row lock contention', type: 'blocked', level: 1 },
    { id: '6', sid: 400, serial: 9911, username: 'DB_ADMIN', status: 'ACTIVE', event: 'library cache lock', type: 'blocker', level: 0 },
    { id: '7', sid: 401, serial: 1234, username: 'DEV_USER', status: 'ACTIVE', event: 'library cache lock', type: 'blocked', level: 1 },
    { id: '8', sid: 505, serial: 6672, username: 'ANALYTICS', status: 'ACTIVE', event: 'enq: TM - contention', type: 'blocker', level: 0 },
    { id: '9', sid: 510, serial: 7781, username: 'BI_TOOL', status: 'ACTIVE', event: 'enq: TM - contention', type: 'blocked', level: 1 },
    { id: '10', sid: 520, serial: 8892, username: 'ETL_PROC', status: 'ACTIVE', event: 'enq: TM - contention', type: 'blocked', level: 1 },
    { id: '11', sid: 600, serial: 4455, username: 'CACHE_SVC', status: 'ACTIVE', event: 'latch: cache buffers chains', type: 'blocker', level: 0 },
    { id: '12', sid: 605, serial: 1122, username: 'USER_1', status: 'ACTIVE', event: 'latch: cache buffers chains', type: 'blocked', level: 1 },
    { id: '13', sid: 606, serial: 1133, username: 'USER_2', status: 'ACTIVE', event: 'latch: cache buffers chains', type: 'blocked', level: 1 },
]

interface BlockingTableProps {
    onAction: (action: string, session: BlockingSession) => void
}

export function BlockingTable({ onAction }: BlockingTableProps) {
    return (
        <div className="flex-1 overflow-auto border border-border bg-white rounded-md shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-surface-raised sticky top-0 z-10 text-foreground font-medium shadow-sm">
                    <tr>
                        <th className="border-b border-r border-border px-1 py-1 w-12">SID</th>
                        <th className="border-b border-r border-border px-1 py-1 w-16">SERIAL#</th>
                        <th className="border-b border-r border-border px-1 py-1">USERNAME</th>
                        <th className="border-b border-r border-border px-1 py-1 w-20">STATUS</th>
                        <th className="border-b border-border px-1 py-1">EVENT</th>
                    </tr>
                </thead>
                <tbody>
                    {BLOCKING_DATA.map((session) => (
                        <tr
                            key={session.id}
                        >
                            <td colSpan={5} className="p-0 border-0">
                                <ContextMenu
                                    trigger={
                                        <div
                                            className={twMerge(
                                                "grid grid-cols-[3rem_4rem_1fr_5rem_1fr] w-full border-b border-border cursor-context-menu hover:brightness-95 transition-colors",
                                                session.type === 'blocker'
                                                    ? "bg-red-100 text-red-900 font-medium"
                                                    : "bg-yellow-50 text-foreground"
                                            )}
                                        >
                                            <div className={twMerge("px-1 py-0.5 border-r border-border/50 flex items-center", session.level > 0 && "pl-4")}>
                                                {session.level > 0 && <span className="text-muted-foreground mr-1">└</span>}
                                                {session.sid}
                                            </div>
                                            <div className="px-1 py-0.5 border-r border-border/50">{session.serial}</div>
                                            <div className="px-1 py-0.5 border-r border-border/50">{session.username}</div>
                                            <div className="px-1 py-0.5 border-r border-border/50">{session.status}</div>
                                            <div className="px-1 py-0.5">{session.event}</div>
                                        </div>
                                    }
                                >
                                    <ContextMenuItem onClick={() => onAction('Kill Session', session)}>
                                        <Skull className="mr-2 size-3.5 text-destructive" />
                                        Kill Session
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => onAction('Trace Session', session)}>
                                        <Activity className="mr-2 size-3.5" />
                                        Trace Session
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => onAction('Show SQL', session)}>
                                        <FileCode className="mr-2 size-3.5" />
                                        Show SQL
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

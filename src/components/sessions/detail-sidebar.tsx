import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface SessionDetail {
    sid: number
    serial: number
    username: string
    schema: string
    logonTime: string
    pid: number
    osPid: number
    pga: string
    lastCallEt: number
    sqlId: string
    child: number
    event: string
    waitInfo: string[]
    sqlText: string
}

interface DetailSidebarProps {
    session?: any | null;
    sqlText?: string;
}

export function DetailSidebar({ session, sqlText }: DetailSidebarProps) {
    const navigate = useNavigate()

    if (!session) {
        return (
            <div className="flex w-80 flex-col gap-2 shrink-0">
                <Card className="gap-0 border-border bg-muted/20 p-4 h-full items-center justify-center text-muted-foreground text-sm">
                    Select a session to view details
                </Card>
            </div>
        )
    }

    return (
        <div className="flex w-80 flex-col gap-2 shrink-0">
            {/* Session Info Blue Card */}
            <Card className="gap-0 border-primary bg-blue-50/50 p-0 overflow-hidden">
                <div className="bg-gradient-to-b from-blue-100 to-blue-50 p-2 border-b border-blue-200">
                    <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-xs text-slate-800">
                        <span className="font-bold text-right text-blue-600">OS PID:</span>
                        <span className="font-mono font-bold text-blue-700">{session.ospid}</span>

                        <span className="font-bold text-right">Serial #:</span>
                        <span>{session.serial || session['serial#']}</span>

                        <span className="font-bold text-right">User Name:</span>
                        <span className="font-mono">{session.username}</span>

                        <span className="font-bold text-right">Service:</span>
                        <span className="text-[10px] truncate">{session.service}</span>

                        <span className="font-bold text-right">OS User:</span>
                        <span>{session.osuser}</span>

                        <span className="font-bold text-right">Terminal:</span>
                        <span className="text-[10px] truncate">{session.terminal}</span>

                        <span className="font-bold text-right">Program:</span>
                        <span className="text-[10px] truncate">{session.program}</span>

                        <span className="font-bold text-right">Module:</span>
                        <span className="text-[10px] truncate">{session.module}</span>

                        <span className="font-bold text-right">Machine:</span>
                        <span className="text-[10px] truncate">{session.machine}</span>

                        <span className="font-bold text-right">Last Call ET:</span>
                        <span>{session.elapsed}s</span>


                        <span className="font-bold text-right">SQL ID:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                    {session.sql_id || 'None'}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                                <DropdownMenuItem onClick={() => navigate(`/sql-central/${session.sql_id}`)}>
                                    Show in SQL Central
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/block-explorer/${session.sid}`)}>
                                    Block Explorer
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Reports</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/statistics/${session.sql_id}`)}>
                                                SQL Statistics
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/bind-capture/${session.sql_id}`)}>
                                                Bind Variables Capture
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/optimizer-env/${session.sql_id}`)}>
                                                Optimizer Environment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/plan-history/${session.sql_id}`)}>
                                                Plan Switch History
                                            </DropdownMenuItem>
                                            <DropdownMenuItem disabled>
                                                SQL Monitor (External)
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/xplan-all/${session.sql_id}`)}>
                                                XPlan All
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/xplan-stats/${session.sql_id}`)}>
                                                XPlan AllStats Last
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sql-report/xplan-stats/${session.sql_id}`)}>
                                                XPlan AllStats
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem disabled>AWR SQL Report (text)</DropdownMenuItem>
                                            <DropdownMenuItem disabled>AWR SQL Report (HTML)</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(session.sql_id)}>
                                    Copy Text
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    Close This Menu
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <span className="font-bold text-right">Child:</span>
                        <span className="text-blue-600 underline cursor-pointer">{session.child || 0}</span>

                        <span className="font-bold text-right">Plan Hash:</span>
                        <span className="font-mono text-[10px]">{session.plan_hash || '0'}</span>
                    </div>
                </div>
            </Card>

            {/* Wait State Info */}
            <Card className="p-0 gap-0 overflow-hidden h-40">
                <div className="bg-surface-raised border-b border-border px-2 py-1 text-xs font-semibold">
                    {session.event}
                </div>
                <CardContent className="p-2 text-xs font-mono text-foreground h-full overflow-auto bg-white">
                    {session.wait_class && <p>Wait Class: {session.wait_class}</p>}
                    {session.seconds_in_wait !== undefined && <p>Seconds in wait: {session.seconds_in_wait}</p>}
                    {session.waitInfo?.map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                    ))}
                </CardContent>
            </Card>

            {/* SQL Preview */}
            <Card className="p-0 gap-0 overflow-hidden flex-1 flex flex-col">
                <div className="bg-blue-100 border-b border-border px-2 py-1 text-xs font-semibold flex justify-between items-center">
                    <span>Current Cursor / Open Cursors</span>
                </div>
                <div className="bg-surface-raised border-b border-border px-2 py-0.5 text-xs text-muted-foreground">
                    Curr-&gt;
                </div>
                <CardContent className="p-2 text-xs font-mono text-foreground flex-1 overflow-auto bg-white whitespace-pre-wrap">
                    {sqlText || session.sqlText}
                </CardContent>
                <div className="flex gap-1 p-1 bg-surface-raised border-t border-border">
                    <Button size="sm" variant="secondary" className="h-6 text-xs flex-1">Expand</Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 text-xs flex-1"
                        onClick={() => navigate(`/explain-plan/${session.sqlId}`)}
                    >
                        Explain Plan
                    </Button>
                </div>
            </Card>
        </div>
    )
}

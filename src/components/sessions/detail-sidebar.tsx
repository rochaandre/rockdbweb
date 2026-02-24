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
                        <span className="font-bold text-right">SID:</span>
                        <span>{session.sid}</span>

                        <span className="font-bold text-right">Serial #:</span>
                        <span>{session.serial || session['serial#']}</span>

                        <span className="font-bold text-right">User Name:</span>
                        <span className="font-mono">{session.username}</span>

                        <span className="font-bold text-right">Program:</span>
                        <span>{session.program}</span>

                        <span className="font-bold text-right">Machine:</span>
                        <span>{session.machine}</span>

                        <span className="font-bold text-right">Last Call ET:</span>
                        <span>{session.lastCallEt || session.last_call_et}</span>


                        <span className="font-bold text-right">SQL ID:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                    {session.sqlId || session.sql_id || 'None'}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                                <DropdownMenuItem onClick={() => {
                                    const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                    const addr = session.sql_address || session.ADDRESS || session.address || '';
                                    const hash = session.sql_hash_value || session.HASH_VALUE || session.hash_value || '';
                                    const child = session.child || session.sql_child_number || session.SQL_CHILD_NUMBER || 0;
                                    const inst = session.inst_id || session.INST_ID || 1;
                                    const plan_hash = session.plan_hash || session.SQL_PLAN_HASH || session.sql_plan_hash || '';
                                    navigate(`/sql-central/sqlarea_replace?SQL_ID=${sql_id}&SQL_ADDR=${addr}&SQL_HASH=${hash}&SQL_CHILD=${child}&inst_id=${inst}&SQL_PLAN_HASH=${plan_hash}`)
                                }}>
                                    Show in SQL Central
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={!(session.blocking_session || session.blocked_cnt > 0)}
                                    onClick={() => {
                                        const inst = session.inst_id || session.INST_ID || 1;
                                        navigate(`/block-explorer/${session.sid}?inst_id=${inst}`);
                                    }}
                                >
                                    Block Explorer
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Reports</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Reports</DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            const child = session.child || session.sql_child_number || session.SQL_CHILD_NUMBER || 0;

                                                            console.log('Sidebar SQL Statistics Click:', { sql_id, inst, child });

                                                            if (sql_id && sql_id !== 'undefined') {
                                                                const sid = session.sid || session.SID || '';
                                                                const serial = session['serial#'] || session.serial || '';
                                                                const spid = session.spid || session.SPID || '';
                                                                navigate(`/sql-report/statistics/${sql_id}?inst_id=${inst}&child_number=${child}&sid=${sid}&serial=${serial}&spid=${spid}`);
                                                            } else {
                                                                alert('Cannot open report: SQL ID is missing or invalid.');
                                                            }
                                                        }}>
                                                            SQL Statistics
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/bind-capture/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            Bind Variables Capture
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/optimizer-env/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            Optimizer Environment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/plan-history/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            Plan Switch History
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem disabled>
                                                            SQL Monitor (External)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/xplan-all/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            XPlan All
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/xplan-stats/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            XPlan AllStats Last
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                            const inst = session.inst_id || session.INST_ID || 1;
                                                            if (sql_id) navigate(`/sql-report/xplan-stats/${sql_id}?inst_id=${inst}`);
                                                        }}>
                                                            XPlan AllStats
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem disabled>AWR SQL Report (text)</DropdownMenuItem>
                                                        <DropdownMenuItem disabled>AWR SQL Report (HTML)</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem disabled>AWR SQL Report (text)</DropdownMenuItem>
                                            <DropdownMenuItem disabled>AWR SQL Report (HTML)</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuItem onClick={() => {
                                    const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                    if (sql_id) navigator.clipboard.writeText(sql_id);
                                }}>
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
                        onClick={() => {
                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                            if (sql_id) navigate(`/explain-plan/${sql_id}`);
                        }}
                    >
                        Explain Plan
                    </Button>
                </div>
            </Card>
        </div>
    )
}

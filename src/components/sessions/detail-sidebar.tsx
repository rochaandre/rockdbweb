import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Activity,
    ChevronRight,
    BarChart,
    Lock,
    Terminal,
    Database,
    ExternalLink,
    Search,
    Info,
    History as HistoryIcon,
    Clipboard as ClipboardIcon,
    Clock,
    Cpu,
    HardDrive,
    Zap
} from 'lucide-react'
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
            <div className="flex w-85 flex-col gap-4 shrink-0 h-full">
                <div className="flex-1 rounded-2xl border-2 border-dashed border-border/20 bg-muted/5 flex flex-col items-center justify-center p-8 text-center">
                    <div className="size-12 rounded-2xl bg-muted/10 flex items-center justify-center mb-4 border border-border/10 shadow-inner">
                        <Activity className="size-6 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">No Selection</h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-2 font-medium">Select a live session from the stream<br />to analyze real-time forensics</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-85 flex-col gap-4 shrink-0 h-full overflow-hidden">
            {/* Session Identity Card */}
            <Card className="border-border/40 bg-surface/40 backdrop-blur-md overflow-hidden ring-1 ring-white/5 shadow-xl shrink-0">
                <CardHeader className="p-3 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Activity className="size-4.5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-wider">Session Forensics</CardTitle>
                                <div className="text-[10px] text-muted-foreground font-mono font-bold mt-0.5">SID {session.sid} : INST {session.inst_id || 1}</div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/10 p-2 rounded-xl border border-border/10 group hover:bg-muted/20 transition-colors">
                            <span className="text-[9px] font-black uppercase text-muted-foreground/60 block mb-1">SO PID</span>
                            <span className="text-xs font-mono font-bold text-primary">{session.spid || session.osPid || 'N/A'}</span>
                        </div>
                        <div className="bg-muted/10 p-2 rounded-xl border border-border/10 group hover:bg-muted/20 transition-colors">
                            <span className="text-[9px] font-black uppercase text-muted-foreground/60 block mb-1">Serial #</span>
                            <span className="text-xs font-mono font-bold">{session.serial || session['serial#']}</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground/60">Schema / User</span>
                            <span className="text-xs font-bold font-mono tracking-tight group-hover:text-primary transition-colors">{session.username || 'SYSTEM'}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground/60">Program</span>
                            <span className="text-xs font-medium truncate max-w-[150px] text-right" title={session.program}>{session.program || 'Oracle Internal'}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground/60">Machine</span>
                            <span className="text-xs font-medium truncate max-w-[150px] text-right" title={session.machine}>{session.machine || 'Localhost'}</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-all shadow-sm group">
                                    <div className="flex items-center gap-2">
                                        <Database className="size-3.5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">SQL ID</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-primary underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary">{session.sqlId || session.sql_id || 'None'}</span>
                                        <ChevronRight className="size-3 text-primary/40 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuItem onClick={() => {
                                    const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                    const addr = session.sql_address || session.ADDRESS || session.address || '';
                                    const hash = session.sql_hash_value || session.HASH_VALUE || session.hash_value || '';
                                    const child = session.child || session.sql_child_number || session.SQL_CHILD_NUMBER || 0;
                                    const inst = session.inst_id || session.INST_ID || 1;
                                    const plan_hash = session.plan_hash || session.SQL_PLAN_HASH || session.sql_plan_hash || '';
                                    navigate(`/sql-central/sqlarea_replace?SQL_ID=${sql_id}&SQL_ADDR=${addr}&SQL_HASH=${hash}&SQL_CHILD=${child}&inst_id=${inst}&SQL_PLAN_HASH=${plan_hash}`)
                                }}>
                                    <ExternalLink className="mr-2 size-4" />
                                    Open in SQL Central
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={!(session.blocking_session || session.blocked_cnt > 0)}
                                    onClick={() => {
                                        const inst = session.inst_id || session.INST_ID || 1;
                                        navigate(`/block-explorer/${session.sid}?inst_id=${inst}`);
                                    }}
                                >
                                    <Lock className="mr-2 size-4 text-amber-500" />
                                    Analyze Blocks
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <BarChart className="mr-2 size-4 text-emerald-500" />
                                        Performance Reports
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="min-w-[200px]">
                                            <DropdownMenuItem onClick={() => {
                                                const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                const inst = session.inst_id || session.INST_ID || 1;
                                                const child = session.child || session.sql_child_number || session.SQL_CHILD_NUMBER || 0;
                                                if (sql_id && sql_id !== 'undefined') {
                                                    const sid = session.sid || session.SID || '';
                                                    const serial = session['serial#'] || session.serial || '';
                                                    const spid = session.spid || session.SPID || '';
                                                    navigate(`/sql-report/statistics/${sql_id}?inst_id=${inst}&child_number=${child}&sid=${sid}&serial=${serial}&spid=${spid}`);
                                                }
                                            }}>
                                                <Activity className="mr-2 size-4" /> SQL Statistics
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                const inst = session.inst_id || session.INST_ID || 1;
                                                if (sql_id) navigate(`/sql-report/bind-capture/${sql_id}?inst_id=${inst}`);
                                            }}>
                                                <Search className="mr-2 size-4" /> Bind Capture
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                const inst = session.inst_id || session.INST_ID || 1;
                                                if (sql_id) navigate(`/sql-report/optimizer-env/${sql_id}?inst_id=${inst}`);
                                            }}>
                                                <Info className="mr-2 size-4" /> Optimizer Env
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                const inst = session.inst_id || session.INST_ID || 1;
                                                if (sql_id) navigate(`/sql-report/plan-history/${sql_id}?inst_id=${inst}`);
                                            }}>
                                                <HistoryIcon className="mr-2 size-4" /> Plan History
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => {
                                                const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                                const inst = session.inst_id || session.INST_ID || 1;
                                                if (sql_id) navigate(`/sql-report/xplan-all/${sql_id}?inst_id=${inst}`);
                                            }}>
                                                <ExternalLink className="mr-2 size-4 text-blue-500" /> Explain All
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuItem onClick={() => {
                                    const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                                    if (sql_id) navigator.clipboard.writeText(sql_id);
                                }}>
                                    <ClipboardIcon className="mr-2 size-4" />
                                    Copy SQL ID
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Consolidated Performance & Wait Metrics */}
            <Card className="border-border/40 bg-surface/40 backdrop-blur-md overflow-hidden ring-1 ring-white/5 shadow-xl shrink-0">
                <div className="px-3 py-2 bg-muted/20 border-b border-border/20 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                        <BarChart className="size-3 text-primary" /> Performance & Wait State
                    </span>
                    <span className="text-[9px] font-bold text-blue-500 tracking-tighter uppercase animate-pulse">Live Forensics</span>
                </div>
                <CardContent className="p-3 space-y-3">
                    <div className="text-[11px] font-bold font-mono text-foreground/90 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 leading-relaxed shadow-sm">
                        <div className="text-[8px] text-emerald-600/60 uppercase font-black mb-1 tracking-widest">Active Wait Event</div>
                        {session.event}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Elapsed', value: session.elapsed || '00:00:00', icon: Clock, color: 'text-slate-500' },
                            { label: 'CPU Usage', value: `${session.cpu || 0} ms`, icon: Cpu, color: 'text-amber-600' },
                            { label: 'PGA Memory', value: `${session.pga_used_mb || 0} MB`, icon: Database, color: 'text-blue-500' },
                            { label: 'Physical I/O', value: `${session.file_io || 0}`, icon: HardDrive, color: 'text-purple-500' },
                            { label: 'Wait Time', value: `${session.seconds_in_wait || 0}s`, icon: Clock, color: 'text-emerald-500' },
                            { label: 'Wait Class', value: session.wait_class || 'Idle', icon: Activity, color: 'text-rose-500' },
                            { label: 'Completion', value: `${session.completed || 0}%`, icon: Zap, color: 'text-blue-600' },
                            { label: 'PQ Links', value: `${session.pqs || 0}`, icon: Activity, color: 'text-slate-600' }
                        ].map((metric, i) => (
                            <div key={i} className="bg-muted/10 p-2 rounded-xl border border-border/10 hover:bg-muted/15 transition-all">
                                <span className="block text-[8px] font-black text-muted-foreground/50 uppercase tracking-tight mb-1">{metric.label}</span>
                                <div className="flex items-center gap-1.5">
                                    <metric.icon className={twMerge("size-3", metric.color)} />
                                    <span className="text-[11px] font-mono font-bold truncate">{metric.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {session.waitInfo?.length > 0 && (
                        <div className="pt-2 border-t border-border/10 space-y-1">
                            {session.waitInfo.map((line: string, i: number) => (
                                <p key={i} className="text-[9px] text-muted-foreground/60 font-mono italic leading-tight">{line}</p>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SQL Execution Context */}
            <Card className="border-border/40 bg-surface/40 backdrop-blur-md overflow-hidden ring-1 ring-white/5 shadow-xl flex-1 flex flex-col min-h-0">
                <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Terminal className="size-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Cursor Context</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-black/5 font-mono text-[11px] leading-relaxed text-foreground select-text whitespace-pre-wrap selection:bg-primary/30 no-scrollbar">
                    {sqlText || session.sqlText || <span className="italic text-muted-foreground opacity-30">// No execution trace available in SGA</span>}
                </div>

                <div className="p-2.5 bg-muted/20 border-t border-border/20 flex gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-[10px] font-black uppercase tracking-widest flex-1 rounded-xl bg-surface/50 border-border/30 hover:bg-surface transition-all"
                        disabled={!session.sqlId && !session.sql_id}
                    >
                        Detailed Trace
                    </Button>
                    <Button
                        size="sm"
                        variant="primary"
                        className="h-8 text-[10px] font-black uppercase tracking-widest flex-1 rounded-xl shadow-lg shadow-primary/10"
                        onClick={() => {
                            const sql_id = session.sql_id || session.sqlId || session.SQL_ID;
                            if (sql_id) navigate(`/explain-plan/${sql_id}`);
                        }}
                        disabled={!session.sqlId && !session.sql_id}
                    >
                        Explain Plan
                    </Button>
                </div>
            </Card>
        </div>
    )
}

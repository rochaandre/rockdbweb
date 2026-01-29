import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    session?: SessionDetail | null
}

export function DetailSidebar({ session }: DetailSidebarProps) {
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
                        <span>{session.serial}</span>

                        <span className="font-bold text-right">User Name:</span>
                        <span className="font-mono">{session.username}</span>

                        <span className="font-bold text-right">Schema:</span>
                        <span>{session.schema}</span>

                        <span className="font-bold text-right">Logon Time:</span>
                        <span>{session.logonTime}</span>

                        <span className="font-bold text-right">PID:</span>
                        <span>{session.pid}</span>

                        <span className="font-bold text-right">OS PID:</span>
                        <span>{session.osPid}</span>

                        <span className="font-bold text-right">PGA:</span>
                        <span>{session.pga}</span>

                        <span className="font-bold text-right">Last Call ET:</span>
                        <span>{session.lastCallEt}</span>

                        <span className="font-bold text-right">SQL ID:</span>
                        <span className="text-blue-600 underline cursor-pointer">{session.sqlId}</span>

                        <span className="font-bold text-right">Child:</span>
                        <span className="text-blue-600 underline cursor-pointer">{session.child}</span>
                    </div>
                </div>
            </Card>

            {/* Wait State Info */}
            <Card className="p-0 gap-0 overflow-hidden h-40">
                <div className="bg-surface-raised border-b border-border px-2 py-1 text-xs font-semibold">
                    {session.event}
                </div>
                <CardContent className="p-2 text-xs font-mono text-foreground h-full overflow-auto bg-white">
                    {session.waitInfo.map((line, i) => (
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
                    {session.sqlText}
                </CardContent>
                <div className="flex gap-1 p-1 bg-surface-raised border-t border-border">
                    <Button size="sm" variant="secondary" className="h-6 text-xs flex-1">Expand</Button>
                    <Button size="sm" variant="secondary" className="h-6 text-xs flex-1">Explain Plan</Button>
                </div>
            </Card>
        </div>
    )
}

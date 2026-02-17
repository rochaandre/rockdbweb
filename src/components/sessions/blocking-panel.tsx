import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BlockingTable } from '@/components/sessions/blocking-table'
import { ShieldAlert, Info, AlertTriangle, Skull } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function BlockingPanel() {
    // Note: BlockingPanel acts as a formal wrapper for BlockingTable in the legacy view
    // while providing additional context and warnings.

    const handleAction = (action: string, session: any) => {
        console.log(`BlockingPanel action: ${action} for SID: ${session.sid}`)
        // The parent SessionsView handles the actual communication through global fetch/state
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Warning Header */}
            <Card className="bg-rose-50 border-rose-200 shadow-sm overflow-hidden border-l-4 border-l-rose-500">
                <CardHeader className="py-3 px-4 flex flex-row items-center gap-4">
                    <div className="p-2 bg-rose-500 rounded-full">
                        <ShieldAlert className="size-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                            Wait-Chain Investigation
                            <Badge variant="destructive" className="animate-pulse text-[10px] h-4 px-1">CRITICAL</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs text-rose-700 font-medium">
                            Sessions identified below are either holding locks or waiting for resources.
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-rose-900 uppercase">Detection Mode</p>
                        <p className="text-[10px] text-rose-700">Real-time Wait Chain</p>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Blocking Hierarchy</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-red-400" /> BLOCKER</span>
                        <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-yellow-300" /> WAITER</span>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-2">
                    <BlockingTable onAction={handleAction} />
                </div>

                {/* Legend/Context Footer */}
                <div className="bg-muted/10 p-3 border-t flex items-start gap-3">
                    <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                        <p><span className="font-bold text-foreground">Tip:</span> Red rows represent root blockers. Use the <Skull className="inline size-3 mx-0.5" /> <strong>Kill</strong> action to release the wait chain if the session is hanging production workflows. Use <strong>Block Explorer</strong> for deep recursive analysis.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

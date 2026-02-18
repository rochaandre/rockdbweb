
import { useState } from 'react'
import { X, Copy, Check, Terminal, Info, Skull } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KillCommandsDialogProps {
    session: any
    onClose: () => void
}

export function KillCommandsDialog({ session, onClose }: KillCommandsDialogProps) {
    const [copied, setCopied] = useState<string | null>(null)

    if (!session) return null

    const sid = session.sid || session.SID
    const serial = session['serial#'] || session.serial || session.SERIAL
    const instId = session.inst_id || 1
    const spid = session.spid || session.SPID

    const oracleKill = `alter system kill session '${sid},${serial},@${instId}' immediate;`
    const osKill = `kill -9 ${spid}`

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="w-[500px] bg-surface border border-border rounded-lg shadow-xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b bg-surface-raised">
                    <div className="flex items-center gap-2">
                        <Skull className="h-4 w-4 text-destructive" />
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                            Kill Commands Registry
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-muted p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Info Alert */}
                    <div className="flex items-start gap-3 p-3 rounded border border-primary/20 bg-primary/5 text-primary">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="text-[11px] leading-relaxed font-medium">
                            <p className="font-bold uppercase mb-0.5">Manual Procedure</p>
                            <p className="opacity-80">Execution must be performed manually via terminal/command-line tools when standard termination fails.</p>
                        </div>
                    </div>

                    {/* Oracle Kill Block */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-0.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                <DatabaseIcon className="h-3 w-3" /> Oracle Database 命令
                            </label>
                            <span className="text-[9px] text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded border border-border/50">SQL*PLUS / SQLCL</span>
                        </div>
                        <div className="relative group">
                            <div className="p-3 pr-12 rounded border border-border bg-surface font-mono text-[11px] text-foreground break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                                {oracleKill}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1.5 top-1.5 h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={() => handleCopy(oracleKill, 'oracle')}
                                title="Copy Oracle Command"
                            >
                                {copied === 'oracle' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>

                    {/* OS Kill Block */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-0.5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                <Terminal className="h-3 w-3" /> Operating System (Unix)
                            </label>
                            <span className="text-[9px] text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded border border-border/50">SSH SHELL</span>
                        </div>
                        <div className="relative group">
                            <div className="p-3 pr-12 rounded border border-border bg-surface font-mono text-[11px] text-foreground break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                                {osKill}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1.5 top-1.5 h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={() => handleCopy(osKill, 'os')}
                                title="Copy OS Command"
                            >
                                {copied === 'os' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        {!spid && (
                            <div className="px-1 text-[10px] text-amber-600 font-medium italic flex items-center gap-1.5">
                                <Info className="h-3 w-3" /> <span>SPID not recorded for this session entry.</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Info Detail */}
                    <div className="grid grid-cols-4 gap-2 p-2 bg-surface-raised border border-border/60 rounded">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">SID</span>
                            <span className="text-[10px] font-mono font-bold">{sid}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-border/40">
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">SERIAL</span>
                            <span className="text-[10px] font-mono font-bold">{serial}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-border/40">
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">INSTANCE</span>
                            <span className="text-[10px] font-mono font-bold">{instId}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-border/40">
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">SPID</span>
                            <span className="text-[10px] font-mono font-bold text-primary">{spid || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-4 py-3 bg-surface-raised border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="h-8 text-[10px] font-bold uppercase px-6 border-border hover:bg-muted/50">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}

function DatabaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    )
}

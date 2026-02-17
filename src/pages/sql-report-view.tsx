
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Printer, FileType } from 'lucide-react'

export function SqlReportView() {
    const { reportType, sqlId } = useParams()
    const navigate = useNavigate()

    const getTitle = () => {
        switch (reportType) {
            case 'bind-capture': return 'Bind Variables Capture'
            case 'statistics': return 'SQL Statistics'
            case 'optimizer-env': return 'Optimizer Environment'
            case 'plan-history': return 'Plan Switch History'
            case 'xplan': return 'XPlan'
            case 'xplan-all': return 'XPlan All'
            case 'xplan-stats': return 'XPlan AllStats'
            default: return 'SQL Report'
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header / Toolbar */}
                <div className="border-b border-border bg-muted/20 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                        <h1 className="text-sm font-semibold ml-2">{getTitle()} - PRD</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7"><FileType className="h-4 w-4 mr-1" /> HTML</Button>
                        <Button variant="ghost" size="sm" className="h-7"><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                        <Button variant="ghost" size="sm" className="h-7"><Printer className="h-4 w-4 mr-1" /> Print</Button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50/50 border-b border-blue-200 p-4 shadow-sm">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900">Instance ID:</span>
                            <span>1</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900">SQL ID:</span>
                            <Link to="/sessions" className="text-blue-600 underline hover:text-blue-800 font-mono">
                                {sqlId}
                            </Link>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900">Database:</span>
                            <span>CDBPRD</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-900">Time:</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    {/* See Also Links */}
                    <div className="mt-3 pt-3 border-t border-blue-200 text-xs flex gap-3 flex-wrap">
                        <span className="font-semibold text-blue-900">See also:</span>
                        {[
                            { label: 'SQL Statistics', type: 'statistics' },
                            { label: 'Plan Switch History', type: 'plan-history' },
                            { label: 'XPlan', type: 'xplan' },
                            { label: 'Optimizer Env', type: 'optimizer-env' },
                            { label: 'Stage in SQL Central', path: `/sql-central/${sqlId}` }
                        ].map((link, i) => (
                            link.path ? (
                                <Link key={i} to={link.path} className="text-blue-600 hover:underline">
                                    {link.label}
                                </Link>
                            ) : (
                                <Link key={i} to={`/sql-report/${link.type}/${sqlId}`} className="text-blue-600 hover:underline">
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold">SQL {getTitle()}</h2>
                        <div className="text-sm text-muted-foreground">
                            NO DATA.<br />
                            <span className="text-xs opacity-70">source: v$sql_bind_capture</span>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold">Peeked Bind Variables</h2>
                        <div className="text-sm text-muted-foreground">
                            <span className="text-xs opacity-70">source: v$sql_bind_data</span>
                        </div>
                    </div>

                    {/* SQL Text Section */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold">SQL Text</h2>
                        <div className="bg-muted/10 border border-border rounded-md p-4 font-mono text-xs whitespace-pre-wrap">
                            {`SELECT COUNT(HIST_SUBS_PAC.CD_HIST_SUBS_PAC)
FROM 
    (
        SELECT COUNT(*) QT_CANC, CD_HIST_SUBS_PAC_CANC
        FROM DBAMV.HIST_SUBS_PAC
        WHERE CD_HIST_SUBS_PAC_CANC IS NOT NULL
        GROUP BY CD_HIST_SUBS_PAC_CANC
    ) VERIFICA_CANC, HIST_SUBS_PAC
WHERE EXISTS (
    SELECT 'X' 
    FROM DBAMV.PW_LOG_IMPORT_ALERG LOG_IMPORT
    WHERE HIST_SUBS_PAC.CD_HIST_SUBS_PAC = LOG_IMPORT.CD_HIST_SUBS_PAC
    AND NVL(LOG_IMPORT.QT_CANC, 0) < NVL(VERIFICA_CANC.QT_CANC, 0)
)
AND VERIFICA_CANC.CD_HIST_SUBS_PAC_CANC(+) = HIST_SUBS_PAC.CD_HIST_SUBS_PAC`}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

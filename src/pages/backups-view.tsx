import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    BackupJobsTable, BackupSetsTable, DatafilesTable, BackupImagesTable,
    BackupSummaryTable, RmanGenerator, ExpdpGenerator,
    RecoverySummaryCard, IncarnationTable, DatafileDetailedTable,
    RmanStatusTable, RmanConfigTable, BackupSizeHistoryTable
} from "@/components/backups/backup-components"
import { useApp, API_URL } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function BackupsView() {
    const [activeTab, setActiveTab] = useState('summary')
    const { logAction, activeConnection } = useApp()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [jobs, setJobs] = useState<any[]>([])
    const [summary, setSummary] = useState<any[]>([])
    const [summaryDays, setSummaryDays] = useState(30)
    const [images, setImages] = useState<any[]>([])
    const [nlsParams, setNlsParams] = useState<any>(null)
    const [recoverySummary, setRecoverySummary] = useState<any>(null)
    const [incarnations, setIncarnations] = useState<any[]>([])
    const [recoveryDatafiles, setRecoveryDatafiles] = useState<any[]>([])
    const [rmanStatus, setRmanStatus] = useState<any[]>([])
    const [rmanConfig, setRmanConfig] = useState<any[]>([])
    const [rmanBackupSize, setRmanBackupSize] = useState<any[]>([])
    const [backupInfo, setBackupInfo] = useState<any[]>([])

    const fetchBackups = async () => {
        setIsRefreshing(true)
        setError(null)
        try {
            const [
                jobsRes,
                summaryRes,
                imagesRes,
                nlsRes,
                recSummaryRes,
                incRes,
                recDfRes,
                rmanStatusRes,
                rmanConfigRes,
                rmanSizeRes,
                backupInfoRes
            ] = await Promise.all([
                fetch(`${API_URL}/backups/jobs`),
                fetch(`${API_URL}/backups/summary?days=${summaryDays}`),
                fetch(`${API_URL}/backups/images`),
                fetch(`${API_URL}/backups/nls`),
                fetch(`${API_URL}/backups/recovery/summary`),
                fetch(`${API_URL}/backups/recovery/incarnations`),
                fetch(`${API_URL}/backups/recovery/datafiles`),
                fetch(`${API_URL}/backups/rman/status?days=${summaryDays}`),
                fetch(`${API_URL}/backups/rman/configuration`),
                fetch(`${API_URL}/backups/rman/size?days=${summaryDays}`),
                fetch(`${API_URL}/backups/info?days=${summaryDays}`)
            ])

            if (jobsRes.ok) setJobs(await jobsRes.json())
            if (summaryRes.ok) {
                const data = await summaryRes.json()
                console.log('Backup Summary data:', data)
                setSummary(data)
            }
            if (imagesRes.ok) setImages(await imagesRes.json())
            if (nlsRes.ok) setNlsParams(await nlsRes.json())
            if (recSummaryRes.ok) setRecoverySummary(await recSummaryRes.json())
            if (incRes.ok) setIncarnations(await incRes.json())
            if (recDfRes.ok) setRecoveryDatafiles(await recDfRes.json())

            // Improved error handling for RMAN reports
            if (rmanStatusRes.ok) {
                setRmanStatus(await rmanStatusRes.json())
            } else {
                console.error('Failed to fetch RMAN Status:', rmanStatusRes.status)
                setRmanStatus([])
            }

            if (rmanConfigRes.ok) {
                setRmanConfig(await rmanConfigRes.json())
            } else {
                console.error('Failed to fetch RMAN Config:', rmanConfigRes.status)
                setRmanConfig([])
            }

            if (rmanSizeRes.ok) {
                setRmanBackupSize(await rmanSizeRes.json())
            } else {
                console.error('Failed to fetch RMAN Size:', rmanSizeRes.status)
                setRmanBackupSize([])
            }

            if (backupInfoRes.ok) {
                setBackupInfo(await backupInfoRes.json())
            } else {
                console.error('Failed to fetch Backup Info:', backupInfoRes.status)
                setBackupInfo([])
            }

            if (!jobsRes.ok || !summaryRes.ok) {
                setError("Partial failure loading backup data. Please check connection and privileges.")
            }

        } catch (err: any) {
            console.error('Error fetching backups:', err)
            setError(err.message || "Failed to connect to backend")
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchBackups()
    }, [summaryDays])

    // Drill-down State
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined)
    const [selectedSetKey, setSelectedSetKey] = useState<number | undefined>(undefined)

    const [sets, setSets] = useState<any[]>([])
    const [backupFiles, setBackupFiles] = useState<any[]>([])

    useEffect(() => {
        if (selectedJobId) {
            fetch(`${API_URL}/backups/sets/${selectedJobId}`)
                .then(res => res.json())
                .then(data => setSets(data))
                .catch(err => console.error(err))
        } else {
            setSets([])
        }
    }, [selectedJobId])

    useEffect(() => {
        if (selectedSetKey) {
            fetch(`${API_URL}/backups/files/${selectedSetKey}`)
                .then(res => res.json())
                .then(data => setBackupFiles(data))
                .catch(err => console.error(err))
        } else {
            setBackupFiles([])
        }
    }, [selectedSetKey])

    const handleJobSelect = (id: number) => {
        logAction('Backup', 'DrillDown', `Selected Job #${id}`)
        setSelectedJobId(id)
        setSelectedSetKey(undefined) // Reset child selection
    }

    const handleSetSelect = (key: number) => {
        logAction('Backup', 'DrillDown', `Selected Set #${key}`)
        setSelectedSetKey(key)
    }

    const handleRefresh = () => {
        fetchBackups()
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Backup & Recovery</h1>
                    <div className="flex items-center gap-3">
                        {['summary', 'info', 'progress', 'reports', 'images'].includes(activeTab) && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 border border-border">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Range:</span>
                                <select
                                    value={summaryDays}
                                    onChange={(e) => setSummaryDays(Number(e.target.value))}
                                    className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer h-6 p-0"
                                >
                                    <option value={1}>Oculto (1 d)</option>
                                    <option value={7}>Semana (7 d)</option>
                                    <option value={15}>Quinzena (15 d)</option>
                                    <option value={30}>Mês (30 d)</option>
                                    <option value={90}>Trimestre (90 d)</option>
                                </select>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-2"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={twMerge("size-4", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="size-2 rounded-full bg-destructive animate-pulse" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {activeConnection.db_type === 'PDB' && ['summary', 'info', 'progress', 'reports', 'images'].includes(activeTab) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-amber-500 leading-none">PDB Connection Warning</h4>
                            <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                                Currently connected to a PDB (Pluggable Database). RMAN backups are globally managed at the CDB (Container) level.
                                Backup information displayed here may be incomplete or inaccurate for PDB connections.
                                For full visibility, please connect to the <span className="underline decoration-amber-500/30">CDB$ROOT</span>.
                            </p>
                        </div>
                    </div>
                )}

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="summary"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Summary
                            </TabsTrigger>
                            <TabsTrigger
                                value="info"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="progress"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Active Jobs
                            </TabsTrigger>
                            <TabsTrigger
                                value="reports"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Backup Sets
                            </TabsTrigger>
                            <TabsTrigger
                                value="images"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Backup Images
                            </TabsTrigger>
                            <TabsTrigger
                                value="recovery"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Recovery Ops
                            </TabsTrigger>
                            <TabsTrigger
                                value="rman"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                RMAN Gen
                            </TabsTrigger>
                            <TabsTrigger
                                value="expdp"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Expdp Gen
                            </TabsTrigger>
                            <TabsTrigger
                                value="rman_status"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                RMAN History & Config
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="summary" className="flex-1 mt-4 overflow-auto space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <BackupSummaryTable summary={summary} />
                            </div>
                            <div className="lg:col-span-1">
                                <BackupSizeHistoryTable data={rmanBackupSize} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="info" className="flex-1 mt-4 overflow-auto">
                        <div className="space-y-4">
                            <div className="rounded-md border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Completion</th>
                                            <th className="px-4 py-3 text-left">BS Key</th>
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-left">BP Key</th>
                                            <th className="px-4 py-3 text-right">Size (MB)</th>
                                            <th className="px-4 py-3 text-center">Pieces</th>
                                            <th className="px-4 py-3 text-left">Device</th>
                                            <th className="px-4 py-3 text-left">Handle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-[11px]">
                                        {backupInfo.length > 0 ? (
                                            <>
                                                {backupInfo.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-2 font-mono">{row.completion_time}</td>
                                                        <td className="px-4 py-2 text-center font-bold text-primary">{row.bs_key}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={twMerge(
                                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                                row.type === 'FULL' || row.type === 'LEVEL0' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                                    row.type === 'ARCHIVELOG' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                                        "bg-muted text-muted-foreground border border-border"
                                                            )}>
                                                                {row.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-muted-foreground">{row.bp_key}</td>
                                                        <td className="px-4 py-2 text-right font-mono font-bold text-green-500">
                                                            {row.bp_mb?.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">{row.pieces}</td>
                                                        <td className="px-4 py-2 text-xs">{row.device_type}</td>
                                                        <td className="px-4 py-2 text-[10px] text-muted-foreground truncate max-w-[200px]" title={row.handle}>
                                                            {row.handle}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-muted/50 font-bold border-t-2 border-border">
                                                    <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-wider text-[10px]">Total BP_MB:</td>
                                                    <td className="px-4 py-3 text-right text-green-500 text-sm">
                                                        {backupInfo.reduce((sum, row) => sum + (Number(row.bp_mb) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td colSpan={3}></td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                                    No backup info found for the selected range.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="flex-1 mt-4 overflow-auto">
                        <BackupJobsTable data={jobs.filter(j => j.status === 'RUNNING')} showHeader={false} />
                    </TabsContent>

                    <TabsContent value="reports" className="flex-1 mt-4 overflow-auto space-y-4">
                        <BackupJobsTable data={jobs} selectedId={selectedJobId} onSelect={handleJobSelect} />

                        {selectedJobId && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <BackupSetsTable jobId={selectedJobId} sets={sets} selectedKey={selectedSetKey} onSelect={handleSetSelect} />
                            </div>
                        )}

                        {selectedSetKey && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <DatafilesTable bsKey={selectedSetKey} files={backupFiles} />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="images" className="flex-1 mt-4 overflow-auto space-y-4">
                        <BackupImagesTable images={images} />
                    </TabsContent>

                    <TabsContent value="recovery" className="flex-1 mt-4 overflow-auto space-y-6">
                        <RecoverySummaryCard summary={recoverySummary} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <IncarnationTable incarnations={incarnations} />
                            </div>
                            <div className="lg:col-span-2">
                                <DatafileDetailedTable datafiles={recoveryDatafiles} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="rman" className="flex-1 mt-4 overflow-auto h-[calc(100vh-280px)]">
                        <RmanGenerator nlsParams={nlsParams} />
                    </TabsContent>

                    <TabsContent value="expdp" className="flex-1 mt-4 overflow-auto">
                        <ExpdpGenerator nlsParams={nlsParams} />
                    </TabsContent>

                    <TabsContent value="rman_status" className="flex-1 mt-4 overflow-auto space-y-6">
                        <RmanStatusTable data={rmanStatus} />
                        <RmanConfigTable data={rmanConfig} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

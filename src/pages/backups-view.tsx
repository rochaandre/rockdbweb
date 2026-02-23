import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    BackupJobsTable, BackupSetsTable, DatafilesTable, BackupImagesTable,
    BackupSummaryTable, RmanGenerator, ExpdpGenerator,
    RecoverySummaryCard, IncarnationTable, DatafileDetailedTable,
    RmanStatusTable, RmanConfigTable
} from "@/components/backups/backup-components"
import { useApp, API_URL } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function BackupsView() {
    const [activeTab, setActiveTab] = useState('progress')
    const { logAction } = useApp()
    const [isRefreshing, setIsRefreshing] = useState(false)
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
    const fetchBackups = async () => {
        setIsRefreshing(true)
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
                rmanConfigRes
            ] = await Promise.all([
                fetch(`${API_URL}/backups/jobs`),
                fetch(`${API_URL}/backups/summary?days=${summaryDays}`),
                fetch(`${API_URL}/backups/images`),
                fetch(`${API_URL}/backups/nls`),
                fetch(`${API_URL}/backups/recovery/summary`),
                fetch(`${API_URL}/backups/recovery/incarnations`),
                fetch(`${API_URL}/backups/recovery/datafiles`),
                fetch(`${API_URL}/backups/rman/status`),
                fetch(`${API_URL}/backups/rman/configuration`)
            ])

            if (jobsRes.ok) setJobs(await jobsRes.json())
            if (summaryRes.ok) setSummary(await summaryRes.json())
            if (imagesRes.ok) setImages(await imagesRes.json())
            if (nlsRes.ok) setNlsParams(await nlsRes.json())
            if (recSummaryRes.ok) setRecoverySummary(await recSummaryRes.json())
            if (incRes.ok) setIncarnations(await incRes.json())
            if (recDfRes.ok) setRecoveryDatafiles(await recDfRes.json())

            const rmanStatusData = await rmanStatusRes.json().catch(() => [])
            const rmanConfigData = await rmanConfigRes.json().catch(() => [])
            setRmanStatus(Array.isArray(rmanStatusData) ? rmanStatusData : [])
            setRmanConfig(Array.isArray(rmanConfigData) ? rmanConfigData : [])

        } catch (error) {
            console.error('Error fetching backups:', error)
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

                    <TabsContent value="summary" className="flex-1 mt-4 overflow-auto">
                        <BackupSummaryTable summary={summary} />
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

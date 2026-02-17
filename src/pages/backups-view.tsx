import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackupJobsTable, BackupSetsTable, DatafilesTable, ExpdpGenerator, BackupSummaryTable, RmanGenerator } from '@/components/backups/backup-components'
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
    const [nlsParams, setNlsParams] = useState<any>(null)

    const fetchBackups = async () => {
        setIsRefreshing(true)
        try {
            const [jobsRes, summaryRes, nlsRes] = await Promise.all([
                fetch(`${API_URL}/backups/jobs`),
                fetch(`${API_URL}/backups/summary`),
                fetch(`${API_URL}/backups/nls`)
            ])
            if (jobsRes.ok) setJobs(await jobsRes.json())
            if (summaryRes.ok) setSummary(await summaryRes.json())
            if (nlsRes.ok) setNlsParams(await nlsRes.json())
        } catch (error) {
            console.error('Error fetching backups:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchBackups()
    }, [])

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

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
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
                                Reports (Drill-down)
                            </TabsTrigger>
                            <TabsTrigger
                                value="summary"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Summary
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
                        </TabsList>
                    </div>

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

                    <TabsContent value="summary" className="flex-1 mt-4 overflow-auto">
                        <BackupSummaryTable summary={summary} />
                    </TabsContent>

                    <TabsContent value="rman" className="flex-1 mt-4 overflow-auto">
                        <RmanGenerator nlsParams={nlsParams} />
                    </TabsContent>

                    <TabsContent value="expdp" className="flex-1 mt-4 overflow-auto">
                        <ExpdpGenerator nlsParams={nlsParams} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

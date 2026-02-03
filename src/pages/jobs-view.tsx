import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
    Clock,
    RefreshCcw,
    Play,
    Pause,
    Trash2,
    Eye,
    AlertCircle,
    CheckCircle2,
    Activity,
    Info,
    User,
    Calendar,
    Code,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useApp, API_URL } from '@/context/app-context'

interface LegacyJob {
    job: number
    schema_name: string
    last_run: string | null
    next_run: string | null
    failures: number
    broken: string
    frequency: string
    details: string
}

interface RunningJob {
    sid: number
    serial: number
    job: number
    start_time: string
    event: string
    seconds_in_wait: number
    state: string
    details: string
}

export function JobsView() {
    const [jobs, setJobs] = useState<LegacyJob[]>([])
    const [runningJobs, setRunningJobs] = useState<RunningJob[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedJob, setSelectedJob] = useState<LegacyJob | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isNewJobOpen, setIsNewJobOpen] = useState(false)

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const [jobsRes, runningJobsRes] = await Promise.all([
                fetch(`${API_URL}/jobs/legacy`),
                fetch(`${API_URL}/jobs/running`)
            ])
            const jobsData = await jobsRes.json()
            const runningData = await runningJobsRes.json()
            setJobs(jobsData)
            setRunningJobs(runningData)
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleRunJob = async (jobId: number) => {
        try {
            const res = await fetch(`${API_URL}/jobs/run?job_id=${jobId}`, { method: 'POST' })
            if (res.ok) fetchJobs()
        } catch (error) {
            console.error('Failed to run job:', error)
        }
    }

    const handleToggleBroken = async (jobId: number, currentBroken: boolean) => {
        try {
            const res = await fetch(`${API_URL}/jobs/broken?job_id=${jobId}&broken=${!currentBroken}`, { method: 'POST' })
            if (res.ok) fetchJobs()
        } catch (error) {
            console.error('Failed to toggle job status:', error)
        }
    }

    const handleRemoveJob = async (jobId: number) => {
        if (!confirm('Are you sure you want to remove this job?')) return
        try {
            const res = await fetch(`${API_URL}/jobs/remove?job_id=${jobId}`, { method: 'DELETE' })
            if (res.ok) fetchJobs()
        } catch (error) {
            console.error('Failed to remove job:', error)
        }
    }

    const brokenJobs = jobs.filter(j => j.broken === 'Y').length
    const failedJobs = jobs.filter(j => j.failures > 0).length

    return (
        <MainLayout>
            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Jobs Management (Legacy)</h1>
                        <p className="text-muted-foreground text-sm">Monitor and control legacy Oracle jobs via DBMS_JOB.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsNewJobOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" /> New Job
                        </Button>
                        <Button
                            onClick={fetchJobs}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={isLoading}
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-background/50 border-border/50">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Jobs</p>
                                <p className="text-2xl font-bold">{jobs.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 border-border/50">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Running</p>
                                <p className="text-2xl font-bold">{runningJobs.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 border-border/50">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Broken</p>
                                <p className="text-2xl font-bold text-yellow-500">{brokenJobs}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 border-border/50">
                        <CardContent className="pt-4 flex items-center gap-4">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Failed</p>
                                <p className="text-2xl font-bold text-destructive">{failedJobs}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-background/50 border border-border/50 p-1">
                        <TabsTrigger value="all" className="gap-2">
                            <Clock className="h-4 w-4" /> All Jobs
                        </TabsTrigger>
                        <TabsTrigger value="running" className="gap-2">
                            <Activity className="h-4 w-4" /> Execution Report
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                        <Card className="border-border/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job ID</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Schema</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Frequency (Interval)</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Run</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Next Run</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {jobs.map((job) => (
                                            <tr key={job.job} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-4 py-3 font-medium text-primary">#{job.job}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        {job.schema_name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[11px] max-w-[200px] truncate" title={job.frequency}>
                                                    {job.frequency}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{job.last_run || 'Never'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{job.next_run || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    {job.broken === 'Y' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                                                            <Pause className="h-2.5 w-2.5" /> Broken
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                                            <CheckCircle2 className="h-2.5 w-2.5" /> Active
                                                        </span>
                                                    )}
                                                    {job.failures > 0 && (
                                                        <span className="ml-2 text-destructive text-[10px] font-bold italic">
                                                            ({job.failures} Fails)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary"
                                                            title="View Details"
                                                            onClick={() => {
                                                                setSelectedJob(job)
                                                                setIsDetailsOpen(true)
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500"
                                                            title="Run Manual"
                                                            onClick={() => handleRunJob(job.job)}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn("h-8 w-8", job.broken === 'Y' ? "text-green-500" : "text-yellow-500")}
                                                            title={job.broken === 'Y' ? "Enable" : "Disable"}
                                                            onClick={() => handleToggleBroken(job.job, job.broken === 'Y')}
                                                        >
                                                            {job.broken === 'Y' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            title="Remove Job"
                                                            onClick={() => handleRemoveJob(job.job)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="running" className="mt-4">
                        <Card className="border-border/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">SID / Serial</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job ID</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Started</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wait Event</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wait Seconds</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">State</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {runningJobs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                                                    No jobs currently executing.
                                                </td>
                                            </tr>
                                        ) : (
                                            runningJobs.map((rj) => (
                                                <tr key={rj.sid} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3 font-mono font-bold text-blue-500">{rj.sid}, {rj.serial}</td>
                                                    <td className="px-4 py-3 font-medium">#{rj.job}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{rj.start_time}</td>
                                                    <td className="px-4 py-3 max-w-[200px] truncate" title={rj.event}>{rj.event}</td>
                                                    <td className="px-4 py-3 font-mono">{rj.seconds_in_wait}s</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                                                            {rj.state}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl bg-background border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Job Details #{selectedJob?.job}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedJob && (
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                                        <User className="h-3 w-3" /> Schema Name
                                    </Label>
                                    <p className="text-sm font-medium">{selectedJob.schema_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Frequency (Interval)
                                    </Label>
                                    <p className="text-sm font-mono text-primary">{selectedJob.frequency}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> Next Run Estimated
                                    </Label>
                                    <p className="text-sm">{selectedJob.next_run || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border/50">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                                    <Code className="h-3 w-3" /> PL/SQL Block (WHAT)
                                </Label>
                                <div className="bg-muted p-4 rounded-lg border border-border/50 font-mono text-[11px] selection:bg-primary/20">
                                    <ScrollArea className="h-[200px]">
                                        <pre className="whitespace-pre-wrap">{selectedJob.details}</pre>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <NewJobDialog
                open={isNewJobOpen}
                onOpenChange={setIsNewJobOpen}
                onSuccess={fetchJobs}
            />
        </MainLayout>
    )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={className}>{children}</span>
}

interface NewJobDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function NewJobDialog({ open, onOpenChange, onSuccess }: NewJobDialogProps) {
    const [what, setWhat] = useState('')
    const [nextDate, setNextDate] = useState('')
    const [interval, setInterval] = useState("'SYSDATE + 1/24'")
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch(`${API_URL}/jobs/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    what,
                    next_date: nextDate || null,
                    interval: interval || null
                })
            })
            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                setWhat('')
                setNextDate('')
            }
        } catch (error) {
            console.error('Failed to submit job:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Legacy Job
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                            PL/SQL Block (WHAT)
                        </Label>
                        <textarea
                            className="w-full h-32 bg-muted p-3 rounded-md border border-border/50 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="procedure_name; or BEGIN ... END;"
                            value={what}
                            onChange={(e) => setWhat(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                                Next Run (Optional)
                            </Label>
                            <input
                                type="text"
                                className="w-full bg-muted p-2 rounded-md border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="YYYY-MM-DD HH24:MI:SS"
                                value={nextDate}
                                onChange={(e) => setNextDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                                Interval / Frequency
                            </Label>
                            <input
                                type="text"
                                className="w-full bg-muted p-2 rounded-md border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                placeholder="'SYSDATE + 1'"
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !what}>
                            {isSaving ? 'Submitting...' : 'Create Job'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

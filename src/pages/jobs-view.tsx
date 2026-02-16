/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: jobs-view.tsx
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 *
 * TERMS:
 * 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
 * 2. YOU MAY NOT MODIFY, transform, or build upon this code.
 * 3. You must maintain this header and original naming/ownership information.
 *
 * This software is provided "AS IS", without warranty of any kind.
 * Copyright (c) 2026 Andre Rocha. All rights reserved.
 * ==============================================================================
 */
import { MainLayout } from '@/components/layout/main-layout'
import { JobsTable, RunningJobsTable, JobStatsCard } from '@/components/jobs/job-components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import { API_URL, useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw, Play, Plus, Clock, Activity, Calendar } from 'lucide-react'

export function JobsView() {
    const [activeTab, setActiveTab] = useState('all')
    const { logAction } = useApp()
    const [jobs, setJobs] = useState<any[]>([])
    const [running, setRunning] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const [jobsRes, runningRes] = await Promise.all([
                fetch(`${API_URL}/jobs`),
                fetch(`${API_URL}/jobs/running`)
            ])
            if (jobsRes.ok) setJobs(await jobsRes.json())
            if (runningRes.ok) setRunning(await runningRes.json())
        } catch (error) {
            console.error('Error fetching jobs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleAction = async (jobId: number, action: string) => {
        try {
            const res = await fetch(`${API_URL}/jobs/${action}/${jobId}`, { method: 'POST' })
            if (res.ok) {
                fetchJobs()
                logAction('Action', 'DBMS_JOB', `${action} job #${jobId}`)
                alert(`Action ${action} executed for Job ${jobId}`)
            }
        } catch (error) {
            console.error(`Error executing ${action} on job:`, error)
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Legacy Jobs (DBMS_JOB)</h1>
                        <p className="text-muted-foreground text-sm">Monitor and manage traditional Oracle background processes</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={isLoading} className="gap-2">
                            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="size-4" />
                            Submit Job
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <JobStatsCard
                        title="Registered Jobs"
                        value={jobs.length}
                        description="Total DBMS_JOB entries"
                        icon={<Calendar className="size-4 text-primary" />}
                    />
                    <JobStatsCard
                        title="Executing Now"
                        value={running.length}
                        description="Currently active job processes"
                        icon={<Activity className="size-4 text-emerald-500" />}
                        trend={running.length > 0 ? "Active" : "Idle"}
                    />
                    <JobStatsCard
                        title="Broken Jobs"
                        value={jobs.filter(j => j.broken === 'Y').length}
                        description="Jobs with execution failures"
                        icon={<Clock className="size-4 text-rose-500" />}
                        variant={jobs.filter(j => j.broken === 'Y').length > 0 ? "danger" : "default"}
                    />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="all"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                All Jobs
                            </TabsTrigger>
                            <TabsTrigger
                                value="running"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Running
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-auto mt-4 pr-2">
                        <TabsContent value="all" className="m-0">
                            <JobsTable data={jobs} onAction={handleAction} />
                        </TabsContent>
                        <TabsContent value="running" className="m-0">
                            <RunningJobsTable data={running} />
                            {running.length === 0 && (
                                <div className="py-20 text-center opacity-30 italic">No running jobs detected</div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

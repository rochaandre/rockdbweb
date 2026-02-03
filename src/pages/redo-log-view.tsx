import { useState, useEffect } from 'react'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { History, RefreshCw, Activity } from 'lucide-react'
import { RedoManager, RedoMatrixReport, ControlFilesPanel } from '@/components/storage/storage-components'
import { API_URL, useApp } from '@/context/app-context'
import { twMerge } from 'tailwind-merge'

export function RedoLogView() {
    const { connection } = useApp()
    const isPdb = connection.db_type === 'PDB'
    const [activeTab, setActiveTab] = usePersistentState('redolog', 'activeTab', 'groups')
    const [newSize, setNewSize] = usePersistentState('redolog', 'newSize', '600')

    // Live States
    const [groups, setGroups] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [threads, setThreads] = useState<number[]>([])
    const [controlFiles, setControlFiles] = useState<any[]>([])
    const [checkpoint, setCheckpoint] = useState<any[]>([])
    const [standbyGroups, setStandbyGroups] = useState<any[]>([])
    const [archives, setArchives] = useState<any[]>([])
    const [logBuffer, setLogBuffer] = useState<any>({})
    const [mgmtInfo, setMgmtInfo] = useState<any>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Filters
    const [historyDays, setHistoryDays] = useState(7)
    const [historyInst, setHistoryInst] = useState('')

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            const [redoRes, threadsRes, ctrlRes, ckptRes, stbyRes, archRes, lbRes, mgmtRes] = await Promise.all([
                fetch(`${API_URL}/storage/redo`),
                fetch(`${API_URL}/storage/redo/threads`),
                fetch(`${API_URL}/storage/control`),
                fetch(`${API_URL}/storage/checkpoint`),
                fetch(`${API_URL}/storage/redo/standby`),
                fetch(`${API_URL}/storage/redo/archives`),
                fetch(`${API_URL}/storage/redo/logbuffer`),
                fetch(`${API_URL}/storage/redo/mgmt-info`)
            ])

            if (redoRes.ok) setGroups(await redoRes.json())
            if (threadsRes.ok) setThreads(await threadsRes.json())
            if (ctrlRes.ok) setControlFiles(await ctrlRes.json())
            if (ckptRes.ok) setCheckpoint(await ckptRes.json())
            if (stbyRes.ok) setStandbyGroups(await stbyRes.json())
            if (archRes.ok) setArchives(await archRes.json())
            if (lbRes.ok) setLogBuffer(await lbRes.json())
            if (mgmtRes.ok) setMgmtInfo(await mgmtRes.json())
        } catch (err) {
            console.error('Error fetching redo data:', err)
        } finally {
            setIsRefreshing(false)
        }
    }

    const fetchHistory = async () => {
        try {
            const historyUrl = new URL(`${API_URL}/storage/redo/history`)
            historyUrl.searchParams.append('days', historyDays.toString())
            if (historyInst) historyUrl.searchParams.append('inst_id', historyInst)
            const res = await fetch(historyUrl.toString())
            if (res.ok) setHistory(await res.json())
        } catch (err) {
            console.error('Error fetching redo history:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [activeTab])

    useEffect(() => {
        fetchHistory()
    }, [historyDays, historyInst])

    const handleForceCheckpoint = async () => {
        try {
            const res = await fetch(`${API_URL}/storage/checkpoint/force`, { method: 'POST' })
            if (res.ok) {
                fetchData()
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (err) { console.error(err) }
    }

    const formatReportText = (history: any[]) => {
        let text = "DAY       HOUR    SWITCHES\n"
        text += "--------- ------- --------\n"
        history.forEach(row => {
            for (let i = 0; i < 24; i++) {
                const key = `h${i.toString().padStart(2, '0')}`
                const val = parseInt(row[key]) || 0
                if (val > 0) {
                    text += `${row.dg_date.padEnd(9)} ${i.toString().padStart(2, '0').padEnd(7)} ${val.toString().padStart(8)}\n`
                }
            }
        })
        return text
    }

    const generateResizeScript = (size: string) => {
        return `ALTER SYSTEM SET log_file_name_convert='/u02/oradata/dbpro_01/','/u02/oradata/dbpro_01/';

/u02/oradata/CDBPRD/redo03.log
-- Add new larger groups
ALTER DATABASE ADD LOGFILE GROUP 4 ('/u02/oradata/CONEXOS/redo04a.log','/u02/oradata/CONEXOS/redo04b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 5 ('/u02/oradata/CONEXOS/redo05a.log','/u02/oradata/CONEXOS/redo05b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 6 ('/u02/oradata/CONEXOS/redo06a.log','/u02/oradata/CONEXOS/redo06b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 7 ('/u02/oradata/CONEXOS/redo07a.log','/u02/oradata/CONEXOS/redo07b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 8 ('/u02/oradata/CONEXOS/redo08a.log','/u02/oradata/CONEXOS/redo08b.log') SIZE ${size}M;

-- Switch to new groups
alter system switch logfile;
alter system switch logfile;
alter system switch logfile;
alter system checkpoint;

-- Drop old groups
ALTER DATABASE DROP LOGFILE GROUP 1;
ALTER DATABASE DROP LOGFILE GROUP 2;
ALTER DATABASE DROP LOGFILE GROUP 3;

-- Re-add old groups with new size
ALTER DATABASE ADD LOGFILE GROUP 1 ('/u02/oradata/CONEXOS/redo01a.log','/u02/oradata/CONEXOS/redo01b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 2 ('/u02/oradata/CONEXOS/redo02a.log','/u02/oradata/CONEXOS/redo02b.log') SIZE ${size}M;
ALTER DATABASE ADD LOGFILE GROUP 3 ('/u02/oradata/CONEXOS/redo03a.log','/u02/oradata/CONEXOS/redo03b.log') SIZE ${size}M;

-- Cleanup old files
host rm -f /u02/oradata/CONEXOS/redo01.log
host rm -f /u02/oradata/CONEXOS/redo02.log
host rm -f /u02/oradata/CONEXOS/redo03.log

-- Verification
column group# format 99999;
column status format a10;
column mb format 99999;
select group#, status, bytes/1024/1024 mb from v$log;
select member from v$logfile;
`;
    }

    return (
        <MainLayout>
            <div className="p-6 space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        Redo Log Explorer
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleForceCheckpoint}
                            className="gap-2"
                            disabled={isPdb}
                            title={isPdb ? "Checkpoint not allowed in PDB" : ""}
                        >
                            <Activity className="size-4" />
                            Force Checkpoint
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            className="gap-2"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={twMerge("size-4", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {isPdb && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-3 text-amber-800 text-sm shrink-0">
                        <Activity className="h-5 w-5 text-amber-600" />
                        <p>
                            <strong>PDB Mode:</strong> Redo Log and Controlfile management actions are disabled because you are connected to a Pluggable Database.
                            These operations must be performed at the CDB (Container) level.
                        </p>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="border-b shrink-0">
                            <TabsList className="h-10 p-0 bg-transparent">
                                <TabsTrigger value="groups" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Management</TabsTrigger>
                                <TabsTrigger value="matrix" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Switch Matrix</TabsTrigger>
                                <TabsTrigger value="standby" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Standby Groups</TabsTrigger>
                                <TabsTrigger value="files" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Log Files</TabsTrigger>
                                <TabsTrigger value="control" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Checkpoint</TabsTrigger>
                                <TabsTrigger value="scripts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Scripts</TabsTrigger>
                                <TabsTrigger value="logbuffer" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Log Buffer</TabsTrigger>
                                <TabsTrigger value="archives" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Archives</TabsTrigger>
                                <TabsTrigger value="graphics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Graphics</TabsTrigger>
                                <TabsTrigger value="report" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Report Switch</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50 p-4">
                            <TabsContent value="groups" className="mt-0 h-full space-y-4">
                                {mgmtInfo && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <Card className="bg-white">
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Log Mode</p>
                                                <p className="text-lg font-bold text-primary">{mgmtInfo.db_log_mode}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white">
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Auto Archival</p>
                                                <p className="text-lg font-bold">{mgmtInfo.auto_archival}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white col-span-1 md:col-span-2">
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Archive Destination</p>
                                                <p className="text-xs font-mono truncate" title={mgmtInfo.log_archive_dest_1}>{mgmtInfo.log_archive_dest_1}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white">
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Format</p>
                                                <p className="text-xs font-mono">{mgmtInfo.log_archive_format}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white">
                                            <CardContent className="p-3">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Current Seq</p>
                                                <p className="text-lg font-bold text-green-600">{mgmtInfo.current_seq}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                                <RedoManager groups={groups} onRefresh={fetchData} />
                            </TabsContent>

                            <TabsContent value="matrix" className="mt-0 h-full overflow-hidden">
                                <RedoMatrixReport
                                    history={history}
                                    threads={threads}
                                    onFilterChange={(d, i) => {
                                        setHistoryDays(d)
                                        setHistoryInst(i)
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="standby" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Standby Redo Log Groups</CardTitle></CardHeader>
                                    <CardContent>
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-2">Group#</th>
                                                    <th className="text-left p-2">Thread#</th>
                                                    <th className="text-left p-2">Sequence#</th>
                                                    <th className="text-left p-2">Bytes</th>
                                                    <th className="text-left p-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standbyGroups.map(g => (
                                                    <tr key={g['group#']} className="border-b">
                                                        <td className="p-2">{g['group#']}</td>
                                                        <td className="p-2">{g['thread#']}</td>
                                                        <td className="p-2">{g['sequence#']}</td>
                                                        <td className="p-2">{g.size_mb} MB</td>
                                                        <td className={twMerge("p-2 font-bold", g.status === 'ACTIVE' ? 'text-green-600' : 'text-muted-foreground')}>
                                                            {g.status}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {standbyGroups.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic">No standby log groups found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="files" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Redo Log Members</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {groups.map(g => (
                                                <div key={g['group#']} className="p-3 border rounded bg-white flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold flex items-center gap-2 mb-1">
                                                            Group {g['group#']}
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-muted-foreground">Thread {g['thread#']}</span>
                                                        </div>
                                                        <div className="text-[10px] font-mono whitespace-pre-wrap break-all opacity-70">
                                                            {/* Members info could be fetched here, for now using group summary */}
                                                            Status: {g.status} | Sequence: {g['sequence#']}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold bg-slate-50 px-3 py-1 rounded border whitespace-nowrap ml-4">{g.size_mb} MB</div>
                                                </div>
                                            ))}
                                            {groups.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground italic">No group information available.</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="control" className="mt-0 h-full">
                                <ControlFilesPanel files={controlFiles} checkpoint={checkpoint} onRefresh={fetchData} />
                            </TabsContent>

                            <TabsContent value="scripts" className="mt-0 h-full">
                                <div className="grid grid-cols-12 gap-6 h-full">
                                    <div className="col-span-4 space-y-4">
                                        <Card>
                                            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="newSize">New Group Size (MB)</Label>
                                                    <Input
                                                        id="newSize"
                                                        value={newSize}
                                                        onChange={(e) => setNewSize(e.target.value)}
                                                        placeholder="e.g. 1024"
                                                    />
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded text-xs space-y-2">
                                                    <div className="flex justify-between"><span>Current Size:</span> <span className="font-bold">400 MB</span></div>
                                                    <div className="flex justify-between"><span>Avg Switch/Hr:</span> <span className="font-bold">12</span></div>
                                                    <div className="flex justify-between"><span>Total Groups:</span> <span className="font-bold">4</span></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="col-span-8 h-full flex flex-col">
                                        <Card className="h-full flex flex-col">
                                            <CardHeader className="py-3"><CardTitle>Generated Resize Script</CardTitle></CardHeader>
                                            <CardContent className="flex-1 overflow-hidden p-0">
                                                <div className="bg-slate-900 text-slate-50 p-4 h-full font-mono text-xs overflow-auto">
                                                    <pre>{generateResizeScript(newSize)}</pre>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="logbuffer" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Log Buffer Analysis</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border rounded bg-blue-50/50">
                                                <div className="text-sm font-bold text-blue-900">Total Log Buffer Size</div>
                                                <div className="text-2xl font-bold">{logBuffer['log_buffer_size'] || 0} MB</div>
                                            </div>
                                            <div className="p-4 border rounded bg-white">
                                                <div className="text-sm font-bold">Redo Entries</div>
                                                <div className="text-2xl font-bold">{logBuffer['redo entries']?.toLocaleString() || 0}</div>
                                            </div>
                                            <div className="p-4 border rounded bg-white">
                                                <div className="text-sm font-bold">Log Space Requests</div>
                                                <div className="text-2xl font-bold text-amber-600">{logBuffer['redo log space requests'] || 0}</div>
                                            </div>
                                            <div className="p-4 border rounded bg-white">
                                                <div className="text-sm font-bold">Buffer Allocation Retries</div>
                                                <div className="text-2xl font-bold text-red-600">{logBuffer['redo buffer allocation retries'] || 0}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="retention" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Redo Retention Policy</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">Ensure redo logs are retained long enough for Oracle Streams or Data Guard.</p>
                                        <div className="flex gap-4">
                                            <div className="p-4 border rounded bg-green-50 w-64">
                                                <div className="text-sm font-bold text-green-900">Optimal Retention</div>
                                                <div className="text-2xl font-bold">4 Hours</div>
                                                <div className="text-xs text-green-700 mt-1">Current: 24 Hours</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="archives" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Arched Logs (Last 24h)</CardTitle></CardHeader>
                                    <CardContent>
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-2">Name</th>
                                                    <th className="text-left p-2">Thread#</th>
                                                    <th className="text-left p-2">Sequence#</th>
                                                    <th className="text-left p-2">Size</th>
                                                    <th className="text-left p-2">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {archives.map((a, i) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="p-2 font-mono text-xs max-w-xs truncate" title={a.name}>{a.name.split('/').pop()}</td>
                                                        <td className="p-2">{a['thread#']}</td>
                                                        <td className="p-2">{a['sequence#']}</td>
                                                        <td className="p-2">{a.size_mb} MB</td>
                                                        <td className="p-2 text-muted-foreground whitespace-nowrap">{a.time}</td>
                                                    </tr>
                                                ))}
                                                {archives.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic">No archived logs found in the last 24h.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="report" className="mt-0 h-full">
                                <Card className="h-full">
                                    <CardHeader><CardTitle>Log Switch Report (Text Output)</CardTitle></CardHeader>
                                    <CardContent className="h-[calc(100%-80px)] overflow-hidden">
                                        <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-xs h-full overflow-auto">
                                            <pre>{formatReportText(history)}</pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="graphics" className="mt-0 h-full">
                                <div className="grid grid-cols-1 gap-4">
                                    <Card>
                                        <CardHeader><CardTitle>Hourly Switch Rate (Last 24h Summary)</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="h-64 flex items-end gap-2 border-b border-l p-4 bg-white rounded">
                                                {Array.from({ length: 24 }).map((_, i) => {
                                                    const key = `h${i.toString().padStart(2, '0')}`
                                                    // sum for this hour across all days in history
                                                    const val = history.reduce((sum, row) => sum + (parseInt(row[key]) || 0), 0)
                                                    const maxVal = Math.max(...Array.from({ length: 24 }).map((_, h) =>
                                                        history.reduce((sum, row) => sum + (parseInt(row[`h${h.toString().padStart(2, '0')}`]) || 0), 0)
                                                    ), 1)

                                                    return (
                                                        <div key={i} className="flex-1 bg-primary/80 rounded-t-sm relative group" style={{ height: `${(val / maxVal) * 100}%` }}>
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block transition-all font-bold">{val}</span>
                                                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground rotate-45">{i}h</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    )
}

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { History, ArrowRight, FileTerminal } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function RedoLogView() {
    const [activeTab, setActiveTab] = useState("groups")
    const [newSize, setNewSize] = useState("600")

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
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="border-b shrink-0">
                            <TabsList className="h-10 p-0 bg-transparent">
                                <TabsTrigger value="groups" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Redo Groups</TabsTrigger>
                                <TabsTrigger value="standby" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Standby Groups</TabsTrigger>
                                <TabsTrigger value="files" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Redo Files</TabsTrigger>
                                <TabsTrigger value="scripts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Scripts</TabsTrigger>
                                <TabsTrigger value="logbuffer" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Log Buffer</TabsTrigger>
                                <TabsTrigger value="retention" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Retention</TabsTrigger>
                                <TabsTrigger value="archives" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Archives</TabsTrigger>
                                <TabsTrigger value="graphics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Graphics</TabsTrigger>
                                <TabsTrigger value="report" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-medium">Report Switch</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50 p-4">
                            <TabsContent value="groups" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Redo Log Groups</CardTitle></CardHeader>
                                    <CardContent>
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-2">Group#</th>
                                                    <th className="text-left p-2">Thread#</th>
                                                    <th className="text-left p-2">Sequence#</th>
                                                    <th className="text-left p-2">Bytes</th>
                                                    <th className="text-left p-2">Block Size</th>
                                                    <th className="text-left p-2">Members</th>
                                                    <th className="text-left p-2">Archived</th>
                                                    <th className="text-left p-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-2">1</td><td className="p-2">1</td><td className="p-2">36368</td><td className="p-2">419,430,400</td><td className="p-2">512</td><td className="p-2">2</td><td className="p-2">YES</td><td className="p-2 text-green-600 font-bold">INACTIVE</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">2</td><td className="p-2">1</td><td className="p-2">36369</td><td className="p-2">419,430,400</td><td className="p-2">512</td><td className="p-2">2</td><td className="p-2">NO</td><td className="p-2 text-blue-600 font-bold">CURRENT</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">3</td><td className="p-2">1</td><td className="p-2">36367</td><td className="p-2">419,430,400</td><td className="p-2">512</td><td className="p-2">2</td><td className="p-2">YES</td><td className="p-2">INACTIVE</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">4</td><td className="p-2">1</td><td className="p-2">36366</td><td className="p-2">419,430,400</td><td className="p-2">512</td><td className="p-2">2</td><td className="p-2">YES</td><td className="p-2">INACTIVE</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
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
                                                <tr className="border-b">
                                                    <td className="p-2">10</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">419,430,400</td><td className="p-2 text-muted-foreground">UNASSIGNED</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">11</td><td className="p-2">1</td><td className="p-2">36369</td><td className="p-2">419,430,400</td><td className="p-2 text-green-600 font-bold">ACTIVE</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">12</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">419,430,400</td><td className="p-2 text-muted-foreground">UNASSIGNED</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="files" className="mt-0 h-full">
                                <Card>
                                    <CardHeader><CardTitle>Redo Log Files</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map(g => (
                                                <div key={g} className="p-2 border rounded bg-white flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold mb-1">Group {g}</div>
                                                        <div className="text-xs font-mono text-muted-foreground ml-4">/u01/app/oracle/oradata/ORCL/redo0{g}a.log</div>
                                                        <div className="text-xs font-mono text-muted-foreground ml-4">/u02/app/oracle/oradata/ORCL/redo0{g}b.log</div>
                                                    </div>
                                                    <div className="text-sm font-bold bg-slate-100 px-3 py-1 rounded">400 MB</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
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
                                            <div className="p-4 border rounded bg-blue-50">
                                                <div className="text-sm font-bold text-blue-900">Total Log Buffer Size</div>
                                                <div className="text-2xl font-bold">128 MB</div>
                                            </div>
                                            <div className="p-4 border rounded bg-white">
                                                <div className="text-sm font-bold">Redo Entries</div>
                                                <div className="text-2xl font-bold">542,123</div>
                                            </div>
                                            <div className="col-span-2 p-4 border rounded bg-white">
                                                <div className="text-sm font-bold mb-2">Redo Allocation Latch Contention</div>
                                                <div className="h-32 bg-slate-50 flex items-end gap-1 p-2 border border-slate-200">
                                                    {[2, 5, 8, 3, 12, 4, 2, 1, 0, 5, 2, 1].map((v, i) => (
                                                        <div key={i} className="flex-1 bg-amber-500 hover:opacity-80 transition-opacity relative group" style={{ height: `${v * 8}%` }}>
                                                            <span className="opacity-0 group-hover:opacity-100 absolute -top-4 w-full text-center text-[10px]">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
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
                                    <CardHeader><CardTitle>Archives Generated Today</CardTitle></CardHeader>
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
                                                {[
                                                    { n: 'arch_1_36368.arc', t: 1, s: 36368, z: '400 MB', time: '10:00:00' },
                                                    { n: 'arch_1_36367.arc', t: 1, s: 36367, z: '385 MB', time: '09:45:00' },
                                                    { n: 'arch_1_36366.arc', t: 1, s: 36366, z: '400 MB', time: '09:15:00' },
                                                    { n: 'arch_1_36365.arc', t: 1, s: 36365, z: '400 MB', time: '08:45:00' },
                                                    { n: 'arch_1_36364.arc', t: 1, s: 36364, z: '120 MB', time: '08:15:00' },
                                                ].map((a, i) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="p-2 font-mono">{a.n}</td><td className="p-2">{a.t}</td><td className="p-2">{a.s}</td><td className="p-2">{a.z}</td><td className="p-2 text-muted-foreground">{a.time}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="report" className="mt-0 h-full">
                                <Card className="h-full">
                                    <CardHeader><CardTitle>Log Switch Report</CardTitle></CardHeader>
                                    <CardContent className="h-full overflow-hidden">
                                        <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-xs h-full overflow-auto">
                                            <pre>{`DAY       HOUR    SWITCHES
--------- ------- --------
29-JAN-26 00      12
29-JAN-26 01      15
29-JAN-26 02      8
29-JAN-26 03      22
29-JAN-26 04      18
29-JAN-26 05      14
29-JAN-26 06      10
29-JAN-26 07      12
29-JAN-26 08      11
29-JAN-26 09      15
29-JAN-26 10      18
`}</pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="graphics" className="mt-0 h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader><CardTitle>Hourly Switch Rate</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="h-64 flex items-end gap-2 border-b border-l p-4">
                                                {/* Mock Bar Chart */}
                                                {[12, 15, 8, 22, 18, 14, 10, 12, 11, 15, 18].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-blue-500 rounded-t-sm relative group" style={{ height: `${h * 3}%` }}>
                                                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block">{h}</span>
                                                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground">{i}h</span>
                                                    </div>
                                                ))}
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


import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { HardDrive, AlertTriangle, Activity, Database, Server } from 'lucide-react'
import { MOCK_ASM_DATA } from '@/components/storage/asm-data'

export function AsmExplorerView() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HardDrive className="h-6 w-6 text-primary" /> ASM Explorer
                    </h1>
                    <Badge variant="outline" className="text-xs">
                        ASM Enabled
                    </Badge>
                </div>

                <Tabs defaultValue="groups" className="flex-1 flex flex-col min-h-0">
                    <TabsList>
                        <TabsTrigger value="groups">Disk Groups</TabsTrigger>
                        <TabsTrigger value="disks">Disks</TabsTrigger>
                        <TabsTrigger value="space">Space Used</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-auto mt-4 pr-2">
                        {/* Disk Groups Tab */}
                        <TabsContent value="groups" className="m-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {MOCK_ASM_DATA.diskGroups.map((dg, i) => (
                                    <Card key={i}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex justify-between items-center text-lg">
                                                {dg.name}
                                                <Badge variant={dg.state === 'MOUNTED' ? 'default' : 'destructive'}>{dg.state}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="font-semibold">{dg.type}</span>
                                                <span className="text-muted-foreground">Offline Disks:</span>
                                                <span className={dg.offlineDisks > 0 ? "text-destructive font-bold" : "font-semibold"}>{dg.offlineDisks}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Used</span>
                                                    <span>{((dg.totalMb - dg.freeMb) / 1024).toFixed(1)} GB / {(dg.totalMb / 1024).toFixed(1)} GB</span>
                                                </div>
                                                <Progress value={((dg.totalMb - dg.freeMb) / dg.totalMb) * 100} className="h-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Disks Tab */}
                        <TabsContent value="disks" className="m-0">
                            <Card>
                                <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/20 text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-2">Group</th>
                                                <th className="px-4 py-2">Disk #</th>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2">Path</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2">Mode</th>
                                                <th className="px-4 py-2 text-right">Size (MB)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_ASM_DATA.disks.map((d, i) => (
                                                <tr key={i} className="border-t border-border hover:bg-muted/10">
                                                    <td className="px-4 py-2 font-medium">{d.groupName}</td>
                                                    <td className="px-4 py-2">{d.diskNumber}</td>
                                                    <td className="px-4 py-2">{d.name}</td>
                                                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{d.path}</td>
                                                    <td className="px-4 py-2">{d.headerStatus}</td>
                                                    <td className="px-4 py-2">
                                                        <Badge variant={d.mode === 'ONLINE' ? 'secondary' : 'destructive'} className="text-[10px] h-5">
                                                            {d.mode}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{d.totalMb}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Space Tab */}
                        <TabsContent value="space" className="m-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {MOCK_ASM_DATA.diskGroups.map((dg, i) => {
                                    const pct = Math.round(((dg.totalMb - dg.freeMb) / dg.totalMb) * 100)
                                    return (
                                        <Card key={i}>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center justify-between">
                                                    {dg.name} Space Usage
                                                    <span className="text-sm font-normal text-muted-foreground">{pct}% Used</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex justify-center py-8">
                                                <div className="relative size-40 rounded-full border-[1.5rem] border-muted flex items-center justify-center" style={{
                                                    borderColor: pct > 80 ? 'hsl(var(--destructive)/0.2)' : 'hsl(var(--primary)/0.2)',
                                                    borderTopColor: pct > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                                                    borderRightColor: pct > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                                                    // This is a simplified CSS circular progress visualization
                                                    borderBottomColor: pct > 50 ? (pct > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))') : 'transparent',
                                                    borderLeftColor: pct > 75 ? (pct > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))') : 'transparent',
                                                    transform: 'rotate(-45deg)'
                                                }}>
                                                    <div className="text-center transform rotate-45">
                                                        <div className="text-3xl font-bold">{pct}%</div>
                                                        <div className="text-xs text-muted-foreground">Used</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="m-0">
                            <Card>
                                <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/20 text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-2">Group</th>
                                                <th className="px-4 py-2">Disk</th>
                                                <th className="px-4 py-2 text-right">Reads</th>
                                                <th className="px-4 py-2 text-right">Writes</th>
                                                <th className="px-4 py-2 text-right">Read Time (ms)</th>
                                                <th className="px-4 py-2 text-right">Write Time (ms)</th>
                                                <th className="px-4 py-2 text-right">Errors</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_ASM_DATA.disks.map((d, i) => (
                                                <tr key={i} className="border-t border-border hover:bg-muted/10">
                                                    <td className="px-4 py-2 font-medium">{d.groupName}</td>
                                                    <td className="px-4 py-2">{d.name}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{d.reads.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{d.writes.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{d.readTime}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{d.writeTime}</td>
                                                    <td className="px-4 py-2 text-right font-mono text-destructive">{d.readErrors + d.writeErrors}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Alerts Tab */}
                        <TabsContent value="alerts" className="m-0">
                            <div className="space-y-2">
                                {MOCK_ASM_DATA.alerts.map((alert, i) => (
                                    <Card key={i} className="border-l-4 border-l-amber-500">
                                        <CardContent className="p-4 flex gap-4 items-start">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">{alert.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TablespaceCard, TablespaceDetail, ControlFilesPanel } from '@/components/storage/storage-components'
import { SysauxPanel, UndoPanel, TempPanel, StorageCharts } from '@/components/storage/advanced-panels'
import { TablespacesPanel } from '@/components/storage/tablespaces-panel'
import { SegmentsPanel } from '@/components/storage/segments-panel'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { RefreshCw, Activity } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { API_URL, useApp } from '@/context/app-context'

export function StorageView() {
    const { connection } = useApp()
    const isPdb = connection.db_type === 'PDB'

    // UI Layout State
    const [currentTab, setCurrentTab] = useState('tablespaces')

    // Data State
    const [tablespaces, setTablespaces] = useState<any[]>([])
    const [files, setFiles] = useState<any[]>([])
    const [segments, setSegments] = useState<any[]>([])

    // Storage Details States
    const [controlFiles, setControlFiles] = useState<any[]>([])
    const [sysauxData, setSysauxData] = useState<any>({ occupants: [], top_objects: [], availability: 'N/A' })
    const [undoData, setUndoData] = useState<any>({ stats: [], retention: 0, max_query_len: 0 })
    const [tempUsage, setTempUsage] = useState<any[]>([])
    const [checkpointProgress, setCheckpointProgress] = useState<any>({ db_checkpoint: '0', datafiles: [] })

    // View Interaction States
    const [selectedTs, setSelectedTs] = useState<string | undefined>(undefined)
    const [editTs, setEditTs] = useState<any | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [instId, setInstId] = useState<string | number>('')
    const [segmentsTs, setSegmentsTs] = useState<string | undefined>(undefined)

    const fetchData = async (targetId?: string | number) => {
        setIsRefreshing(true)
        const currentId = targetId !== undefined ? targetId : instId
        const params = currentId ? `?inst_id=${currentId}` : ''

        try {
            const [tsRes, filesRes, ctrlRes, sysRes, undoRes, tempRes, ckptRes] = await Promise.all([
                fetch(`${API_URL}/storage/tablespaces${params}`),
                fetch(`${API_URL}/storage/files${params}`),
                fetch(`${API_URL}/storage/control`),
                fetch(`${API_URL}/storage/sysaux`),
                fetch(`${API_URL}/storage/undo`),
                fetch(`${API_URL}/storage/temp`),
                fetch(`${API_URL}/storage/checkpoint`)
            ])

            if (tsRes.ok) setTablespaces(await tsRes.json())
            if (filesRes.ok) setFiles(await filesRes.json())
            if (ctrlRes.ok) setControlFiles(await ctrlRes.json())
            if (sysRes.ok) setSysauxData(await sysRes.json())
            if (undoRes.ok) setUndoData(await undoRes.json())
            if (tempRes.ok) setTempUsage(await tempRes.json())
            if (ckptRes.ok) setCheckpointProgress(await ckptRes.json())

        } catch (error) {
            console.error('Error fetching storage data:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedTs) {
            fetch(`${API_URL}/storage/segments?ts_name=${selectedTs}`)
                .then(res => res.json())
                .then(data => setSegments(data))
                .catch(err => console.error(err))
        } else {
            setSegments([])
        }
    }, [selectedTs])

    // Handlers
    const handleTsClick = (name: string) => {
        setSelectedTs(selectedTs === name ? undefined : name)
    }

    const handleEditTs = (ts: any) => {
        setSelectedTs(ts.tablespace_name || ts.name)
    }

    const handleRefresh = () => {
        fetchData()
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Storage Management</h1>
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

                <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col p-6 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border mb-2">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            <TabsTrigger
                                value="tablespaces"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Tablespaces
                            </TabsTrigger>
                            <TabsTrigger
                                value="segments"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Segments and Extents
                            </TabsTrigger>
                            <TabsTrigger
                                value="tabdat"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                TabDat
                            </TabsTrigger>
                            <TabsTrigger
                                value="control"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Control Files
                            </TabsTrigger>
                            <TabsTrigger
                                value="sysaux"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                SYSAUX
                            </TabsTrigger>
                            <TabsTrigger
                                value="undo"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                UNDO
                            </TabsTrigger>
                            <TabsTrigger
                                value="temp"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                TEMP
                            </TabsTrigger>
                            <TabsTrigger
                                value="charts"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Charts
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tablespaces" className="flex-1 mt-4 overflow-auto">
                        <TablespacesPanel
                            tablespaces={tablespaces}
                            files={files}
                            onRefresh={(id) => {
                                if (id !== undefined) setInstId(id)
                                fetchData(id)
                            }}
                            onShowSegments={(ts: string) => {
                                setSegmentsTs(ts)
                                setCurrentTab('segments')
                            }}
                            instanceName={connection.inst_name || 'AAATESTE'}
                        />
                    </TabsContent>

                    {/* Segments and Extents Monitoring */}
                    <TabsContent value="segments" className="flex-1 mt-4 overflow-auto">
                        <SegmentsPanel initialTablespace={segmentsTs} />
                    </TabsContent>

                    {/* TabDat (Legacy Tablespaces View) */}
                    <TabsContent value="tabdat" className="flex-1 mt-4 overflow-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tablespaces.map((ts, i) => (
                                <div key={i} className={selectedTs === ts.tablespace_name ? "ring-2 ring-primary rounded-lg" : ""}>
                                    <TablespaceCard ts={ts} onClick={() => handleTsClick(ts.tablespace_name)} onEdit={handleEditTs} />
                                </div>
                            ))}
                        </div>

                        {selectedTs && (
                            <div className="pt-4 border-t border-border">
                                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                                    Details for {selectedTs}
                                </h3>
                                <TablespaceDetail
                                    selectedTs={selectedTs}
                                    files={files.filter(f => f.tablespace_name === selectedTs)}
                                    segments={segments}
                                    onRefresh={fetchData}
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* Control Content */}
                    <TabsContent value="control" className="flex-1 mt-4 overflow-auto space-y-4">
                        {isPdb && (
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-3 text-amber-800 text-sm">
                                <Activity className="h-5 w-5 text-amber-600" />
                                <p>
                                    <strong>PDB Mode:</strong> Controlfile management (Force Checkpoint) is disabled in Pluggable Databases.
                                </p>
                            </div>
                        )}
                        <ControlFilesPanel files={controlFiles} checkpoint={checkpointProgress} onRefresh={fetchData} />
                    </TabsContent>

                    {/* Advanced Contents */}
                    <TabsContent value="sysaux" className="flex-1 mt-4 overflow-auto">
                        <SysauxPanel data={sysauxData} />
                    </TabsContent>
                    <TabsContent value="undo" className="flex-1 mt-4 overflow-auto">
                        <UndoPanel data={undoData} />
                    </TabsContent>
                    <TabsContent value="temp" className="flex-1 mt-4 overflow-auto">
                        <TempPanel usage={tempUsage} />
                    </TabsContent>
                    <TabsContent value="charts" className="flex-1 mt-4 overflow-auto">
                        <StorageCharts />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editTs} onOpenChange={() => setEditTs(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Tablespace {editTs?.name}</DialogTitle>
                        <DialogDescription>Modify tablespace attributes or resize.</DialogDescription>
                    </DialogHeader>
                    {editTs && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Add Space (MB)</Label>
                                <Input type="number" placeholder="Size in MB" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="auto" />
                                <Label htmlFor="auto">Enable Autoextend</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTs(null)}>Cancel</Button>
                        <Button onClick={() => setEditTs(null)}>Apply Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    )
}

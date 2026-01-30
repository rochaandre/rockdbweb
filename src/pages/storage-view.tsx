import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TablespaceCard, TablespaceDetail, RedoManager, ControlFilesPanel } from '@/components/storage/storage-components'
import { SysauxPanel, UndoPanel, TempPanel, StorageCharts } from '@/components/storage/advanced-panels'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { RefreshCw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { API_URL } from '@/context/app-context'

export function StorageView() {
    // State
    const [tablespaces, setTablespaces] = useState<any[]>([])
    const [files, setFiles] = useState<any[]>([])
    const [segments, setSegments] = useState<any[]>([])
    const [selectedTs, setSelectedTs] = useState<string | null>(null)
    const [editTs, setEditTs] = useState<any | null>(null) // For Edit Dialog
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            const [tsRes, filesRes] = await Promise.all([
                fetch(`${API_URL}/storage/tablespaces`),
                fetch(`${API_URL}/storage/files`)
            ])
            if (tsRes.ok) setTablespaces(await tsRes.json())
            if (filesRes.ok) setFiles(await filesRes.json())
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
            fetch(`${API_URL}/storage/segments/${selectedTs}`)
                .then(res => res.json())
                .then(data => setSegments(data))
                .catch(err => console.error(err))
        } else {
            setSegments([])
        }
    }, [selectedTs])

    // Handlers
    const handleTsClick = (name: string) => {
        setSelectedTs(selectedTs === name ? null : name)
    }

    const handleEditTs = (ts: any) => {
        setEditTs(ts)
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

                <Tabs defaultValue="tablespaces" className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="tablespaces"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Tablespaces
                            </TabsTrigger>
                            <TabsTrigger
                                value="redo"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Redo Logs
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

                    {/* Tablespaces Content */}
                    <TabsContent value="tablespaces" className="flex-1 mt-4 overflow-auto space-y-6">
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
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* Redo Content */}
                    <TabsContent value="redo" className="flex-1 mt-4 overflow-auto">
                        <RedoManager />
                    </TabsContent>

                    {/* Control Content */}
                    <TabsContent value="control" className="flex-1 mt-4 overflow-auto">
                        <ControlFilesPanel />
                    </TabsContent>

                    {/* Advanced Contents */}
                    <TabsContent value="sysaux" className="flex-1 mt-4 overflow-auto">
                        <SysauxPanel />
                    </TabsContent>
                    <TabsContent value="undo" className="flex-1 mt-4 overflow-auto">
                        <UndoPanel />
                    </TabsContent>
                    <TabsContent value="temp" className="flex-1 mt-4 overflow-auto">
                        <TempPanel />
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

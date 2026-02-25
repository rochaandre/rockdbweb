import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, ListFilter, ShieldCheck, Zap } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { API_URL } from '@/context/app-context'
import {
    StaleStatsTable,
    DmlChangesTable,
    StatisticsMaintenancePanel,
    SearchableSelector,
    type StaleStatsRow,
    type DmlChangesRow
} from '@/components/statistics/statistics-components'

export function StatisticsView() {
    const [activeTab, setActiveTab] = useState('stale')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [staleStats, setStaleStats] = useState<StaleStatsRow[]>([])
    const [dmlChanges, setDmlChanges] = useState<DmlChangesRow[]>([])
    const [ownerFilter, setOwnerFilter] = useState('')
    const [tableFilter, setTableFilter] = useState('')
    const [excludeSystem, setExcludeSystem] = useState(false)
    const [availableSchemas, setAvailableSchemas] = useState<string[]>([])
    const [availableTables, setAvailableTables] = useState<string[]>([])

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const res = await fetch(`${API_URL}/statistics/schemas?exclude_system=${excludeSystem}`)
                if (res.ok) setAvailableSchemas(await res.json())
            } catch (err) {
                console.error('Error fetching schemas:', err)
            }
        }
        fetchSchemas()
    }, [excludeSystem])

    useEffect(() => {
        if (ownerFilter) {
            const fetchTables = async () => {
                try {
                    const res = await fetch(`${API_URL}/statistics/tables?owner=${ownerFilter}`)
                    if (res.ok) setAvailableTables(await res.json())
                } catch (err) {
                    console.error('Error fetching tables:', err)
                }
            }
            fetchTables()
        } else {
            setAvailableTables([])
        }
    }, [ownerFilter])

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            const queryParams = new URLSearchParams()
            if (ownerFilter) queryParams.append('owner', ownerFilter)
            if (tableFilter) queryParams.append('table_name', tableFilter)
            if (excludeSystem) queryParams.append('exclude_system', 'true')
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

            if (activeTab === 'stale') {
                const res = await fetch(`${API_URL}/statistics/stale${queryString}`)
                if (res.ok) {
                    const data = await res.json()
                    setStaleStats(data)
                } else {
                    toast.error('Failed to fetch stale statistics')
                }
            } else if (activeTab === 'dml') {
                const res = await fetch(`${API_URL}/statistics/dml${queryString}`)
                if (res.ok) {
                    const data = await res.json()
                    setDmlChanges(data)
                } else {
                    toast.error('Failed to fetch DML activity')
                }
            }
        } catch (error) {
            toast.error('Error connecting to database stats API')
        } finally {
            setIsRefreshing(false)
        }
    }
    const flushMonitoring = async () => {
        setIsRefreshing(true)
        try {
            const res = await fetch(`${API_URL}/statistics/flush`, { method: 'POST' })
            if (res.ok) {
                toast.success('Monitoring information flushed')
                await fetchData()
            } else {
                toast.error('Failed to flush monitoring info')
            }
        } catch (error) {
            console.error('Error flushing stats:', error)
            toast.error('Network error while flushing')
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, excludeSystem, ownerFilter, tableFilter])

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-primary" />
                        <h1 className="text-xl font-semibold tracking-tight">Optimizer Statistics</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={flushMonitoring}
                            className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                            disabled={isRefreshing}
                        >
                            <Zap className={twMerge("size-4", isRefreshing && "animate-pulse")} />
                            Flush Monitoring
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

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="stale"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
                            >
                                <ListFilter className="size-4" />
                                Stale Statistics
                            </TabsTrigger>
                            <TabsTrigger
                                value="dml"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
                            >
                                <BarChart3 className="size-4" />
                                DML Activity
                            </TabsTrigger>
                            <TabsTrigger
                                value="maintenance"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
                            >
                                <ShieldCheck className="size-4" />
                                Maintenance
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 mt-4 overflow-hidden relative">
                        {isRefreshing && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                                <div className="flex flex-col items-center gap-3 p-6 bg-surface border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <RefreshCw className="size-8 text-primary animate-spin" />
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm font-bold tracking-tight">Fetching Statistics</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Please wait...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <TabsContent value="stale" className="h-full mt-0 overflow-hidden outline-none flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-md shrink-0">
                                <SearchableSelector
                                    label="Owner / Schema"
                                    value={ownerFilter}
                                    onValueChange={(val) => {
                                        setOwnerFilter(val)
                                        setTableFilter('')
                                    }}
                                    options={availableSchemas}
                                    placeholder="All Schemas"
                                    className="min-w-[180px]"
                                />

                                <SearchableSelector
                                    label="Table Name"
                                    value={tableFilter}
                                    onValueChange={setTableFilter}
                                    options={availableTables}
                                    placeholder={!ownerFilter ? "All Tables" : "All Tables"}
                                    className="min-w-[200px]"
                                    disabled={!ownerFilter && availableTables.length === 0}
                                />

                                <div className="h-8 w-px bg-border mx-2" />

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="exclude-system-stale"
                                        checked={excludeSystem}
                                        onChange={(e) => setExcludeSystem(e.target.checked)}
                                        className="size-3.5 accent-primary cursor-pointer"
                                    />
                                    <label htmlFor="exclude-system-stale" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer select-none">
                                        Exclude Internal
                                    </label>
                                </div>

                                <div className="flex-1" />

                                <div className="text-[10px] text-muted-foreground italic">
                                    * Apply filters to narrow results
                                </div>
                            </div>
                            <StaleStatsTable data={staleStats} onRefresh={fetchData} />
                        </TabsContent>

                        <TabsContent value="dml" className="h-full mt-0 overflow-hidden outline-none flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-md shrink-0">
                                <SearchableSelector
                                    label="Owner / Schema"
                                    value={ownerFilter}
                                    onValueChange={(val) => {
                                        setOwnerFilter(val)
                                        setTableFilter('')
                                    }}
                                    options={availableSchemas}
                                    placeholder="All Schemas"
                                    className="min-w-[180px]"
                                />

                                <SearchableSelector
                                    label="Table Name"
                                    value={tableFilter}
                                    onValueChange={setTableFilter}
                                    options={availableTables}
                                    placeholder={!ownerFilter ? "All Tables" : "All Tables"}
                                    className="min-w-[200px]"
                                    disabled={!ownerFilter && availableTables.length === 0}
                                />

                                <div className="h-8 w-px bg-border mx-2" />

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="exclude-system-dml"
                                        checked={excludeSystem}
                                        onChange={(e) => setExcludeSystem(e.target.checked)}
                                        className="size-3.5 accent-primary cursor-pointer"
                                    />
                                    <label htmlFor="exclude-system-dml" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer select-none">
                                        Exclude Internal
                                    </label>
                                </div>
                            </div>
                            <DmlChangesTable data={dmlChanges} onRefresh={fetchData} />
                        </TabsContent>

                        <TabsContent value="maintenance" className="h-full mt-0 overflow-auto outline-none">
                            <StatisticsMaintenancePanel onRefresh={fetchData} />
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="mt-auto pt-2 border-t border-border/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Backend Debug:</span>
                        <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">{API_URL}</code>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

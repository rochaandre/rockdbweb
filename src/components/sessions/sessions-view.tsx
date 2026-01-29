import { MainLayout } from '@/components/layout/main-layout'
import { ControlBar, type FilterState } from '@/components/sessions/control-bar'
import { SessionsTable } from '@/components/sessions/sessions-table'
import { BlockingTable } from '@/components/sessions/blocking-table'
import { DetailSidebar } from '@/components/sessions/detail-sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'
import { SESSIONS_DATA } from './sessions-data'
import { useApp } from '@/context/app-context'

export function SessionsView() {
    const { logAction } = useApp()
    const [selectedSid, setSelectedSid] = useState<number | null>(1644)

    const [filters, setFilters] = useState<FilterState>({
        active: true,
        inactive: true,
        background: true,
        killed: true,
        parallel: true
    })

    // Calculate counts on unfiltered data
    const counts = useMemo(() => {
        return {
            active: SESSIONS_DATA.filter(s => s.status === 'ACTIVE').length,
            inactive: SESSIONS_DATA.filter(s => s.status === 'INACTIVE').length,
            background: SESSIONS_DATA.filter(s => s.schema === 'SYS' || !s.username).length,
            killed: SESSIONS_DATA.filter(s => s.status === 'KILLED').length,
            parallel: SESSIONS_DATA.filter(s => s.pqs && s.pqs !== '' && s.pqs !== '0').length
        }
    }, [])

    // Filter Logic
    const filteredData = useMemo(() => {
        return SESSIONS_DATA.filter(s => {
            // Status Filters
            if (!filters.active && s.status === 'ACTIVE') return false
            if (!filters.inactive && s.status === 'INACTIVE') return false
            if (!filters.killed && s.status === 'KILLED') return false

            // Type Filters
            const isBackground = s.schema === 'SYS' || !s.username
            if (!filters.background && isBackground) return false

            const isParallel = s.pqs && s.pqs !== '' && s.pqs !== '0'
            if (!filters.parallel && isParallel) return false

            return true
        })
    }, [filters])


    const handleAction = (action: string, session: any) => {
        // Note: session might be missing if just passing a string, but our logic handles it.
        logAction('Context Menu', 'SessionsTable', `Action: ${action} | SID: ${session?.sid ?? 'N/A'}`)
    }

    const handleSelect = (sid: number) => {
        setSelectedSid(sid)
        logAction('Row Select', 'SessionsView', `Loading data for SID: ${sid} ...`)
    }

    const handleFilterChange = (key: keyof FilterState, checked: boolean) => {
        setFilters(prev => ({ ...prev, [key]: checked }))
    }

    const selectedSession = SESSIONS_DATA.find(s => s.sid === selectedSid) as any || null

    return (
        <MainLayout>
            <ControlBar
                filters={filters}
                counts={counts}
                onFilterChange={handleFilterChange}
            />

            <div className="flex flex-1 gap-2 overflow-hidden h-full">
                <div className="flex flex-1 flex-col overflow-hidden gap-2">
                    {/* Main Tabs Area */}
                    <Tabs
                        defaultValue="sessions"
                        className="flex-1 flex flex-col overflow-hidden"
                        onValueChange={(val) => logAction('Tab Change', 'SessionsView', `Tab: ${val}`)}
                    >
                        <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 pt-1">
                            <TabsList className="h-8 bg-transparent p-0 gap-1">
                                <TabsTrigger
                                    value="sessions"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Sessions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="blocking"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Blocking and Waiting Sessions - 13
                                </TabsTrigger>
                                <TabsTrigger
                                    value="filters"
                                    className="h-8 rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-all 
                    data-[selected]:border-border data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-none data-[selected]:font-semibold relative -bottom-px"
                                >
                                    Filters
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="sessions" className="flex-1 mt-0 p-0 border border-t-0 border-border bg-surface data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                            <SessionsTable
                                data={filteredData}
                                selectedId={selectedSid}
                                onSelect={handleSelect}
                                onAction={handleAction}
                            />
                        </TabsContent>
                        <TabsContent value="blocking" className="flex-1 mt-0 p-0 border border-t-0 border-border bg-surface data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                            <BlockingTable onAction={handleAction} />
                        </TabsContent>
                        <TabsContent value="filters" className="flex-1 mt-0 p-4 border border-t-0 border-border bg-surface">
                            <div className="text-sm text-muted-foreground">Filters configuration...</div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DetailSidebar session={selectedSession} />
            </div>
        </MainLayout>
    )
}

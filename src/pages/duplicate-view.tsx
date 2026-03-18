import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    SourceInfoTab, InitializationTab, DuplicateCommandTab,
    ValidationTab, TempTablespacesTab, PostVerificationTab
} from '@/components/duplicate/duplicate-components'
import type { DuplicateSourceInfo } from '@/components/duplicate/duplicate-components'
import { useApp, API_URL } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function DuplicateView() {
    const [activeTab, setActiveTab] = useState('source')
    const { activeConnection } = useApp()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sourceInfo, setSourceInfo] = useState<DuplicateSourceInfo | null>(null)

    const fetchSourceInfo = async () => {
        setIsRefreshing(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/duplicate/source-info`)
            if (res.ok) {
                const data = await res.json()
                setSourceInfo(data)
            } else {
                const errData = await res.json()
                setError(errData.detail || "Failed to fetch database information")
            }
        } catch (err: any) {
            console.error('Error fetching source info:', err)
            setError(err.message || "Failed to connect to backend")
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchSourceInfo()
    }, [activeConnection])

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-semibold tracking-tight">Duplicate Database Generator</h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSourceInfo}
                        className="gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={twMerge("size-4", isRefreshing && "animate-spin")} />
                        Refresh Source Info
                    </Button>
                </div>

                {error && (
                    <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="size-2 rounded-full bg-destructive animate-pulse" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border shrink-0">
                        <TabsList className="bg-transparent p-0 gap-6 overflow-x-auto flex-nowrap w-full justify-start pb-px">
                            <TabsTrigger
                                value="source"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                1. Source Info & Network
                            </TabsTrigger>
                            <TabsTrigger
                                value="init"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                2. Initialization (init.ora)
                            </TabsTrigger>
                            <TabsTrigger
                                value="command"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                3. RMAN Command
                            </TabsTrigger>
                            <TabsTrigger
                                value="validation"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                4. Target Preparation
                            </TabsTrigger>
                            <TabsTrigger
                                value="temp"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                5. Temp Tablespaces
                            </TabsTrigger>
                            <TabsTrigger
                                value="post"
                                className="rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap"
                            >
                                6. Post Verification
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="source" className="flex-1 mt-4 overflow-auto">
                        <SourceInfoTab info={sourceInfo} />
                    </TabsContent>
                    <TabsContent value="init" className="flex-1 mt-4 overflow-auto">
                        <InitializationTab />
                    </TabsContent>
                    <TabsContent value="command" className="flex-1 mt-4 overflow-auto">
                        <DuplicateCommandTab />
                    </TabsContent>
                    <TabsContent value="validation" className="flex-1 mt-4 overflow-auto">
                        <ValidationTab />
                    </TabsContent>
                    <TabsContent value="temp" className="flex-1 mt-4 overflow-auto">
                        <TempTablespacesTab info={sourceInfo} />
                    </TabsContent>
                    <TabsContent value="post" className="flex-1 mt-4 overflow-auto">
                        <PostVerificationTab />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

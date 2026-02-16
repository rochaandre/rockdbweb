/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-central-view.tsx
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
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { SQLSidebar } from '@/components/sql/sql-sidebar'
import { SQLEditor } from '@/components/sql/sql-editor'
import { SQLResults } from '@/components/sql/sql-results'
import { Code2, Database, Play, Save, Trash2, Search, Settings, FileCode, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { LoadingState } from '@/components/ui/loading-state'
import { useApp, API_URL } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'react-router-dom'

export function SQLCentralView() {
    const { logAction } = useApp()
    const [searchParams] = useSearchParams()
    const [scripts, setScripts] = useState<any[]>([])
    const [selectedScript, setSelectedScript] = useState<any | null>(null)
    const [editorValue, setEditorValue] = useState('')
    const [results, setResults] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isExecuting, setIsExecuting] = useState(false)
    const [sidebarVisible, setSidebarVisible] = usePersistentState('sql', 'sidebarVisible', true)

    const fetchRegistry = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sql/registry`)
            if (res.ok) setScripts(await res.json())
        } catch (error) {
            console.error('Error fetching SQL registry:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRegistry()

        // Handle deep-link to script
        const scriptFile = searchParams.get('script')
        if (scriptFile) {
            // Find script and load it
            // fetchRegistry is async, so we might need to wait or just fetch manually
            const loadDeepLink = async () => {
                const sid = searchParams.get('id_sid') || searchParams.get('sid')
                const serial = searchParams.get('id_serial') || searchParams.get('serial')
                const instId = searchParams.get('inst_id')

                let params = ''
                if (sid) {
                    params = `?SID=${sid}&SERIAL=${serial || ''}&INST_ID=${instId || '1'}`
                }

                try {
                    const res = await fetch(`${API_URL}/sql/content/${scriptFile}${params}`)
                    if (res.ok) {
                        const data = await res.json()
                        setEditorValue(data.content)
                        // Create a pseudo selected script object if not found in registry
                        setSelectedScript({ name: scriptFile, label: scriptFile })
                    }
                } catch (e) {
                    console.error("Error loading deep-linked script", e)
                }
            }
            loadDeepLink()
        }
    }, [searchParams])

    const handleScriptSelect = async (script: any) => {
        setSelectedScript(script)
        try {
            const res = await fetch(`${API_URL}/sql/content/${script.name}`)
            if (res.ok) {
                const data = await res.json()
                setEditorValue(data.content)
                logAction('Browse', 'SQL_Registry', `Loaded ${script.label}`)
            }
        } catch (error) {
            console.error('Error loading script content:', error)
        }
    }

    const handleExecute = async () => {
        if (!editorValue) return
        setIsExecuting(true)
        setResults(null)
        try {
            const res = await fetch(`${API_URL}/sql/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: editorValue })
            })
            if (res.ok) {
                const data = await res.json()
                setResults(data)
                logAction('Execute', 'SQL', `Manual execution successful (${data.length} rows)`)
            } else {
                const err = await res.json()
                setResults([{ error: err.detail || 'Query execution failed' }])
            }
        } catch (error) {
            console.error('Error executing SQL:', error)
            setResults([{ error: 'Network error or backend timeout' }])
        } finally {
            setIsExecuting(false)
        }
    }

    const handleSave = async () => {
        if (!selectedScript) {
            alert('Please select a script from the sidebar to save changes.')
            return
        }
        try {
            const res = await fetch(`${API_URL}/sql/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: selectedScript.name, content: editorValue })
            })
            if (res.ok) {
                alert('Script saved successfully.')
                logAction('Action', 'SQL_Registry', `Saved ${selectedScript.label}`)
            }
        } catch (error) {
            console.error('Error saving script:', error)
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden">
                <div className="border-b border-border bg-card p-2 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                                <Database className="size-4" />
                            </div>
                            <h1 className="text-sm font-bold tracking-tight">SQL Central</h1>
                        </div>
                        {selectedScript && (
                            <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-primary/20 bg-primary/5 text-primary uppercase">
                                <FileCode className="size-3 mr-1" /> {selectedScript.label}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Connected
                        </Badge>
                        <div className="h-4 w-px bg-border mx-1" />
                        <SQLEditorActions onExecute={handleExecute} onSave={handleSave} isExecuting={isExecuting} />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        {sidebarVisible && (
                            <>
                                <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="bg-muted/10 border-r border-border">
                                    <SQLSidebar
                                        scripts={scripts}
                                        onSelect={handleScriptSelect}
                                        selectedId={selectedScript?.id}
                                        loading={isLoading}
                                        onRefresh={fetchRegistry}
                                    />
                                </ResizablePanel>
                                <ResizableHandle className="w-1 bg-transparent hover:bg-primary/20 transition-colors" />
                            </>
                        )}

                        <ResizablePanel defaultSize={80}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={50} minSize={20}>
                                    <SQLEditor value={editorValue} onChange={setEditorValue} />
                                </ResizablePanel>
                                <ResizableHandle className="h-1 bg-transparent hover:bg-primary/20 transition-colors" />
                                <ResizablePanel defaultSize={50} minSize={10} className="bg-card">
                                    <SQLResults data={results} loading={isExecuting} />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </MainLayout>
    )
}

function SQLEditorActions({ onExecute, onSave, isExecuting }: { onExecute: () => void, onSave: () => void, isExecuting: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={onSave}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
            >
                <Save className="size-3.5" /> Save
            </button>
            <button
                onClick={onExecute}
                disabled={isExecuting}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${isExecuting ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
            >
                <Play className={`size-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
                {isExecuting ? 'Executing...' : 'Run Query'}
            </button>
        </div>
    )
}

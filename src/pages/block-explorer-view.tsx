/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: block-explorer-view.tsx
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
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Lock, Activity, FileText, Table, AlertTriangle, Code, Skull, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp, API_URL } from '@/context/app-context'

// Initial state for details
const INITIAL_DETAILS = {
    sid: 0,
    serial: 0,
    username: 'Loading...',
    status: 'UNKNOWN',
    sql_text: 'Fetching SQL...',
    plan: [],
    objects: [],
    users_in_lock: 0,
    opened_cursors: 0,
    lockedTableSize: '0 B'
}

export function BlockExplorerView() {
    const { sid } = useParams()
    const [searchParams] = useSearchParams()
    const inst_id = searchParams.get('inst_id') || '1'
    const navigate = useNavigate()
    const { logAction } = useApp()

    const [details, setDetails] = useState<any>(INITIAL_DETAILS)
    const [selectedObject, setSelectedObject] = useState<any | null>(null)
    const [objectDdl, setObjectDdl] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isKilling, setIsKilling] = useState(false)
    const [isDdlLoading, setIsDdlLoading] = useState(false)

    const fetchDetails = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sessions/blocker/${sid}?inst_id=${inst_id}`)
            if (res.ok) {
                const json = await res.json()
                setDetails(json)
            } else {
                console.error("Failed to fetch blocker details")
            }
        } catch (error) {
            console.error("Error fetching blocker details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchDDL = async (obj: any) => {
        setSelectedObject(obj)
        setIsDdlLoading(true)
        setObjectDdl('')
        try {
            const res = await fetch(`${API_URL}/sessions/ddl/${obj.type}/${obj.owner}/${obj.name}`)
            if (res.ok) {
                const json = await res.json()
                setObjectDdl(json.ddl)
            }
        } catch (error) {
            console.error("Error fetching DDL:", error)
            setObjectDdl("-- Error fetching DDL")
        } finally {
            setIsDdlLoading(false)
        }
    }

    useEffect(() => {
        if (sid) {
            fetchDetails()
        }
    }, [sid, inst_id])

    const handleKillSession = async () => {
        if (!sid) return
        const serial = details.serial
        if (confirm(`Are you sure you want to kill session ${sid},${serial}?`)) {
            setIsKilling(true)
            try {
                const res = await fetch(`${API_URL}/sessions/kill/${sid}/${serial}?inst_id=${inst_id}`, {
                    method: 'POST'
                })
                if (res.ok) {
                    logAction('Action', 'BlockExplorer', `Session ${sid} killed successfully`)
                    alert(`Session ${sid} killed successfully.`)
                    navigate('/sessions')
                } else {
                    const err = await res.json()
                    alert(`Error killing session: ${err.detail || 'Unknown error'}`)
                }
            } catch (error) {
                console.error('Error killing session:', error)
            } finally {
                setIsKilling(false)
            }
        }
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden">
                {/* Header */}
                <div className="border-b border-border bg-muted/20 p-2 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h1 className="text-sm font-semibold flex items-center gap-2 flex-1">
                        <Lock className="h-4 w-4 text-amber-600" />
                        Block Explorer - SID {sid}
                    </h1>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 gap-1"
                        onClick={handleKillSession}
                        disabled={isKilling}
                    >
                        {isKilling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Skull className="h-3.5 w-3.5" />
                        )}
                        Kill Session
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        {/* Session Info */}
                        <Card>
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Session Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-bold">{details.username}</div>
                                <div className="text-sm text-muted-foreground">SID: {details.sid}, Serial: {details.serial}</div>
                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {details.status}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lock Stats */}
                        <Card>
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Lock Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Users in Lock:</span>
                                    <span className="font-bold">{details.users_in_lock}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Open Cursors:</span>
                                    <span className="font-bold">{details.opened_cursors}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Schema:</span>
                                    <span className="font-bold">{details.schemaname}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SQL Text */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Current SQL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="bg-muted/10 border border-border rounded p-2 font-mono text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                                    {details.sql_text}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Execution Plan (Moved Up) */}
                        <Card className="col-span-full">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Table className="h-4 w-4" /> Execution Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="border border-border rounded-md overflow-hidden min-h-[100px]">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/20 text-muted-foreground">
                                            <tr>
                                                <th className="px-2 py-1 w-12">ID</th>
                                                <th className="px-2 py-1">Operation</th>
                                                <th className="px-2 py-1">Options</th>
                                                <th className="px-2 py-1">Object</th>
                                                <th className="px-2 py-1 w-20">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-mono">
                                            {details.plan.map((row: any) => (
                                                <tr key={row.id} className="border-t border-border">
                                                    <td className="px-2 py-1">{row.id}</td>
                                                    <td className="px-2 py-1" style={{ paddingLeft: `${(row.id * 10) + 8}px` }}>
                                                        {row.operation}
                                                    </td>
                                                    <td className="px-2 py-1 text-muted-foreground">{row.options}</td>
                                                    <td className="px-2 py-1">{row.object}</td>
                                                    <td className="px-2 py-1">{row.cost}</td>
                                                </tr>
                                            ))}
                                            {!isLoading && details.plan.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No execution plan available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Objects - Selection */}
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Related Objects
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="border border-border rounded-md overflow-hidden h-40">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/20 text-muted-foreground sticky top-0">
                                            <tr>
                                                <th className="px-2 py-1">Type</th>
                                                <th className="px-2 py-1">Owner</th>
                                                <th className="px-2 py-1">Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.objects.map((obj: any, i: number) => (
                                                <tr
                                                    key={i}
                                                    className={`border-t border-border cursor-pointer hover:bg-muted/50 ${selectedObject === obj ? 'bg-primary/10' : ''}`}
                                                    onClick={() => fetchDDL(obj)}
                                                >
                                                    <td className="px-2 py-1">{obj.type}</td>
                                                    <td className="px-2 py-1">{obj.owner}</td>
                                                    <td className="px-2 py-1 font-medium">{obj.name}</td>
                                                </tr>
                                            ))}
                                            {!isLoading && details.objects.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-muted-foreground italic">No locked objects found for this session</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Select an object to view DDL below.</p>
                            </CardContent>
                        </Card>

                        {/* Object DDL - Details */}
                        <Card className="col-span-1 md:col-span-2 flex flex-col">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Code className="h-4 w-4" /> Object Statistics / DDL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 flex-1 min-h-0">
                                <ScrollArea className="h-40 w-full rounded-md border border-border bg-muted/10 p-2 relative">
                                    {isDdlLoading && (
                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    {selectedObject ? (
                                        <pre className="font-mono text-xs whitespace-pre-wrap text-foreground">
                                            {objectDdl || 'No DDL available'}
                                        </pre>
                                    ) : (
                                        <div className="text-xs text-muted-foreground flex items-center justify-center h-full">
                                            Select an object to view DDL
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DatabaseForm, type DatabaseConnection } from "@/components/databases/database-form"
import { Database, Plus, Loader2, Edit2, Play, CheckCircle2, History, Trash2, Activity } from "lucide-react"
import { useApp, API_URL } from "@/context/app-context"
import { twMerge } from "tailwind-merge"
import { Badge } from "@/components/ui/badge"

export function DatabasesView() {
    const { logAction, setConnection, connection, isBackendReady } = useApp()
    const [connections, setConnections] = useState<DatabaseConnection[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingConn, setEditingConn] = useState<DatabaseConnection | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [isTestingConnection, setIsTestingConnection] = useState(false)

    const fetchConnections = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/connections`)
            const data = await res.json()

            // Map connections and set initial status based on global app context
            const mapped = data.map((c: any) => ({
                ...c,
                status: c.id === connection.id ? connection.status : 'Offline'
            }))

            setConnections(mapped)

            // Auto-trigger verification if we have a selected connection but it's not verified yet
            if (connection.id && connection.status !== 'Connected') {
                const connToTest = mapped.find((c: any) => c.id === connection.id)
                if (connToTest) {
                    // Trigger test without an event object
                    handleTestAndConnect(null, connToTest)
                }
            }
        } catch (error) {
            console.error('Failed to fetch connections:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConnections()
    }, [connection.id])

    const handleSelect = (conn: DatabaseConnection) => {
        if (conn.status === 'Connecting...') return
        // Just set the active metadata in state and localStorage
        setConnection({
            ...conn,
            status: 'Online',
            user: conn.username
        })
        logAction('System', 'Databases', `Selected connection: ${conn.name}`)
    }

    const handleTestTemporaryConnection = async (data: DatabaseConnection) => {
        logAction('Connection', 'Test', `Testing connection to ${data.name}...`)
        setIsTestingConnection(true)

        try {
            const res = await fetch(`${API_URL}/connections/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                const result = await res.json()
                logAction('Success', 'Test', `Connection successful: ${result.discovery.version} (${result.discovery.role})`)
                alert(`Connection Successful!\n\nDatabase: ${result.discovery.name}\nVersion: ${result.discovery.version}\nRole: ${result.discovery.role}`)
            } else {
                const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }))
                logAction('Error', 'Test', `Connection failed: ${errorData.detail}`)
                alert(`Connection Failed: ${errorData.detail}`)
            }
        } catch (error) {
            console.error('Test failed:', error)
            logAction('Error', 'Test', 'Network error while testing connection')
            alert('Test failed: Could not reach the server.')
        } finally {
            setIsTestingConnection(false)
        }
    }

    const handleTestAndConnect = async (e: React.MouseEvent | null, conn: DatabaseConnection) => {
        if (e) e.stopPropagation() // Prevent triggering select
        if (conn.status === 'Connecting...') return

        logAction('Connection', 'Databases', `Testing and activating ${conn.name}...`)
        setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'Connecting...' } : c))

        try {
            const res = await fetch(`${API_URL}/connections/${conn.id}/activate`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()
                const discovery = data.discovery || {}

                setConnection({
                    ...conn,
                    ...discovery,
                    status: 'Connected',
                    user: conn.username
                })
                logAction('Connection', 'Databases', `Connected to ${conn.name}`)

                setConnections(prev => prev.map(c => c.id === conn.id ? {
                    ...c,
                    ...discovery,
                    status: 'Connected'
                } : { ...c, status: 'Offline' }))
            } else {
                const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }))
                logAction('Error', 'Databases', `Failed to connect: ${errorData.detail}`)
                setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'Offline' } : c))
            }
        } catch (error) {
            console.error('Activation failed:', error)
            logAction('Error', 'Databases', 'Connection error (Server unreachable)')
            setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'Offline' } : c))
        }
    }

    const handleSave = async (data: DatabaseConnection) => {
        try {
            const isUpdate = !!editingConn
            const url = isUpdate ? `${API_URL}/connections/${editingConn.id}` : `${API_URL}/connections`
            const method = isUpdate ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                logAction('Database', isUpdate ? 'Update' : 'Create', `${isUpdate ? 'Updated' : 'Created'} ${data.name}`)
                await fetchConnections()
            }
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setIsDialogOpen(false)
            setEditingConn(undefined)
        }
    }

    const handleDelete = async (e: React.MouseEvent, conn: DatabaseConnection) => {
        e.stopPropagation()
        if (!window.confirm(`Are you sure you want to remove the connection "${conn.name}"?`)) return

        try {
            const res = await fetch(`${API_URL}/connections/${conn.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                logAction('Database', 'Delete', `Removed connection ${conn.name}`)
                await fetchConnections()
            }
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    const openNewResult = () => {
        setEditingConn(undefined)
        setIsDialogOpen(true)
    }

    const openEdit = (e: React.MouseEvent, conn: DatabaseConnection) => {
        e.stopPropagation() // Prevent triggering connect
        setEditingConn(conn)
        setIsDialogOpen(true)
    }

    if (!isBackendReady) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                    <div className="relative">
                        <Loader2 className="size-12 animate-spin text-primary opacity-20" />
                        <Activity className="size-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold tracking-tight">Initializing Application</h2>
                        <p className="text-muted-foreground text-sm">Please wait while the backend services are starting up...</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                        <div className="size-1.5 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">RockDB Backend Booting</span>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
                    <Button className="gap-2" onClick={openNewResult}>
                        <Plus className="size-4" />
                        New Connection
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="size-8 animate-spin mb-4" />
                            <p>Loading database connections...</p>
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Database className="size-12 mb-4 opacity-20" />
                            <p>No connections found. Create your first one!</p>
                        </div>
                    ) : (
                        connections.map((conn) => (
                            <Card
                                key={conn.id}
                                className={twMerge(
                                    "cursor-pointer transition-all hover:shadow-md border-border relative group",
                                    conn.status === 'Connected' ? "border-primary ring-1 ring-primary/20 bg-primary/5" :
                                        connection.id === conn.id ? "border-blue-400 bg-blue-50/50" : "hover:border-primary/50"
                                )}
                                onClick={() => handleSelect(conn)}
                            >
                                {localStorage.getItem('last_connection_id') === conn.id?.toString() && (
                                    <Badge variant="secondary" className="absolute -top-2 -right-2 gap-1 px-1.5 py-0 shadow-sm z-10 bg-background border-border">
                                        <History className="size-3" />
                                        Last Used
                                    </Badge>
                                )}
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <span className={twMerge(
                                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                                            conn.type === 'PROD' ? "bg-red-100 text-red-700 border-red-200" :
                                                conn.type === 'DEV' ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"
                                        )}>
                                            {conn.type}
                                        </span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => openEdit(e, conn)}
                                        >
                                            <Edit2 className="size-3 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                            onClick={(e) => handleDelete(e, conn)}
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                        <Database className={twMerge("size-4 ml-1",
                                            conn.status === 'Connected' ? "text-green-500" :
                                                connection.id === conn.id ? "text-blue-500" : "text-muted-foreground"
                                        )} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold truncate" title={conn.name}>{conn.name}</div>
                                    <div className="flex flex-col gap-0.5 mt-2">
                                        <p className="text-xs text-muted-foreground font-mono truncate" title={conn.connection_mode === 'STRING' ? conn.connect_string : `${conn.username}@${conn.host}:${conn.port}/${conn.service}`}>
                                            {conn.connection_mode === 'STRING'
                                                ? (conn.connect_string?.length && conn.connect_string.length > 50 ? conn.connect_string.substring(0, 50) + "..." : conn.connect_string)
                                                : `${conn.username}@${conn.host}:${conn.port}/${conn.service}`
                                            }
                                        </p>
                                    </div>

                                    {/* Metadata Badges */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {/* Connection Method/Role Badges */}
                                        <div className="flex gap-1">
                                            {conn.connection_mode === 'STRING' ? (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                    TNS
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                                                    DIRECT
                                                </span>
                                            )}
                                            {conn.connection_role && conn.connection_role !== 'NORMAL' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase">
                                                    {conn.connection_role}
                                                </span>
                                            )}
                                        </div>

                                        {/* Database Properties Badges */}
                                        {conn.db_type && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {conn.db_type}
                                            </span>
                                        )}
                                        {conn.role && (
                                            <span className={twMerge(
                                                "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                                                conn.role === 'PRIMARY' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-purple-100 text-purple-700 border-purple-200"
                                            )}>
                                                {conn.role}
                                            </span>
                                        )}
                                        {conn.log_mode && (
                                            <span className={twMerge(
                                                "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                                                conn.log_mode === 'ARCHIVELOG' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
                                            )}>
                                                {conn.log_mode}
                                            </span>
                                        )}
                                        {conn.is_rac && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-700 border-cyan-200">
                                                RAC {conn.inst_name ? `(${conn.inst_name})` : ''}
                                            </span>
                                        )}
                                        {conn.apply_status && conn.apply_status !== 'N/A' && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border-indigo-200">
                                                {conn.apply_status}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <span className={twMerge(
                                            "text-sm font-medium",
                                            conn.status === 'Connected' ? "text-green-600" :
                                                conn.status === 'Connecting...' ? "text-primary" :
                                                    connection.id === conn.id ? "text-blue-600" : "text-muted-foreground"
                                        )}>
                                            {conn.status === 'Connected' ? 'Active & Verified' :
                                                connection.id === conn.id ? 'Selected' : conn.status}
                                        </span>
                                        {conn.status !== 'Connected' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-auto h-7 gap-1 text-[10px] font-bold"
                                                onClick={(e) => handleTestAndConnect(e, conn)}
                                                disabled={conn.status === 'Connecting...'}
                                            >
                                                {conn.status === 'Connecting...' ? (
                                                    <Loader2 className="size-3 animate-spin" />
                                                ) : (
                                                    <Play className="size-3" />
                                                )}
                                                TEST & CONNECT
                                            </Button>
                                        )}
                                        {conn.status === 'Connected' && (
                                            <CheckCircle2 className="size-4 text-green-500 ml-auto" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>{editingConn ? "Edit Connection" : "New Connection"}</DialogTitle>
                            <DialogDescription>Enter the details for your Oracle Database.</DialogDescription>
                        </DialogHeader>
                        <DatabaseForm
                            initialData={editingConn}
                            onSave={handleSave}
                            onCancel={() => setIsDialogOpen(false)}
                            onTest={handleTestTemporaryConnection}
                            isTesting={isTestingConnection}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout >
    )
}

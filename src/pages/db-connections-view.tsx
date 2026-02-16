/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: db-connections-view.tsx
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
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Plus, Trash2, Edit2, Play, Power, RefreshCw, Layers, CheckCircle, XCircle } from 'lucide-react'
import { useApp, API_URL } from '@/context/app-context'
import { ConnectionFormDialog } from '@/components/connections/connection-form-dialog'
import { Badge } from '@/components/ui/badge'

export function DbConnectionsView() {
    const { connections, setConnections, activeConnection, setActiveConnection, logAction } = useApp()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingConnection, setEditingConnection] = useState<any>(null)
    const [isSyncing, setIsSyncing] = useState(false)

    const fetchConnections = async () => {
        try {
            const res = await fetch(`${API_URL}/connections`)
            if (res.ok) setConnections(await res.json())
        } catch (error) {
            console.error('Error fetching connections:', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this connection?')) return
        try {
            const res = await fetch(`${API_URL}/connections/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchConnections()
                logAction('Config', 'Connection', `Deleted connection ID ${id}`)
            }
        } catch (error) {
            console.error('Error deleting connection:', error)
        }
    }

    const toggleActive = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/connections/activate/${id}`, { method: 'POST' })
            if (res.ok) {
                const conn = await res.json()
                setActiveConnection(conn)
                fetchConnections()
                logAction('Config', 'Connection', `Activated connection: ${conn.label}`)
            }
        } catch (error) {
            console.error('Error activating connection:', error)
        }
    }

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch(`${API_URL}/connections/sync-exporter`, { method: 'POST' })
            if (res.ok) {
                alert('Prometheus Exporter synchronized successfully!')
                logAction('Config', 'Sync', 'Prometheus Exporter config synchronized')
            }
        } catch (error) {
            console.error('Error syncing exporter:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    useEffect(() => {
        fetchConnections()
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Database Connections</h1>
                        <p className="text-muted-foreground text-sm">Manage Oracle database targets and Prometheus synchronization</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2">
                            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            Sync Exporter
                        </Button>
                        <Button size="sm" onClick={() => { setEditingConnection(null); setIsDialogOpen(true) }} className="gap-2">
                            <Plus className="size-4" />
                            New Connection
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connections.map((conn) => (
                        <Card key={conn.id} className={`group relative transition-all hover:shadow-md ${conn.is_active ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                            <CardHeader className="pb-3 border-b border-muted/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg ${conn.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Database className="size-5" />
                                        </div>
                                        <div className="truncate">
                                            <CardTitle className="text-base truncate">{conn.label}</CardTitle>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] font-normal py-0 px-1 capitalize">{conn.type}</Badge>
                                                {conn.is_active && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-primary font-bold">
                                                        <CheckCircle className="size-2.5" /> ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingConnection(conn); setIsDialogOpen(true) }}>
                                            <Edit2 className="size-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(conn.id)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 pb-4 space-y-3">
                                <div className="space-y-1.5 font-mono text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Host:</span>
                                        <span className="truncate ml-4">{conn.host}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{conn.type === 'service' ? 'Service Name:' : 'SID:'}</span>
                                        <span className="truncate ml-4">{conn.service_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">User:</span>
                                        <span className="truncate ml-4">{conn.username}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-muted/30 flex gap-2">
                                    {!conn.is_active ? (
                                        <Button size="sm" variant="default" className="w-full text-xs h-8 gap-1.5" onClick={() => toggleActive(conn.id)}>
                                            <Power className="size-3.5" /> Connect Now
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="secondary" className="w-full text-xs h-8 gap-1.5 cursor-default bg-emerald-50 text-emerald-700 border-none shadow-none hover:bg-emerald-50">
                                            <CheckCircle className="size-3.5" /> Connected
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        variant="ghost"
                        className="h-full border-2 border-dashed border-muted hover:border-primary/50 hover:bg-muted/10 transition-all min-h-[180px] flex flex-col gap-3 group"
                        onClick={() => { setEditingConnection(null); setIsDialogOpen(true) }}
                    >
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                            <Plus className="size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-muted-foreground group-hover:text-foreground">Add New Connection</div>
                            <div className="text-[10px] text-muted-foreground">Configure another Oracle target</div>
                        </div>
                    </Button>
                </div>
            </div>

            <ConnectionFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                connection={editingConnection}
                onSuccess={fetchConnections}
            />
        </MainLayout>
    )
}

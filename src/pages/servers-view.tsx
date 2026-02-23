/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: servers-view.tsx
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
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, ShieldCheck, Terminal, Trash2, Edit2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { API_URL, useApp } from '@/context/app-context'
import { ServerFormDialog } from '@/components/servers/server-form-dialog'

export function ServersView() {
    const { logAction } = useApp()
    const [servers, setServers] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingServer, setEditingServer] = useState<any>(null)

    const fetchServers = async () => {
        try {
            const res = await fetch(`${API_URL}/servers`)
            if (res.ok) setServers(await res.json())
        } catch (error) {
            console.error('Error fetching servers:', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this server?')) return
        try {
            const res = await fetch(`${API_URL}/servers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchServers()
                logAction('Config', 'Server', `Deleted server ID ${id}`)
            }
        } catch (error) {
            console.error('Error deleting server:', error)
        }
    }

    useEffect(() => {
        fetchServers()
    }, [])

    const filteredServers = servers.filter(s =>
        s.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.host?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">OS Managed Hosts</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            Management of Unix/Linux servers via SSH
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search hosts..."
                                className="pl-9 h-9 bg-card border-border focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button size="sm" className="gap-2" onClick={() => { setEditingServer(null); setIsDialogOpen(true) }}>
                            <Plus className="size-4" /> Add Host
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-auto pr-2 pb-6">
                    {filteredServers.map((server) => (
                        <Card key={server.id} className="group relative transition-all hover:shadow-md border-border bg-card">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                            <Terminal className="size-5" />
                                        </div>
                                        <div className="truncate">
                                            <CardTitle className="text-base font-bold truncate group-hover:text-primary transition-colors">
                                                {server.label}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] font-bold py-0 px-1.5 uppercase border-primary/20 bg-primary/5 text-primary">
                                                    {server.connection_type || 'SSH'}
                                                </Badge>
                                                <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                                                    {server.host}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => { setEditingServer(server); setIsDialogOpen(true) }}>
                                            <Edit2 className="size-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(server.id)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4 pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">User</span>
                                        <div className="font-bold truncate text-foreground">{server.username}</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Port</span>
                                        <div className="font-bold text-foreground">{server.port || 22}</div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                        <span>SSH Link</span>
                                        <span className="text-emerald-600 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                            <ShieldCheck className="size-3" /> VERIFIED
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                        <div className="h-full w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                    </div>
                                </div>

                                <Button variant="outline" size="sm" className="w-full text-[10px] h-8 font-bold gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                                    <Terminal className="size-3" />
                                    Connect Shell
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        variant="ghost"
                        className="h-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[160px] flex flex-col gap-3 group bg-card"
                        onClick={() => { setEditingServer(null); setIsDialogOpen(true) }}
                    >
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Plus className="size-7" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Add New Managed Host</div>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Provision another OS target</div>
                        </div>
                    </Button>
                </div>
            </div>

            <ServerFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                server={editingServer}
                onSuccess={fetchServers}
            />
        </MainLayout>
    )
}

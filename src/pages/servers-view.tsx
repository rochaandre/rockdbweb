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
import { Search, Plus, ShieldCheck, Terminal, Trash2, Edit2, Globe, Loader2, Server as ServerIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { API_URL, useApp } from '@/context/app-context'
import { ServerFormDialog } from '@/components/servers/server-form-dialog'

export function ServersView() {
    const { logAction } = useApp()
    const [servers, setServers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingServer, setEditingServer] = useState<any>(null)

    const fetchServers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/servers`)
            if (res.ok) setServers(await res.json())
        } catch (error) {
            console.error('Error fetching servers:', error)
        } finally {
            setIsLoading(false)
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
            <div className="flex relative flex-col h-full bg-background overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col border-b border-border/50 bg-surface/50 backdrop-blur-md p-6 gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Managed Infrastructure
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <Globe className="size-3.5 text-primary" />
                                Inventory of SSH-enabled Unix/Linux hosts
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64 group">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search hosts..."
                                    className="pl-9 h-9 bg-surface border-border/50 focus-visible:ring-primary/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-primary/20" onClick={() => { setEditingServer(null); setIsDialogOpen(true) }}>
                                <Plus className="size-4" /> Add New Host
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest">Scanning Infrastructure...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                            {filteredServers.map((server) => (
                                <Card key={server.id} className="group relative transition-all hover:shadow-xl hover:-translate-y-1 border-border/40 bg-surface/40 backdrop-blur-sm overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <CardHeader className="pb-3 border-b border-border/20">
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                                                    <ServerIcon className="size-5" />
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => { setEditingServer(server); setIsDialogOpen(true) }}
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(server.id)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-4 pb-4 space-y-4 relative z-10">
                                        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">System User</span>
                                                <div className="font-bold truncate text-foreground/80">{server.username}</div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">SSH Port</span>
                                                <div className="font-bold text-foreground/80">{server.port || 22}</div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-border/20 flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                <span>Security Status</span>
                                                <span className="text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                                    <ShieldCheck className="size-3" /> VERIFIED
                                                </span>
                                            </div>
                                            <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                                                <div className="h-full w-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-[10px] h-8 font-black uppercase tracking-widest gap-1.5 border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-lg"
                                        >
                                            <Terminal className="size-3" />
                                            Open Interactive Shell
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add Button Pseudo-Card */}
                            <button
                                type="button"
                                className="h-full group relative border-2 border-dashed border-border/40 hover:border-primary/50 bg-surface/20 hover:bg-primary/5 transition-all min-h-[180px] rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer"
                                onClick={() => { setEditingServer(null); setIsDialogOpen(true) }}
                            >
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <Plus className="size-8" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Provision New Host</div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60 italic">Expand Infrastructure</div>
                                </div>
                            </button>
                        </div>
                    )}
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

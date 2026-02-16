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
import { Search, Server, Plus, MoreVertical, Cpu, HardDrive, Network, Activity, ShieldCheck, Terminal } from 'lucide-react'
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

    useEffect(() => {
        fetchServers()
    }, [])

    const filteredServers = servers.filter(s =>
        s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.host.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">OS Managed Hosts</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Server className="size-3" /> Management of Unix/Linux servers via SSH
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search hosts..."
                                className="pl-9 h-9 bg-muted/50"
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
                        <Card key={server.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 border-b border-border/30 bg-muted/5">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Terminal className="size-5" />
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] font-bold py-0 h-4 uppercase">
                                        {server.type || 'LINUX'}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-bold mt-3 group-hover:text-primary transition-colors">
                                    {server.label}
                                </CardTitle>
                                <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                                    <Network className="size-3" /> {server.host}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">User</span>
                                        <span className="text-xs font-bold">{server.username}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Port</span>
                                        <span className="text-xs font-bold font-mono">{server.port || 22}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase">
                                        <span>SSH Connectivity</span>
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <ShieldCheck className="size-3" /> Verified
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-2 border-t border-border/30 bg-muted/5 flex gap-1">
                                <Button variant="ghost" size="xs" className="flex-1 text-[10px] h-7 font-bold gap-1.5" onClick={() => { setEditingServer(server); setIsDialogOpen(true) }}>
                                    Edit
                                </Button>
                                <Button variant="ghost" size="xs" className="flex-1 text-[10px] h-7 font-bold gap-1.5 text-muted-foreground hover:text-foreground">
                                    Shell
                                </Button>
                            </div>
                        </Card>
                    ))}
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

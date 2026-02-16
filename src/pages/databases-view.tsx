/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: databases-view.tsx
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Database, Plus, MoreVertical, Server, HardDrive, ShieldCheck, Activity, Power, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const MOCK_DATABASES = [
    {
        id: 1,
        name: 'PROD_SALES',
        host: 'db-prod-01.techmax.com',
        version: '19.12.0.0.0',
        status: 'OPEN',
        role: 'PRIMARY',
        usage: 68,
        sessions: 42,
        isRac: true,
        nodes: 3
    },
    {
        id: 2,
        name: 'STG_HR',
        host: 'db-stg-02.techmax.com',
        version: '19.10.0.0.0',
        status: 'OPEN',
        role: 'PRIMARY',
        usage: 24,
        sessions: 12,
        isRac: false,
        nodes: 1
    },
    {
        id: 3,
        name: 'DEV_CRM',
        host: 'localhost',
        version: '21.3.0.0.0',
        status: 'MOUNTED',
        role: 'STANDBY',
        usage: 45,
        sessions: 0,
        isRac: false,
        nodes: 1
    }
]

export function DatabasesView() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredDbs = MOCK_DATABASES.filter(db =>
        db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        db.host.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Database Inventory</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Database className="size-3" /> Comprehensive view of all registered Oracle instances
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search databases..."
                                className="pl-9 h-9 bg-muted/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button size="sm" className="gap-2">
                            <Plus className="size-4" /> Register New
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2 border-y border-border/50">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                        All Targets ({MOCK_DATABASES.length})
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold">
                        Online ({MOCK_DATABASES.filter(db => db.status === 'OPEN').length})
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold">
                        RAC Clusters ({MOCK_DATABASES.filter(db => db.isRac).length})
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto pr-2 pb-6">
                    {filteredDbs.map((db) => (
                        <Card key={db.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 bg-muted/10 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-lg ${db.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        <Database className="size-5" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-border/50 bg-background uppercase">
                                            {db.role}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="size-5 text-muted-foreground">
                                            <MoreVertical className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                                    {db.name}
                                    {db.isRac && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-100">RAC</Badge>}
                                </CardTitle>
                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                                    <Server className="size-3" /> {db.host}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <HardDrive className="size-2.5" /> Version
                                        </div>
                                        <div className="text-xs font-bold">{db.version}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Power className="size-2.5" /> Status
                                        </div>
                                        <Badge className={`text-[9px] h-4 px-1.5 font-bold border-none shadow-none ${db.status === 'OPEN' ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-500 text-white'}`}>
                                            {db.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                        <span>Space Utilized</span>
                                        <span className={db.usage > 90 ? "text-rose-500" : ""}>{db.usage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${db.usage > 90 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${db.usage}%` }} />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Activity className="size-3" /> {db.sessions} Active Sessions
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="size-3 text-emerald-500" /> Compliance 100%
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-4 px-4 bg-muted/5 border-t border-border/30 flex gap-2">
                                <Button size="sm" className="flex-1 text-xs font-bold h-8 gap-1.5 shadow-sm">
                                    Connect <Activity className="size-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs font-bold h-8 gap-1.5 border-border/50 hover:bg-background">
                                    Details <ExternalLink className="size-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}

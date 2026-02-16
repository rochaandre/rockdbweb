/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sessions-view.tsx
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
import React, { useState } from 'react'
import { SessionsControlBar } from './control-bar'
import { SessionsTable } from './sessions-table'
import { SessionDetailSidebar } from './detail-sidebar'
import { BlockingTable } from './blocking-table'
import { LongOpsTable } from './long-ops-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Activity, ShieldAlert, BarChart3, Database, User, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SessionsView({ data, stats, blocking, longOps }: any) {
    const [filter, setFilter] = useState('')
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [viewMode, setViewMode] = useState('list')

    const filteredSessions = data.filter((s: any) =>
        s.sid.includes(filter) ||
        (s.username && s.username.toLowerCase().includes(filter.toLowerCase())) ||
        (s.program && s.program.toLowerCase().includes(filter.toLowerCase())) ||
        (s.machine && s.machine.toLowerCase().includes(filter.toLowerCase())) ||
        (s.osuser && s.osuser.toLowerCase().includes(filter.toLowerCase()))
    )

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1200)
    }

    const handleSelectSession = (session: any) => {
        // If it's a SID string from another table
        if (typeof session === 'string') {
            const fullSession = data.find((s: any) => s.sid === session)
            if (fullSession) setSelectedSession(fullSession)
        } else {
            setSelectedSession(session)
        }
    }

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            <SessionsControlBar
                onRefresh={handleRefresh}
                onFilterChange={setFilter}
                filterValue={filter}
                stats={stats}
                isRefreshing={refreshing}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 flex overflow-hidden gap-6">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Tabs defaultValue="all" className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-muted/30 p-1 border border-border/50 rounded-2xl">
                                <TabsTrigger value="all" className="rounded-xl px-6 py-2 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <User className="size-3.5" /> All Sessions
                                </TabsTrigger>
                                <TabsTrigger value="active" className="rounded-xl px-6 py-2 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                                    <Activity className="size-3.5" /> Active Only
                                </TabsTrigger>
                                <TabsTrigger value="blocking" className="rounded-xl px-6 py-2 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white relative">
                                    <ShieldAlert className="size-3.5" /> Blocker Hierarchies {stats.blocking > 0 && <Badge className="absolute -top-2 -right-2 h-4 min-w-[16px] p-1 bg-white text-rose-600 border-none shadow-md">{stats.blocking}</Badge>}
                                </TabsTrigger>
                                <TabsTrigger value="longops" className="rounded-xl px-6 py-2 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                    <BarChart3 className="size-3.5" /> Long Operations
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border border-border/30 rounded-2xl">
                                <Database className="size-3.5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Cluster Instances:</span>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="h-4 text-[8px] font-black bg-primary/10 text-primary border-none">INST 1</Badge>
                                    <Badge variant="outline" className="h-4 text-[8px] font-black bg-muted text-muted-foreground border-none opacity-50">INST 2</Badge>
                                </div>
                            </div>
                        </div>

                        <TabsContent value="all" className="flex-1 m-0 overflow-auto scrollbar-hide">
                            {viewMode === 'list' ? (
                                <SessionsTable
                                    data={filteredSessions}
                                    onSelect={handleSelectSession}
                                    selectedSid={selectedSession?.sid}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                    {filteredSessions.map((session: any, i: number) => (
                                        <SessionCard
                                            key={i}
                                            session={session}
                                            onSelect={() => handleSelectSession(session)}
                                            isSelected={selectedSession?.sid === session.sid}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="active" className="flex-1 m-0 overflow-auto scrollbar-hide">
                            <SessionsTable
                                data={filteredSessions.filter((s: any) => s.status === 'ACTIVE')}
                                onSelect={handleSelectSession}
                                selectedSid={selectedSession?.sid}
                            />
                        </TabsContent>

                        <TabsContent value="blocking" className="flex-1 m-0 overflow-auto scrollbar-hide">
                            <BlockingTable
                                data={blocking}
                                onSelectSession={(sid) => handleSelectSession(sid)}
                            />
                        </TabsContent>

                        <TabsContent value="longops" className="flex-1 m-0 overflow-auto scrollbar-hide">
                            <LongOpsTable
                                data={longOps}
                                onSelectSession={(sid) => handleSelectSession(sid)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {selectedSession && (
                    <SessionDetailSidebar
                        session={selectedSession}
                        onClose={() => setSelectedSession(null)}
                    />
                )}
            </div>
        </div>
    )
}

function SessionCard({ session, onSelect, isSelected }: any) {
    const isActive = session.status === 'ACTIVE'
    const isBlocker = session.blocking_status === 'BLOCKER'

    return (
        <div
            onClick={onSelect}
            className={cn(
                "group p-6 rounded-2xl border bg-card/40 backdrop-blur-xl cursor-pointer transition-all duration-500 overflow-hidden relative",
                isSelected ? "border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]" : "border-border/50 hover:border-primary/30 hover:shadow-xl",
                isBlocker && "border-rose-500/30"
            )}
        >
            <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center shadow-inner",
                        isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    )}>
                        <User className="size-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase text-foreground leading-none">{session.username || 'INTERNAL'}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 mt-1 uppercase tracking-tighter">SID: {session.sid} | Serial: {session.serial}</p>
                    </div>
                </div>
                <div className={cn(
                    "size-2.5 rounded-full",
                    isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                )} />
            </div>

            <div className="space-y-4 relative">
                <div className="flex items-center gap-3">
                    <Terminal className="size-3.5 text-primary/50" />
                    <span className="text-[11px] font-bold text-foreground truncate flex-1">{session.program}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Activity className="size-3.5 text-amber-500/50" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Wait Event</p>
                        <p className="text-[11px] font-bold text-foreground mt-1 truncate">{session.event}</p>
                    </div>
                </div>
            </div>

            {isBlocker && (
                <div className="mt-6 pt-4 border-t border-rose-500/10 flex items-center gap-2 text-rose-500">
                    <ShieldAlert className="size-4 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Blocker Session</span>
                </div>
            )}
        </div>
    )
}

/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sql-report-view.tsx
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
import { FileText, Download, Printer, Share2, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SqlReportView() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">SQL Execution Reports</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <FileText className="size-3" /> Historical performance analysis and optimization reports
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 h-9 font-bold">
                            <Download className="size-4" /> Export CSV
                        </Button>
                        <Button size="sm" className="gap-2 h-9 font-bold bg-primary shadow-lg shadow-primary/20">
                            <Plus className="size-4" /> New Report
                        </Button>
                    </div>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter by SQL ID, Username or Date..." className="pl-10 bg-muted/30 border-none shadow-inner h-11 text-sm rounded-xl" />
                </div>

                <Card className="border-none shadow-none bg-muted/20 flex-1 overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-border/50">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Filter className="size-4" /> Recently Generated Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto h-full">
                        <div className="p-8 text-center space-y-4 opacity-40">
                            <div className="size-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                                <FileText className="size-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest">No Reports Found</h3>
                                <p className="text-sm max-w-md mx-auto mt-2">Historical SQL reports are generated periodically or on-demand. Start by choosing 'New Report' above.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}

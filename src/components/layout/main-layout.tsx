/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: main-layout.tsx
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
import React from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { StatusBar } from './status-bar'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { Toaster } from "@/components/ui/toaster"

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentState('sidebar-collapsed', false)

    return (
        <div className="flex h-screen w-screen bg-background overflow-hidden select-none">
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                <TopBar />

                <main className="flex-1 min-h-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-grid-slate-200/[0.04] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
                    <div className="relative h-full flex flex-col">
                        {children}
                    </div>
                </main>

                <StatusBar />
            </div>

            <Toaster />
        </div>
    )
}

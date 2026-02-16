/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: app-context.tsx
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
import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePersistentState } from '@/hooks/use-persistent-state'

interface AppContextType {
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    activeConnection: any | null
    setActiveConnection: (conn: any | null) => void
    refreshInterval: number
    setRefreshInterval: (interval: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = usePersistentState<'dark' | 'light'>('rockdb-theme', 'dark')
    const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState<boolean>('rockdb-sidebar-collapsed', false)
    const [activeConnection, setActiveConnection] = useState<any | null>(null)
    const [refreshInterval, setRefreshInterval] = usePersistentState<number>('rockdb-refresh-interval', 30)

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
    }, [theme])

    return (
        <AppContext.Provider
            value={{
                theme,
                setTheme,
                sidebarCollapsed,
                setSidebarCollapsed,
                activeConnection,
                setActiveConnection,
                refreshInterval,
                setRefreshInterval
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}

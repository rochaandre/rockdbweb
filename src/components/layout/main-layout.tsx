import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { StatusBar } from './status-bar'
import { useApp } from '@/context/app-context'
import { useNavigate, useLocation } from 'react-router-dom'
import { Database, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const { connection } = useApp()
    const navigate = useNavigate()
    const location = useLocation()

    const isConnected = connection.status === 'Connected' || connection.status === 'Online'
    const isDatabasesPage = location.pathname === '/databases'

    useEffect(() => {
        if (!isConnected && !isDatabasesPage) {
            navigate('/databases')
        }
    }, [isConnected, isDatabasesPage, navigate])

    return (
        <div className="flex h-screen w-full flex-col bg-background overflow-hidden text-foreground">
            {/* Top Bar covers full width */}
            <TopBar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <div className="flex-1 overflow-auto p-2">
                        {!isConnected && !isDatabasesPage ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <div className="border border-border p-4 rounded-xl flex flex-col items-center bg-white shadow-sm">
                                    <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                                        <Lock className="size-8" />
                                    </div>
                                    <div className="max-w-md">
                                        <h2 className="text-2xl font-bold">Database Required</h2>
                                        <p className="text-muted-foreground mt-2">
                                            You must be connected to an Oracle database to access this screen.
                                            Please go to the Databases page and establish a connection.
                                        </p>
                                    </div>
                                    <Button onClick={() => navigate('/databases')} className="gap-2 mt-6">
                                        <Database className="size-4" />
                                        Go to Databases
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                    <StatusBar />
                </main>
            </div>
        </div>
    )
}

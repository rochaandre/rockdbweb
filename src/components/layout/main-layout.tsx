import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { StatusBar } from './status-bar'

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
                        {children}
                    </div>
                    {/* Status Bar inside main content area or global bottom? 
                Usually global bottom implies full width, but if sidebar is collapsible, 
                it's nicer if status bar is full width below everything or just below content.
                Let's put it below content to align with content width if we wanted, 
                BUT standard desktop apps often have status bar full width bottom.
                Let's try putting it inside the flex col of content so it respects sidebar width.
            */}
                    <StatusBar />
                </main>
            </div>
        </div>
    )
}

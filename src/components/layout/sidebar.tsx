import { twMerge } from 'tailwind-merge'
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Database,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity,
    Archive,
    HardDrive,
    FileText,
    Terminal,
    History,
    Plus,
    Clock,
    ShieldCheck
} from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom'
import { MOCK_ASM_DATA } from '@/components/storage/asm-data'

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Activity, label: 'Sessions', path: '/sessions' },
        { icon: Clock, label: 'Long Operations', path: '/long-operations' },
        { icon: Archive, label: 'Backups', path: '/backups' },
        { icon: Database, label: 'Databases', path: '/databases' },
        { icon: HardDrive, label: 'Storage', path: '/storage' },
        { icon: FileText, label: 'Logs', path: '/logs' },
        { icon: ShieldCheck, label: 'Healthcheck', path: '/healthcheck' },
        { icon: Settings, label: 'Configuration', path: '/configuration' },
        { icon: History, label: 'Redo Log Explorer', path: '/redo-log' },
        { icon: LayoutDashboard, label: 'SQL Dashboard', path: '/sql-dashboard' },
        { icon: Terminal, label: 'SQL Central', path: '/sql-central' },
        { icon: ShieldCheck, label: 'Tools', path: '/tools' },
        { icon: Clock, label: 'Jobs (Legacy)', path: '/jobs' },
        { icon: History, label: 'Time Machine', path: '/timemachine' },
        { icon: HardDrive, label: 'Servers', path: '/servers' },

        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    // Conditional ASM
    if (MOCK_ASM_DATA.isAsmEnabled && MOCK_ASM_DATA.diskGroups && MOCK_ASM_DATA.diskGroups.length > 0) {
        // Insert before Settings
        navItems.splice(navItems.length - 1, 0, { icon: Database, label: 'ASM Explorer', path: '/asm-explorer' })
    }

    return (
        <aside
            className={twMerge(
                "flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out relative",
                collapsed ? "w-14" : "w-64"
            )}
        >
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={onToggle}
                className="absolute -right-3 top-6 size-6 rounded-full shadow-md bg-surface border-border hover:bg-muted z-10"
            >
                {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
            </Button>

            <div className="flex-1 py-4 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    // Check if path is root, then strict match, otherwise startsWith
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path)

                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={twMerge(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                collapsed && "justify-center px-0"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className="size-5 shrink-0" />
                            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                            {!collapsed && item.label === 'SQL Central' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/sql-central?new=true')
                                    }}
                                    className="p-1 hover:bg-primary/20 rounded transition-colors text-primary"
                                    title="New Script"
                                >
                                    <Plus className="size-3.5" />
                                </button>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="p-4 border-t border-border">
                {!collapsed && (
                    <div className="text-xs text-muted-foreground">
                        v0.1.0-alpha
                    </div>
                )}
            </div>
        </aside>
    )
}

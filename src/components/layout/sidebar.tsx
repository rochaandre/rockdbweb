import { twMerge } from 'tailwind-merge'
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Database,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity
} from "lucide-react"

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: false },
        { icon: Activity, label: 'Sessions', active: true },
        { icon: Database, label: 'Databases', active: false },
        { icon: Settings, label: 'Settings', active: false },
    ]

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
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={twMerge(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            item.active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className="size-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </button>
                ))}
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

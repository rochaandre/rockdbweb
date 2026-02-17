import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface DashboardLayoutProps extends ComponentProps<'div'> {
    statusMessage?: string
}

export function DashboardLayout({ className, children, statusMessage, ...props }: DashboardLayoutProps) {
    return (
        <div className={twMerge("flex h-screen w-full flex-col bg-background text-foreground overflow-hidden", className)} {...props}>
            <header className="flex h-8 shrink-0 items-center border-b border-border bg-gradient-to-r from-blue-100 to-blue-50 px-4 shadow-sm">
                <h1 className="text-xs font-bold text-slate-700">Sessions - PRD</h1>
            </header>
            <main className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
                {children}
            </main>
            <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-muted px-2 text-xs text-muted-foreground">
                <span>Refreshed at 10:35:02 +3</span>
                <span>{statusMessage}</span>
            </footer>
        </div>
    )
}

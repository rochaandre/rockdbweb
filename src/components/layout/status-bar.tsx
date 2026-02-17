
import { useApp } from "@/context/app-context"

export function StatusBar() {
    const { statusMessage, connection } = useApp()

    return (
        <footer className="flex h-6 items-center border-t border-border bg-surface px-4 text-xs text-muted-foreground shrink-0 select-none">
            <div className="flex-1 truncate font-mono">
                {statusMessage}
            </div>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                    <span className={`size-2 rounded-full ${connection.type === 'PROD' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <strong>{connection.name}</strong>
                </span>
                <span>User: <strong>{connection.user}</strong></span>
                <span className="opacity-50">Saved: {new Date().toLocaleTimeString()}</span>
            </div>
        </footer>
    )
}

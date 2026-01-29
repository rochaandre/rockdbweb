import { createContext, useContext, useState, type ReactNode } from 'react'

interface Connection {
    name: string
    type: 'PROD' | 'DEV' | 'TEST'
    user: string
    host: string
}

interface AppContextType {
    connection: Connection
    statusMessage: string
    setStatusMessage: (msg: string) => void
    logAction: (action: string, component: string, details?: string) => void
    setConnection: (conn: Connection) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    // Global Connection State - Mock Default
    const [connection, setConnection] = useState<Connection>({
        name: 'Oracle PROD (19c)',
        type: 'PROD',
        user: 'SYS',
        host: 'db-prod-01'
    })

    const [statusMessage, setStatusMessage] = useState('System Ready')

    const logAction = (action: string, component: string, details: string = '') => {
        const timestamp = new Date().toLocaleTimeString()
        const message = `[${timestamp}] ACTION: ${action} | COMP: ${component} ${details ? `| ${details}` : ''}`
        setStatusMessage(message)
        console.log(message) // Also log to console for dev
    }

    return (
        <AppContext.Provider value={{ connection, setConnection, statusMessage, setStatusMessage, logAction }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}

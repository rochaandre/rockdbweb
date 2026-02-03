import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface Connection {
    id?: string
    name: string
    type: 'PROD' | 'DEV' | 'TEST'
    user: string
    host: string
    port?: string
    service?: string
    version?: string
    patch?: string
    os?: string
    last_connected?: string
    status?: 'Connected' | 'Online' | 'Offline' | 'Connecting...'
    db_type?: string
    role?: string
    apply_status?: string
    log_mode?: string
    is_rac?: boolean
    inst_name?: string
}

interface AppContextType {
    connection: Connection
    statusMessage: string
    setStatusMessage: (msg: string) => void
    logAction: (action: string, component: string, details?: string) => void
    setConnection: (conn: Connection) => void
    fetchActiveConnection: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_CONNECTION: Connection = {
    name: 'Not Connected',
    type: 'DEV',
    user: 'None',
    host: 'none',
    status: 'Offline'
}

export const API_URL = 'http://localhost:8000/api'

export function AppProvider({ children }: { children: ReactNode }) {
    const [connection, setConnectionState] = useState<Connection>(DEFAULT_CONNECTION)
    const [statusMessage, setStatusMessage] = useState('System Ready')

    const setConnection = (conn: Connection) => {
        setConnectionState(conn)
        if (conn.id) {
            localStorage.setItem('last_connection_id', conn.id.toString())
        }
    }

    const fetchActiveConnection = async () => {
        try {
            // Priority 1: Check backend for active connection
            const res = await fetch(`${API_URL}/connections/active`)
            if (res.ok) {
                const data = await res.json()
                setConnectionState({
                    ...data,
                    status: 'Online',
                    user: data.username
                })
                localStorage.setItem('last_connection_id', data.id.toString())
                setStatusMessage(`Active connection: ${data.name}`)
                logAction('System', 'Init', `Selected active connection: ${data.name}`)
                return
            }

            // Priority 2: Check localStorage if backend has no active
            const lastId = localStorage.getItem('last_connection_id')
            if (lastId) {
                const resAll = await fetch(`${API_URL}/connections`)
                if (resAll.ok) {
                    const all = await resAll.json()
                    const lastConn = all.find((c: any) => c.id.toString() === lastId)
                    if (lastConn) {
                        setConnectionState({
                            ...lastConn,
                            status: 'Online',
                            user: lastConn.username
                        })
                        setStatusMessage(`Restored last connection: ${lastConn.name}`)
                        return
                    }
                }
            }

            setConnectionState(DEFAULT_CONNECTION)
        } catch (error) {
            console.error('Failed to fetch active connection:', error)
            setConnectionState(DEFAULT_CONNECTION)
        }
    }

    useEffect(() => {
        fetchActiveConnection()
    }, [])

    const logAction = (action: string, component: string, details: string = '') => {
        const timestamp = new Date().toLocaleTimeString()
        const message = `[${timestamp}] ACTION: ${action} | COMP: ${component} ${details ? `| ${details}` : ''}`
        setStatusMessage(message)
        console.log(message)
    }

    return (
        <AppContext.Provider value={{ connection, setConnection, statusMessage, setStatusMessage, logAction, fetchActiveConnection }}>
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

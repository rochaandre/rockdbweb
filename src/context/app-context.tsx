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
    isBackendReady: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_CONNECTION: Connection = {
    name: 'Not Connected',
    type: 'DEV',
    user: 'None',
    host: 'none',
    status: 'Offline'
}

// Port 8000 is default for Web, 8080 is for Electron sidecar
const getBackendPort = () => {
    // If we're on the specific Electron dev port, use 8080
    if (window.location.port === '5180') return '8080'
    // If we're running from a file (packaged electron), use 8080
    if (window.location.protocol === 'file:') return '8080'
    // Default to 8080 if not on the standard vite dev port (likely production or sidecar)
    if (window.location.port !== '5173' && window.location.port !== '') return '8080'
    // Fallback to 8000
    return '8000'
}

export const API_URL = `http://localhost:${getBackendPort()}/api`

export function AppProvider({ children }: { children: ReactNode }) {
    const [connection, setConnectionState] = useState<Connection>(DEFAULT_CONNECTION)
    const [statusMessage, setStatusMessage] = useState('System Ready')
    const [isBackendReady, setIsBackendReady] = useState(false)

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

    const checkBackendHealth = async () => {
        try {
            const res = await fetch(`${API_URL}/health`)
            if (res.ok) {
                setIsBackendReady(true)
                logAction('System', 'Backend', 'Connected to backend sidecar')
                return true
            }
        } catch (error) {
            // Ignore error, backend not ready yet
        }
        return false
    }

    useEffect(() => {
        let isMounted = true
        let pollCount = 0
        const MAX_POLLS = 30 // Wait up to 30 seconds

        const poll = async () => {
            const ready = await checkBackendHealth()
            if (ready && isMounted) {
                fetchActiveConnection()
            } else if (isMounted && pollCount < MAX_POLLS) {
                pollCount++
                setTimeout(poll, 1000)
            } else if (isMounted) {
                logAction('Error', 'Backend', 'Timed out waiting for backend')
            }
        }

        poll()

        return () => { isMounted = false }
    }, [])

    const logAction = (action: string, component: string, details: string = '') => {
        const timestamp = new Date().toLocaleTimeString()
        const message = `[${timestamp}] ACTION: ${action} | COMP: ${component} ${details ? `| ${details}` : ''}`
        setStatusMessage(message)
        console.log(message)
    }

    return (
        <AppContext.Provider value={{
            connection,
            setConnection,
            statusMessage,
            setStatusMessage,
            logAction,
            fetchActiveConnection,
            isBackendReady
        }}>
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

import { useState, useEffect, useRef } from 'react'
import { API_URL, useApp } from '@/context/app-context'

/**
 * A hook that works like useState but persists the value in the backend SQLite DB.
 * Scoped by screen_id and current connection_id.
 */
export function usePersistentState<T>(screenId: string, propertyName: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
    const { connection } = useApp()
    const [state, setState] = useState<T>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)
    const isFirstRender = useRef(true)
    const connectionId = connection?.id

    // Load from backend when screen or connection changes
    useEffect(() => {
        if (!connectionId) {
            setIsLoading(false)
            return
        }

        async function loadPrefs() {
            setIsLoading(true)
            try {
                const res = await fetch(`${API_URL}/preferences/${screenId}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data && data[propertyName] !== undefined) {
                        setState(data[propertyName])
                    } else {
                        setState(defaultValue)
                    }
                }
            } catch (error) {
                console.error(`Error loading preference ${screenId}.${propertyName}:`, error)
            } finally {
                setIsLoading(false)
                isFirstRender.current = true // Reset for new connection/screen
            }
        }

        loadPrefs()
    }, [screenId, connectionId])

    // Save to backend when state changes
    useEffect(() => {
        // Skip first render after load (don't save what we just loaded)
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (!connectionId) return

        const timer = setTimeout(async () => {
            try {
                // We fetch current full data for this screen first to avoid overwriting other properties
                const res = await fetch(`${API_URL}/preferences/${screenId}`)
                let currentFullData: any = {}
                if (res.ok) {
                    currentFullData = await res.json()
                }

                const newData = {
                    ...currentFullData,
                    [propertyName]: state
                }

                await fetch(`${API_URL}/preferences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        screen_id: screenId,
                        data: newData
                    })
                })
            } catch (error) {
                console.error(`Error saving preference ${screenId}.${propertyName}:`, error)
            }
        }, 500) // Debounce 500ms

        return () => clearTimeout(timer)
    }, [state, screenId, connectionId])

    return [state, setState, isLoading]
}

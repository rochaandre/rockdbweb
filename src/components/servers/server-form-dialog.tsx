import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ServerForm } from "@/components/servers/server-form"
import { API_URL } from "@/context/app-context"

interface ServerFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    server?: any
    onSuccess?: () => void
}

export function ServerFormDialog({ open, onOpenChange, server, onSuccess }: ServerFormDialogProps) {
    const handleSubmit = async (data: any) => {
        try {
            const url = server ? `${API_URL}/servers/${server.id}` : `${API_URL}/servers`
            const method = server ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                onSuccess?.()
                onOpenChange(false)
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error submitting server:', error)
            alert('Network error submitting server configuration')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none overflow-visible">
                <ServerForm
                    initialData={server}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

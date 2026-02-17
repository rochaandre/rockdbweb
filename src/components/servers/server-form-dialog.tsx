import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ServerForm } from "@/components/servers/server-form"

export function ServerFormDialog({ open, onOpenChange, server, onSuccess }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
                <ServerForm
                    initialData={server}
                    onSubmit={(data: any) => {
                        console.log('Submitting server:', data)
                        onSuccess?.()
                        onOpenChange(false)
                    }}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

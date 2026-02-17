import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DatabaseForm } from "@/components/databases/database-form"

export function ConnectionFormDialog({ open, onOpenChange, connection, onSuccess }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{connection ? 'Edit' : 'New'} Connection</DialogTitle>
                </DialogHeader>
                <DatabaseForm
                    initialData={connection}
                    onSave={(data) => {
                        // Implement save logic or call onSuccess if handled by parent
                        console.log('Saving connection:', data)
                        onSuccess?.()
                        onOpenChange(false)
                    }}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

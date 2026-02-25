import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export function DialogRoot(props: Dialog.Root.Props) {
    return <Dialog.Root {...props} />
}

export interface DialogProps extends Dialog.Root.Props { }

export function DialogTrigger(props: Dialog.Trigger.Props) {
    return <Dialog.Trigger {...props} />
}

export function DialogPortal(props: Dialog.Portal.Props) {
    return <Dialog.Portal {...props} />
}

export interface DialogContentProps extends ComponentProps<'div'> {
    className?: string
    children: React.ReactNode
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
    return (
        <Dialog.Portal>
            <Dialog.Backdrop
                className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            />
            <Dialog.Popup
                data-slot="dialog-content"
                className={twMerge(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
                <Dialog.Close
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    aria-label="Close"
                >
                    <X className="size-4" />
                </Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    )
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={twMerge("flex flex-col space-y-1.5 text-center sm:text-left", className)}
            {...props}
        />
    )
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={twMerge("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
            {...props}
        />
    )
}

export function DialogTitle({ className, ...props }: Dialog.Title.Props) {
    return (
        <Dialog.Title
            {...props}
            className={(state) =>
                twMerge(
                    "text-lg font-semibold leading-none tracking-tight",
                    typeof className === 'function' ? className(state) : className
                )
            }
        />
    )
}

export function DialogDescription({ className, ...props }: Dialog.Description.Props) {
    return (
        <Dialog.Description
            {...props}
            className={(state) =>
                twMerge(
                    "text-sm text-muted-foreground",
                    typeof className === 'function' ? className(state) : className
                )
            }
        />
    )
}

export {
    DialogRoot as Dialog,
}

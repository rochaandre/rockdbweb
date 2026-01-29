import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { twMerge } from 'tailwind-merge'
import { type ComponentProps, useState } from 'react'

export interface ContextMenuProps {
    children: React.ReactNode
    trigger: React.ReactNode
}

export function ContextMenu({ children, trigger }: ContextMenuProps) {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setPosition({ x: e.clientX, y: e.clientY })
        setOpen(true)
    }

    // Virtual anchor compatible with Floating UI / Base UI
    const virtualAnchor = {
        getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            x: position.x,
            y: position.y,
            top: position.y,
            left: position.x,
            right: position.x,
            bottom: position.y,
            toJSON: () => { }
        })
    }

    return (
        <MenuPrimitive.Root open={open} onOpenChange={setOpen}>
            <div onContextMenu={handleContextMenu} className="contents">
                {trigger}
            </div>

            <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner
                    anchor={virtualAnchor}
                    side="right"
                    align="start"
                    sideOffset={0}
                >
                    <MenuPrimitive.Popup
                        className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    >
                        {children}
                    </MenuPrimitive.Popup>
                </MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
        </MenuPrimitive.Root>
    )
}

export function ContextMenuItem({ className, ...props }: ComponentProps<typeof MenuPrimitive.Item>) {
    return (
        <MenuPrimitive.Item
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none focus:bg-primary focus:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    userClass
                )
            }}
        />
    )
}

export function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof MenuPrimitive.Separator>) {
    return (
        <MenuPrimitive.Separator
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge("-mx-1 my-1 h-px bg-border", userClass)
            }}
        />
    )
}

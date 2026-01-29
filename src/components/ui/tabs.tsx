import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge('flex flex-col gap-2', userClass)
            }}
        />
    )
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge(
                    'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
                    userClass
                )
            }}
        />
    )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Tab>) {
    return (
        <TabsPrimitive.Tab
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    'data-[selected]:bg-surface data-[selected]:text-foreground data-[selected]:shadow-sm',
                    'cursor-pointer',
                    userClass
                )
            }}
        />
    )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Panel>) {
    return (
        <TabsPrimitive.Panel
            {...props}
            className={(state) => {
                const userClass = typeof className === 'function' ? className(state) : className
                return twMerge(
                    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    userClass
                )
            }}
        />
    )
}

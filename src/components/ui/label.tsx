import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export function Label({ className, ...props }: ComponentProps<'label'>) {
    return (
        <label
            className={twMerge(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
}

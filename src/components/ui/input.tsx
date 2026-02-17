import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export interface InputProps extends ComponentProps<'input'> { }

export function Input({ className, type = "text", ...props }: InputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={twMerge(
                'flex h-7 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    )
}

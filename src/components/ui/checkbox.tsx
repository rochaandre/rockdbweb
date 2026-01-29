import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
    label?: string
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
    // If no ID provided and label exists, generate a random one or require usage of ID. 
    // For simplicity here, assuming user provides ID if label is needed or wraps in label.

    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id={id}
                data-slot="checkbox"
                className={twMerge(
                    'peer size-4 shrink-0 rounded border border-input shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    'accent-primary cursor-pointer',
                    // Note: Standard accent-color is easiest for modern browsers. 
                    // For custom styling we would hide appearance-none and use bg-image/svg. 
                    // Given "Tailwind v4", we can rely on accent-* or custom implementation.
                    // Let's use a robust custom implementation with appearance-none for better consistency
                    'appearance-none bg-surface checked:bg-primary checked:border-primary',
                    'checked:[background-image:url("data:image/svg+xml,%3csvg%20viewBox=%270%200%2016%2016%27%20fill=%27white%27%20xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath%20d=%27M12.207%204.793a1%201%200%200%201%200%201.414l-5%205a1%201%200%200%201-1.414%200l-2-2a1%201%200%200%201%201.414-1.414L6.5%209.086l4.293-4.293a1%201%200%200%201%201.414%200z%27/%3e%3c/svg%3e")]',
                    'checked:[background-size:100%_100%] checked:[background-position:center]',
                    className
                )}
                {...props}
            />
            {label && (
                <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            )}
        </div>
    )
}

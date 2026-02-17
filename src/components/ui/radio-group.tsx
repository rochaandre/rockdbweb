import * as React from "react"
import { Circle } from "lucide-react"
import { twMerge } from "tailwind-merge"

const RadioGroupContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
} | undefined>(undefined)

export function RadioGroup({ className, value, onValueChange, ...props }: React.ComponentProps<"div"> & { value?: string, onValueChange?: (value: string) => void }) {
    return (
        <RadioGroupContext.Provider value={{ value, onValueChange }}>
            <div className={twMerge("grid gap-2", className)} {...props} />
        </RadioGroupContext.Provider>
    )
}

export function RadioGroupItem({ className, value, ...props }: React.ComponentProps<"button"> & { value: string }) {
    const context = React.useContext(RadioGroupContext)
    const checked = context?.value === value

    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => context?.onValueChange?.(value)}
            className={twMerge(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
                className
            )}
            {...props}
        >
            {checked && <Circle className="h-3 w-3 fill-current text-current" />}
        </button>
    )
}

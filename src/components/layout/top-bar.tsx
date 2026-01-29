import { Button } from "@/components/ui/button"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

// A simple hook for dark mode could be extracted, but keeping it inline for speed
function useDarkMode() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark'
        }
        return 'light' // Default to light
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    return { theme, toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light') }
}

export function TopBar() {
    const { theme, toggleTheme } = useDarkMode()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(true) // Mock login state

    return (
        <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                {/* Breadcrumbs or Title could go here */}
                <div className="font-semibold text-foreground flex items-center gap-2">
                    <div className="size-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs font-bold">R</div>
                    RockDB Manager
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground"
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <Moon className="size-5" /> : <Sun className="size-5" />}
                </Button>

                <div className="h-5 w-px bg-border mx-1" />

                {isLoggedIn ? (
                    <MenuPrimitive.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                        <MenuPrimitive.Trigger className="flex items-center gap-2 outline-none cursor-pointer">
                            <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                AR
                            </div>
                        </MenuPrimitive.Trigger>
                        <MenuPrimitive.Portal>
                            <MenuPrimitive.Positioner side="bottom" align="end" sideOffset={5}>
                                <MenuPrimitive.Popup className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                    <div className="px-2 py-1.5 text-sm font-semibold border-b border-border mb-1">
                                        Andre Rocha
                                        <div className="text-xs font-normal text-muted-foreground">andre@example.com</div>
                                    </div>
                                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                        <User className="mr-2 size-4" />
                                        Profile
                                    </div>
                                    <div
                                        onClick={() => setIsLoggedIn(false)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive/10 text-destructive focus:bg-destructive/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log out
                                    </div>
                                </MenuPrimitive.Popup>
                            </MenuPrimitive.Positioner>
                        </MenuPrimitive.Portal>
                    </MenuPrimitive.Root>
                ) : (
                    <Button size="sm" onClick={() => setIsLoggedIn(true)}>Login</Button>
                )}
            </div>
        </header>
    )
}

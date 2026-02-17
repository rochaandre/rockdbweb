import { MainLayout } from "@/components/layout/main-layout"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export function SettingsView() {
    return (
        <MainLayout>
            <div className="p-6 max-w-2xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your application preferences.</p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">General</h2>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="auto-refresh" defaultChecked />
                        <label
                            htmlFor="auto-refresh"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Auto-refresh session data
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                        Sessions view will refresh every 5 seconds by default.
                    </p>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="notifications" />
                        <label
                            htmlFor="notifications"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Enable Desktop Notifications
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Appearance</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-border rounded-md p-4 bg-white text-slate-900 text-center text-sm font-medium">
                            Light
                        </div>
                        <div className="border border-border rounded-md p-4 bg-slate-950 text-white text-center text-sm font-medium">
                            Dark
                        </div>
                        <div className="border border-primary ring-2 ring-primary rounded-md p-4 bg-slate-900 text-white text-center text-sm font-medium">
                            System
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button>Save Preferences</Button>
                </div>

            </div>
        </MainLayout>
    )
}

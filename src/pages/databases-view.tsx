import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Database, Plus } from "lucide-react"

export function DatabasesView() {
    const connections = [
        { name: "Oracle PROD (19c)", host: "db-prod-01", type: "PROD", status: "Connected" },
        { name: "Oracle DEV (21c)", host: "db-dev-01", type: "DEV", status: "Offline" },
        { name: "Reporting DB", host: "db-rep-01", type: "TEST", status: "Online" },
    ]

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
                    <Button className="gap-2">
                        <Plus className="size-4" />
                        New Connection
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {connections.map((conn) => (
                        <Card key={conn.name} className="cursor-pointer hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {conn.type}
                                </CardTitle>
                                <Database className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{conn.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Host: {conn.host}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className={`flex h-2 w-2 rounded-full ${conn.status === 'Connected' ? 'bg-green-500' : conn.status === 'Online' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <span className="text-sm font-medium">{conn.status}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}

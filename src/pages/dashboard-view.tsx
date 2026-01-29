import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, Database, Server, AlertTriangle } from "lucide-react"

export function DashboardView() {
    const stats = [
        { title: "Total Sessions", value: "1,240", icon: Activity, change: "+5% from last hour" },
        { title: "Active Databases", value: "8", icon: Database, change: "All systems operational" },
        { title: "CPU Utilization", value: "45%", icon: Server, change: "Normal load" },
        { title: "Blocking Chains", value: "3", icon: AlertTriangle, change: "Requires attention", color: "text-red-500" },
    ]

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`size-4 text-muted-foreground ${stat.color || ''}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                Chart Mockup Area
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Mock Alerts */}
                                <div className="flex items-center">
                                    <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2" />
                                    <div className="ml-2 space-y-1">
                                        <p className="text-sm font-medium leading-none">Blocking Chain detected</p>
                                        <p className="text-xs text-muted-foreground">PROD_DB - 2 mins ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                                    <div className="ml-2 space-y-1">
                                        <p className="text-sm font-medium leading-none">High CPU Usage</p>
                                        <p className="text-xs text-muted-foreground">REPORT_DB - 15 mins ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

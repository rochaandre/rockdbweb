
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// --- Helper Component ---

function ChartCard({ title, data, total }: { title: string, data: any[], total: string | number }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+15px)] text-center pointer-events-none">
                        <div className="text-2xl font-bold tracking-tighter">{total}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function SystemHealthCharts({ health }: { health: any }) {
    if (!health) return null

    const dataObjects = [
        { name: "Valid", value: health.objects?.VALID || 0, color: "#22c55e" },
        { name: "Invalid", value: health.objects?.INVALID || 0, color: "#ef4444" },
    ]

    const dataCursors = [
        { name: "Used", value: health.cursors || 0, color: "#3b82f6" },
        { name: "Capacity", value: 1000 - (health.cursors || 0), color: "#e5e7eb" },
    ]

    const dataTriggers = [
        { name: "Enabled", value: health.triggers?.ENABLED || 0, color: "#22c55e" },
        { name: "Disabled", value: health.triggers?.DISABLED || 0, color: "#f59e0b" },
    ]

    const dataAlerts = [
        { name: "Critical", value: 0, color: "#ef4444" },
        { name: "Warning", value: 0, color: "#f59e0b" },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ChartCard title="Database Objects" data={dataObjects} total={(health.objects?.VALID || 0) + (health.objects?.INVALID || 0)} />
            <ChartCard title="Open Cursors" data={dataCursors} total={health.cursors || 0} />
            <ChartCard title="System Triggers" data={dataTriggers} total={(health.triggers?.ENABLED || 0) + (health.triggers?.DISABLED || 0)} />
            <ChartCard title="Outstanding Alerts" data={dataAlerts} total={0} />
        </div>
    )
}

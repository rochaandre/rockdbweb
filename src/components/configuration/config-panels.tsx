import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Search, Server, Cpu, HardDrive, Database } from 'lucide-react'
import { HOST_INFO, RESOURCE_LIMITS, DB_PROPERTIES, LOCAL_DISK_INFO } from './config-data'
import { cn } from "@/lib/utils"

// --- Host Info ---
export function HostInfoPanel() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hostname & Platform</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate" title={HOST_INFO.hostname}>{HOST_INFO.hostname}</div>
                    <p className="text-xs text-muted-foreground">{HOST_INFO.platform_name}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPU & Memory</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{HOST_INFO.num_cpus} CPUs</div>
                    <p className="text-xs text-muted-foreground">{HOST_INFO.phys_memory} Physical RAM</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{HOST_INFO.uptime}</div>
                    <p className="text-xs text-muted-foreground">{HOST_INFO.os_kernel}</p>
                </CardContent>
            </Card>

            <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
                    <CardTitle className="text-sm font-medium">Database Properties</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {DB_PROPERTIES.map((prop, i) => (
                        <div key={i} className="flex flex-col space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{prop.name}</span>
                            <span className="text-sm font-bold break-words">{prop.value}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
                    <CardTitle className="text-sm font-medium">Local Disk Information</CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {LOCAL_DISK_INFO.map((disk, i) => (
                            <div key={i} className="flex flex-col gap-2 p-3 border border-border rounded-md bg-muted/10">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">{disk.name}</span>
                                    <Badge variant={disk.pct > 80 ? "destructive" : "secondary"}>{disk.type}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">{disk.path}</div>
                                <div className="space-y-1 mt-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Used: {disk.used}</span>
                                        <span className="font-semibold">{disk.free} Free</span>
                                    </div>
                                    <Progress value={disk.pct} className={cn("h-2", disk.pct > 80 ? "bg-red-200" : "")} />
                                    <div className="flex justify-end text-[10px] text-muted-foreground">
                                        Total: {disk.size}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div >
    )
}

// --- Parameters Panel ---
export function ParametersPanel({ filterType = 'ALL', parameters }: { filterType?: 'ALL' | 'MEMORY' | 'ALTERED', parameters: any[] }) {
    const [search, setSearch] = useState('')

    const filteredParams = parameters.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        if (filterType === 'MEMORY') {
            return p.name.includes('sga') || p.name.includes('pga') || p.name.includes('memory')
        }
        if (filterType === 'ALTERED') {
            return p.ismodified === 'MODIFIED'
        }
        return true
    })

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search parameters..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 rounded-md border border-border bg-surface overflow-auto">
                <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/20 px-4 py-2 text-xs font-semibold text-muted-foreground sticky top-0 backdrop-blur-sm">
                    <div className="col-span-2">Name</div>
                    <div>Value</div>
                    <div>Default</div>
                    <div>Dynamic</div>
                    <div>Modified</div>
                </div>
                {filteredParams.map((p) => (
                    <div key={p.num} className="grid grid-cols-6 gap-4 border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                        <div className="col-span-2 font-mono text-xs">{p.name}</div>
                        <div className="truncate" title={p.display_value}>{p.display_value}</div>
                        <div>{p.isdefault === 'TRUE' ? 'Yes' : 'No'}</div>
                        <div>{p.issys_modifiable}</div>
                        <div>
                            <Badge variant={p.ismodified === 'MODIFIED' ? 'secondary' : 'outline'} className="text-[10px] h-5">
                                {p.ismodified}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Resource Limits Panel ---
export function ResourceLimitsPanel() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {RESOURCE_LIMITS.map(r => {
                    const pct = (r.current_utilization / r.max_utilization) * 100
                    const isHigh = pct > 80
                    return (
                        <Card key={r.resource_name} className={isHigh ? "border-amber-500/50 bg-amber-500/5" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider">{r.resource_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{r.current_utilization} / {r.limit_value}</div>
                                <Progress value={pct} className="h-2 mt-2" />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="rounded-md border border-border bg-surface">
                <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    v$resource_limit Details
                </div>
                <div className="grid grid-cols-5 gap-4 border-b border-border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                    <div className="col-span-2">Resource Name</div>
                    <div>Current Util</div>
                    <div>Max Util</div>
                    <div>Limit</div>
                </div>
                {RESOURCE_LIMITS.map((r, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 border-b border-border p-3 text-sm last:border-0 hover:bg-muted/30 items-center">
                        <div className="col-span-2 font-mono text-xs text-muted-foreground">{r.resource_name}</div>
                        <div>{r.current_utilization}</div>
                        <div>{r.max_utilization}</div>
                        <div>{r.limit_value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

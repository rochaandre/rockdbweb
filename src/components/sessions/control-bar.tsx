import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Pause, Play, RefreshCw, Filter, Settings, Search, Server, AlertTriangle, Activity } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { twMerge } from "tailwind-merge"

export interface FilterState {
    active: boolean
    blocking: boolean
    system: boolean
    inactive: boolean
    waiting: boolean
    user: boolean
    background: boolean
    parallel: boolean
    killed: boolean
}

export interface FilterCounts {
    active: number
    blocking: number
    system: number
    inactive: number
    waiting: number
    user: number
    background: number
    parallel: number
    killed: number
    zombies: number
}

interface ControlBarProps {
    filters: FilterState
    counts: FilterCounts
    isPaused: boolean
    refreshInterval: number
    onFilterChange: (key: keyof FilterState, checked: boolean) => void
    onPauseToggle: () => void
    onUpdate: () => void
    selectedInstance?: string
    onInstanceChange?: (val: string) => void
    onSearch?: (val: string) => void
    onSettings?: () => void
    onIntervalChange: (val: number) => void
    instances?: any[]
    isLoading?: boolean
    searchQuery?: string
    totalSessions?: number
    filteredCount?: number
}

export function ControlBar({
    filters,
    counts,
    isPaused,
    refreshInterval,
    onFilterChange,
    onPauseToggle,
    onUpdate,
    onIntervalChange,
    onSearch,
    onSettings,
    selectedInstance = "both",
    onInstanceChange,
    instances = [],
    isLoading = false,
    searchQuery = "",
    totalSessions = 0,
    filteredCount = 0
}: ControlBarProps) {
    return (
        <div className="flex shrink-0 flex-col gap-3 bg-surface/50 backdrop-blur-md p-3 border-b border-border/40 shadow-sm relative z-20">
            {/* Main Action Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1 rounded-xl bg-muted/30 border border-border/20 shadow-inner">
                        <Button
                            variant="primary"
                            size="sm"
                            className={twMerge(
                                "h-8 px-4 gap-2 font-black uppercase text-[10px] tracking-widest transition-all",
                                isLoading ? "opacity-90 shadow-none" : "shadow-lg shadow-primary/20"
                            )}
                            onClick={onUpdate}
                            disabled={isLoading}
                        >
                            <RefreshCw className={twMerge("size-3.5", isLoading && "animate-spin")} />
                            {isLoading ? 'Updating...' : 'Update View'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-4 gap-2 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
                            onClick={onPauseToggle}
                        >
                            {isPaused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-border/30 mx-2" />

                    <div className="flex items-center gap-3 bg-muted/20 px-3 py-1 rounded-lg border border-border/20">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                            <Activity className="size-3" /> Interval
                        </label>
                        <div className="relative group">
                            <Input
                                type="number"
                                min={1}
                                className="h-7 w-20 text-center bg-surface/40 border-border/30 focus:border-primary/50 font-mono font-bold text-xs rounded-md shadow-inner transition-all group-hover:bg-surface/60"
                                value={refreshInterval}
                                onChange={(e) => onIntervalChange(Number(e.target.value))}
                            />
                            <span className="absolute right-2 top-1.5 text-[9px] font-black text-muted-foreground/40 pointer-events-none">SEC</span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-border/30 mx-2" />

                    <div className="flex items-center gap-3 bg-muted/20 px-3 py-1 rounded-lg border border-border/20">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                            <Server className="size-3" /> Instance
                        </label>
                        <Select value={selectedInstance} onValueChange={onInstanceChange}>
                            <SelectTrigger className="h-7 w-[130px] text-[11px] font-bold bg-surface/40 border-border/30 focus:ring-0 focus:border-primary/50 shadow-inner rounded-md">
                                <SelectValue placeholder="All Instances" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface/90 backdrop-blur-xl border-border/40 shadow-2xl">
                                <SelectItem value="both" className="text-xs font-bold">Cluster (All Nodes)</SelectItem>
                                {instances.map((inst: any) => (
                                    <SelectItem key={inst.inst_id} value={inst.inst_id.toString()} className="text-xs">
                                        Instance {inst.inst_id} ({inst.instance_name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find SID, User, SQL, Program..."
                            value={searchQuery}
                            className="h-8 min-w-[250px] pl-8 bg-muted/20 border-border/20 focus:bg-surface/40 focus:border-primary/30 text-xs font-medium placeholder:italic rounded-xl transition-all"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col items-end min-w-[80px] bg-muted/20 px-3 py-0.5 rounded-lg border border-border/10">
                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Sessions</span>
                        <span className="text-xs font-mono font-bold text-primary">
                            {filteredCount} <span className="text-muted-foreground/40 font-normal">/ {totalSessions}</span>
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                        onClick={onSettings}
                    >
                        <Settings className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Filter Dashboard Row - Reorganized into Grid */}
            <div className="flex items-start gap-4 pt-1 overflow-visible">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 h-fit">
                    <Filter className="size-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flow</span>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-2 px-4 py-2 rounded-xl bg-surface/40 border border-border/30 shadow-sm backdrop-blur-sm ring-1 ring-white/5">
                    {[
                        { id: 'active', label: 'Active', color: 'text-emerald-600', countId: 'active' },
                        { id: 'blocking', label: 'Blocking', color: 'text-rose-600', countId: 'blocking' },
                        { id: 'system', label: 'System', color: 'text-purple-600', countId: 'system' },
                        { id: 'inactive', label: 'Inactive', color: 'text-slate-500', countId: 'inactive' },
                        { id: 'waiting', label: 'Waiting', color: 'text-orange-600', countId: 'waiting' },
                        { id: 'user', label: 'User', color: 'text-blue-600', countId: 'user' },
                        { id: 'background', label: 'Background', color: 'text-indigo-600', countId: 'background' },
                        { id: 'parallel', label: 'Parallel', color: 'text-amber-600', countId: 'parallel' },
                        { id: 'killed', label: 'Killed', color: 'text-rose-600', countId: 'killed' }
                    ].map((f) => (
                        <div key={f.id} className="flex items-center gap-3 group">
                            <Checkbox
                                id={`filter-${f.id}`}
                                checked={filters[f.id as keyof FilterState]}
                                onChange={(e) => onFilterChange(f.id as keyof FilterState, e.target.checked)}
                                className={twMerge(
                                    "size-3.5 border-border/40",
                                    f.id === 'active' && "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
                                    f.id === 'killed' && "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500",
                                    f.id === 'blocking' && "data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                )}
                            />
                            <label htmlFor={`filter-${f.id}`} className={twMerge(
                                "text-[11px] font-bold cursor-pointer select-none transition-all flex items-center gap-1.5 flex-1",
                                filters[f.id as keyof FilterState] ? f.color : "text-muted-foreground/60 hover:text-muted-foreground"
                            )}>
                                <span className="tracking-tight uppercase">{f.label}</span>
                                <div className="flex-1 border-b border-dotted border-border/20 mx-1 mb-0.5 opacity-30" />
                                <span className="font-mono text-[10px] min-w-[20px] text-right">{counts[f.countId as keyof FilterCounts]}</span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 group hover:bg-orange-500/20 transition-all cursor-help" title="Possible zombie sessions detected">
                        <AlertTriangle className="size-3 text-orange-600 animate-pulse" />
                        <span className="text-[10px] font-black text-orange-700 tracking-tight uppercase flex items-center gap-1.5">
                            {counts.zombies} Zombies
                        </span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 bg-muted/5 px-3 py-1.5 rounded-xl border border-border/10">
                        <Activity className="size-3 text-emerald-500/60" /> Online
                    </div>
                </div>
            </div>
        </div>
    )
}

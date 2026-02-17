import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Pause, Play, RefreshCw, Filter, Settings, Search, Skull, Split, Server } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface FilterState {
    active: boolean
    inactive: boolean
    background: boolean
    killed: boolean
    parallel: boolean
}

export interface FilterCounts {
    active: number
    inactive: number
    background: number
    killed: number
    parallel: number
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
    onSearch?: () => void
    onSettings?: () => void
    onIntervalChange: (val: number) => void
    instances?: any[]
    isLoading?: boolean
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
    isLoading = false
}: ControlBarProps) {
    return (
        <div className="flex shrink-0 flex-col gap-2 bg-gradient-to-r from-gray-50 to-gray-100 p-2 border-b border-border shadow-sm">
            {/* Top Row: Actions and Refresh */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="primary"
                        className="h-7 gap-1 bg-green-600 hover:bg-green-700 text-white border-green-700 shadow-sm"
                        onClick={onUpdate}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 gap-1 bg-white border border-border shadow-sm hover:bg-gray-50"
                        onClick={onPauseToggle}
                    >
                        {isPaused ? <Play className="size-3.5 text-gray-600" /> : <Pause className="size-3.5 text-gray-600" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                </div>

                <div className="h-5 w-px bg-border mx-1" />

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Refresh Rate:</label>
                    <div className="relative">
                        <Input
                            type="number"
                            min={1}
                            className="h-7 w-16 text-right pr-6 bg-white shadow-sm"
                            value={refreshInterval}
                            onChange={(e) => onIntervalChange(Number(e.target.value))}
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">s</span>
                    </div>
                </div>

                <div className="h-5 w-px bg-border mx-1" />

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                        <Server className="size-3" /> Instance:
                    </label>
                    <Select value={selectedInstance} onValueChange={onInstanceChange}>
                        <SelectTrigger className="h-7 w-[100px] text-xs bg-white shadow-sm">
                            <SelectValue placeholder="All Nodes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="both">All Instances</SelectItem>
                            {instances.map((inst: any) => (
                                <SelectItem key={inst.inst_id} value={inst.inst_id.toString()}>
                                    Node {inst.inst_id} ({inst.instance_name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1" />

                <div className="flex gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={onSearch}
                    >
                        <Search className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={onSettings}
                    >
                        <Settings className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Filters */}
            <div className="flex items-center gap-4 px-1">
                <div className="flex items-center gap-2 rounded-md bg-white border border-border px-2 py-1 shadow-sm overflow-x-auto">
                    <Filter className="size-3.5 text-muted-foreground mr-1 shrink-0" />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                            id="active"
                            checked={filters.active}
                            onChange={(e) => onFilterChange('active', e.target.checked)}
                        />
                        <label htmlFor="active" className="text-xs cursor-pointer select-none">
                            {counts.active} Active
                        </label>
                    </div>

                    <div className="h-3 w-px bg-border mx-1 shrink-0" />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                            id="inactive"
                            checked={filters.inactive}
                            onChange={(e) => onFilterChange('inactive', e.target.checked)}
                        />
                        <label htmlFor="inactive" className="text-xs cursor-pointer select-none">
                            {counts.inactive} Inactive
                        </label>
                    </div>

                    <div className="h-3 w-px bg-border mx-1 shrink-0" />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                            id="background"
                            checked={filters.background}
                            onChange={(e) => onFilterChange('background', e.target.checked)}
                        />
                        <label htmlFor="background" className="text-xs cursor-pointer select-none">
                            {counts.background} Background
                        </label>
                    </div>

                    <div className="h-3 w-px bg-border mx-1 shrink-0" />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                            id="killed"
                            checked={filters.killed}
                            onChange={(e) => onFilterChange('killed', e.target.checked)}
                        />
                        <Skull className="size-3 text-muted-foreground" />
                        <label htmlFor="killed" className="text-xs cursor-pointer select-none">
                            {counts.killed} Killed
                        </label>
                    </div>

                    <div className="h-3 w-px bg-border mx-1 shrink-0" />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Checkbox
                            id="parallel"
                            checked={filters.parallel}
                            onChange={(e) => onFilterChange('parallel', e.target.checked)}
                        />
                        <Split className="size-3 text-muted-foreground" />
                        <label htmlFor="parallel" className="text-xs cursor-pointer select-none">
                            {counts.parallel} Parallel
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

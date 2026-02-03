
import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from "@/components/ui/checkbox"
import { useParams } from 'react-router-dom'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"

const MOCK_STATS_DATA = [
    { name: 'Execs', value: 3.8, perSec: 0.01, perExec: null },
    { name: 'Disk Reads', value: null, perSec: null, perExec: null },
    { name: 'Buffer Gets', value: 19.930, perSec: 67, perExec: 5.214 },
    { name: 'Rows Processed', value: 3.8, perSec: 0.01, perExec: 1.0 },
]

const MOCK_CHART_DATA = [
    { time: '19:25', value: 1.5, type: 'cpu' },
    { time: '19:30', value: 0.8, type: 'cpu' },
    { time: '19:35', value: 0.2, type: 'cpu' },
    { time: '19:40', value: 0, type: 'cpu' },
    { time: '19:45', value: 0.5, type: 'wait' },
    { time: '19:50', value: 1.2, type: 'wait' },
    { time: '19:55', value: 2.8, type: 'cpu' },
    { time: '20:00', value: 3.5, type: 'cpu' },
    { time: '20:05', value: 0.2, type: 'cpu' },
    { time: '20:30', value: 0.5, type: 'cpu' },
    { time: '20:35', value: 1.8, type: 'wait' },
    { time: '20:40', value: 3.2, type: 'cpu' },
    { time: '20:45', value: 2.5, type: 'cpu' },
    { time: '20:50', value: 1.5, type: 'cpu' },
]

export function SqlDetailsView() {
    const { sqlId } = useParams()

    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-2 p-2 bg-muted/20">
                {/* Header / Top Bar */}
                <div className="flex items-center gap-2 bg-surface p-1 border border-border rounded-sm text-xs">
                    <Tabs defaultValue="delta" className="w-[200px]">
                        <TabsList className="h-6">
                            <TabsTrigger value="delta" className="h-5 text-[10px]">Delta</TabsTrigger>
                            <TabsTrigger value="cumulative" className="h-5 text-[10px]">Cumulative</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-1 flex-1 font-mono bg-white border border-input px-2 h-6 overflow-hidden whitespace-nowrap">
                        <span className="font-bold text-slate-700">SQL_ID:</span> {sqlId || 'g0tvjmy0cnms3'} <span className="font-bold ml-2">Child:</span> 0 <span className="text-muted-foreground ml-2">SELECT COUNT(HIST_SUBS_PAC...)</span>
                    </div>
                </div>

                {/* Top Section: Stats Grid */}
                <Card className="rounded-sm border-border shadow-sm">
                    <CardHeader className="p-2 py-1 border-b border-border bg-muted/30">
                        <CardTitle className="text-xs font-semibold">SQL Stats Delta. Last five minutes.</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto">
                        <div className="grid grid-cols-4 gap-4 p-2 text-xs">
                            {/* Column 1 */}
                            <div className="space-y-1">
                                {MOCK_STATS_DATA.map(stat => (
                                    <div key={stat.name} className="flex justify-between border-b border-dashed border-border/50 pb-0.5">
                                        <span className="font-bold text-right w-24">{stat.name}:</span>
                                        <span className="font-mono">{stat.value ?? ''}</span>
                                        <span className="font-mono text-muted-foreground">{stat.perSec ? `${stat.perSec}/s` : ''}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Column 2 */}
                            <div className="space-y-1">
                                <div className="flex justify-between border-b border-dashed border-border/50 pb-0.5">
                                    <span className="font-bold text-right w-24">CPU Time:</span>
                                    <span className="font-mono">0.55</span>
                                    <span className="font-mono text-muted-foreground">0.19%</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-border/50 pb-0.5">
                                    <span className="font-bold text-right w-24">Elapsed Time:</span>
                                    <span className="font-mono">0.55</span>
                                    <span className="font-mono text-muted-foreground">0.19%</span>
                                </div>
                            </div>
                            {/* Column 3 */}
                            <div className="space-y-1">
                                <div className="flex justify-between border-b border-dashed border-border/50 pb-0.5">
                                    <span className="font-bold text-right w-24">Parse Calls:</span>
                                    <span className="font-mono">1.8</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-border/50 pb-0.5">
                                    <span className="font-bold text-right w-24">Sorts:</span>
                                    <span className="font-mono"></span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Middle: Charts */}
                <Card className="flex-1 min-h-[200px] flex flex-col rounded-sm border-border shadow-sm">
                    <CardHeader className="p-2 py-1 border-b border-border bg-muted/30 flex flex-row justify-between items-center h-8">
                        <CardTitle className="text-xs font-semibold">SQL Activity - ELAPSED_TIME</CardTitle>
                        <div className="text-[10px] text-muted-foreground">Avg = 0.99</div>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 flex gap-2">
                        <div className="flex-1 h-full min-h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend/Checks */}
                        <div className="w-40 border-l border-border pl-2 space-y-0.5 overflow-auto text-[10px]">
                            {['Execs', 'Disk Reads', 'Buffer Gets', 'CPU Time', 'Elapsed Time'].map(item => (
                                <div key={item} className="flex items-center gap-1.5">
                                    <Checkbox id={item} className="h-3 w-3 rounded-[2px]" checked={item === 'Elapsed Time'} />
                                    <label htmlFor={item} className="leading-none cursor-pointer">{item}</label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom: Tabs (ASH, etc) */}
                <div className="h-1/3 min-h-[200px] flex flex-col bg-surface border border-border rounded-sm shadow-sm">
                    <Tabs defaultValue="active_sessions" className="flex flex-col h-full">
                        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2">
                            <TabsList className="h-7 bg-transparent p-0">
                                <TabsTrigger value="summary" className="h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2">Summ</TabsTrigger>
                                <TabsTrigger value="history" className="h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2">Hist</TabsTrigger>
                                <TabsTrigger value="active_sessions" className="h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2">Wait Events</TabsTrigger>
                            </TabsList>
                            <span className="text-[10px] text-muted-foreground mr-2">{sqlId || 'g0tvjmy0cnms3'} / 35555082078</span>
                        </div>

                        <TabsContent value="active_sessions" className="flex-1 p-0 m-0 overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted/20 sticky top-0">
                                    <TableRow className="h-6 text-[10px]">
                                        <TableHead className="h-6">TimeStamp</TableHead>
                                        <TableHead className="h-6">SID</TableHead>
                                        <TableHead className="h-6">State</TableHead>
                                        <TableHead className="h-6">Event</TableHead>
                                        <TableHead className="h-6">Machine</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3, 4].map(i => (
                                        <TableRow key={i} className="h-6 text-[10px] hover:bg-muted/50">
                                            <TableCell className="p-1">21:05:28.45</TableCell>
                                            <TableCell className="p-1 font-mono text-purple-600">1633</TableCell>
                                            <TableCell className="p-1">On CPU</TableCell>
                                            <TableCell className="p-1 text-muted-foreground">-</TableCell>
                                            <TableCell className="p-1">srvinsgcbm02</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    )
}

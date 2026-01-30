import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

// Mock Data for the Plan
interface PlanNode {
    id: number
    operation: string
    objectName: string
    cost: string
    cardinality: string
    bytes: string
    cpuCost: string
    time: string
    children?: PlanNode[]
}

const MOCK_PLAN_DATA: PlanNode[] = [
    {
        id: 0,
        operation: 'UPDATE STATEMENT',
        objectName: '',
        cost: '3',
        cardinality: '1',
        bytes: '0.03 KB',
        cpuCost: '0%',
        time: '',
        children: [
            {
                id: 1,
                operation: 'UPDATE',
                objectName: 'DBAMV.ITCOLETA_SINAL_VITAL',
                cost: '3',
                cardinality: '1',
                bytes: '0.03 KB',
                cpuCost: '0%',
                time: '1.0sec',
                children: [
                    {
                        id: 2,
                        operation: 'INDEX (unique scan)',
                        objectName: 'DBAMV.ITCOLETA_SV_PK',
                        cost: '2',
                        cardinality: '1',
                        bytes: '0.03 KB',
                        cpuCost: '0%',
                        time: '1.0sec'
                    }
                ]
            }
        ]
    }
]

// Recursive Tree Row Component
function PlanRow({ node, level = 0 }: { node: PlanNode, level?: number }) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <>
            <TableRow className="hover:bg-muted/50 text-xs">
                <TableCell className="p-1 pl-2 font-mono" style={{ paddingLeft: `${level * 20 + 8}px` }}>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground w-4 text-right inline-block mr-1">{node.id}</span>
                        {node.children && node.children.length > 0 ? (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 hover:bg-muted rounded">
                                {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                            </button>
                        ) : <span className="w-4" />}
                        <span className={node.children ? "font-semibold" : ""}>{node.operation}</span>
                    </div>
                </TableCell>
                <TableCell className="p-1 font-mono">{node.objectName}</TableCell>
                <TableCell className="p-1 font-mono text-right">{node.cost}</TableCell>
                <TableCell className="p-1 font-mono text-right">{node.cardinality}</TableCell>
                <TableCell className="p-1 font-mono text-right">{node.bytes}</TableCell>
                <TableCell className="p-1 font-mono text-right">{node.cpuCost}</TableCell>
                <TableCell className="p-1 font-mono text-right">{node.time}</TableCell>
            </TableRow>
            {isExpanded && node.children?.map(child => (
                <PlanRow key={child.id} node={child} level={level + 1} />
            ))}
        </>
    )
}

export function ExplainPlanView() {
    const { sqlId } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [currentSchema, setCurrentSchema] = useState('ACESSOPRD')
    const [sqlText, setSqlText] = useState(`UPDATE dbamv.ITCOLETA_SINAL_VITAL
SET VALOR = :1, 
    TP_LANCAMENTO = :2,
    CD_UNIDADE_AFERICAO = :3,
    CD_INSTRUMENTO_AFERICAO = :4
WHERE CD_COLETA_SINAL_VITAL = :5
  AND CD_SINAL_VITAL = :6`)

    const handleExplain = () => {
        setIsLoading(true)
        // Mock refresh delay
        setTimeout(() => {
            setIsLoading(false)
        }, 800)
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-surface">
                {/* Header Controls */}
                <div className="border-b border-border bg-muted/20 p-2 space-y-2 text-sm">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap font-semibold text-xs">Current Schema:</Label>
                            <Input
                                className="h-7 w-32 bg-white"
                                value={currentSchema}
                                onChange={e => setCurrentSchema(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 border-l border-border pl-4">
                                <Checkbox id="cost" defaultChecked />
                                <Label htmlFor="cost" className="font-normal">Cost</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Checkbox id="dist" />
                                <Label htmlFor="dist" className="font-normal">Distribution</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Checkbox id="pred" defaultChecked />
                                <Label htmlFor="pred" className="font-normal">Predicates</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Checkbox id="proj" />
                                <Label htmlFor="proj" className="font-normal">Projections</Label>
                            </div>
                        </div>

                        <div className="flex-1" />

                        <Button size="sm" className="h-7 px-4" onClick={handleExplain} disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Explain'}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap font-semibold text-xs text-muted-foreground">No other plans</Label>
                            <Select defaultValue="828086266">
                                <SelectTrigger className="h-7 w-32 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-foreground border-border">
                                    <SelectItem value="828086266">828086266</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 border-l border-border pl-4">
                                <Checkbox id="exec" />
                                <Label htmlFor="exec" className="font-normal">Exec Stats</Label>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold">Source:</span>
                                <span className="font-mono">V$SQL_PLAN</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold">SQL ID:</span>
                                <span
                                    className="font-mono text-blue-600 underline cursor-pointer hover:text-blue-800"
                                    onClick={() => navigate(`/sql-details/${sqlId || '6s7wvpx05xk4m'}`)}
                                >
                                    {sqlId || '6s7wvpx05xk4m'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Split (Using simple flex for now) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top: SQL Text */}
                    <div className="h-1/3 border-b border-border bg-white p-0 overflow-auto relative group">
                        <textarea
                            className="w-full h-full p-4 font-mono text-xs resize-none focus:outline-none text-foreground"
                            value={sqlText}
                            onChange={e => setSqlText(e.target.value)}
                        />
                    </div>

                    {/* Bottom: Plan Tree */}
                    <div className="flex-1 overflow-auto bg-white">
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                <TableRow className="h-8">
                                    <TableHead className="h-8 w-[400px]">Operation</TableHead>
                                    <TableHead className="h-8 w-[300px]">Object</TableHead>
                                    <TableHead className="h-8 text-right w-24">Cost</TableHead>
                                    <TableHead className="h-8 text-right w-24">Rows</TableHead>
                                    <TableHead className="h-8 text-right w-24">Bytes</TableHead>
                                    <TableHead className="h-8 text-right w-24">CPU</TableHead>
                                    <TableHead className="h-8 text-right w-24">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_PLAN_DATA.map(node => (
                                    <PlanRow key={node.id} node={node} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer/Predicate Section imitation */}
                    <div className="h-24 border-t border-border bg-muted/10 p-2 overflow-auto font-mono text-xs text-muted-foreground">
                        <div className="font-semibold mb-1 text-slate-700">Predicates:</div>
                        <div className="pl-4">
                            2 - access("CD_COLETA_SINAL_VITAL"=:5 AND "CD_SINAL_VITAL"=:6)
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

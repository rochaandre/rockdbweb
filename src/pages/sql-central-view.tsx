
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useParams } from 'react-router-dom'
import {
    Folder,
    FileText,
    Play,
    Square,
    SkipBack,
    SkipForward,
    Save,
    RotateCcw,
    Database
} from 'lucide-react'
import { MOCK_FILE_SYSTEM, type ScriptNode } from '@/data/mock-scripts'
import { cn } from '@/lib/utils'

// Tree Item Component
function FileTreeItem({ node, level, onSelect, selectedId }: {
    node: ScriptNode
    level: number
    onSelect: (node: ScriptNode) => void
    selectedId?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = node.id === selectedId

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 text-sm cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap",
                    isSelected && "bg-muted text-primary font-medium"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => {
                    if (hasChildren) setIsOpen(!isOpen)
                    else onSelect(node)
                }}
            >
                {hasChildren ? (
                    isOpen ? <Folder className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <Folder className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                    <FileText className="h-4 w-4 text-blue-500" />
                )}
                <span>{node.name}</span>
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.children!.map(child => (
                        <FileTreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export function SqlCentralView() {
    const { sqlId } = useParams()

    const [selectedScript, setSelectedScript] = useState<ScriptNode | null>(null)
    const [editorContent, setEditorContent] = useState('')
    const [activeTab, setActiveTab] = useState('grid')

    // Handle SQL ID param
    useEffect(() => {
        if (sqlId) {
            // Find template script
            const template = MOCK_FILE_SYSTEM.find(n => n.id === 'sql_area')?.children?.find(c => c.id === 'sql_details_template')
            if (template && template.content) {
                setSelectedScript(template)
                setEditorContent(template.content.replace(/:sql_id/g, sqlId))
            }
        }
    }, [sqlId])

    const handleScriptSelect = (node: ScriptNode) => {
        setSelectedScript(node)
        if (node.content) {
            // If explicit SQL ID is present in URL, replace placeholders even if manually selected (optional behavior, primarily for demo)
            if (sqlId) {
                setEditorContent(node.content.replace(/:sql_id/g, sqlId))
            } else {
                setEditorContent(node.content)
            }
        } else {
            setEditorContent('')
        }
    }

    return (
        <MainLayout>
            <div className="flex h-full flex-col bg-surface">
                {/* Top Header */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Database className="h-3 w-3" />
                        <span className="font-semibold text-foreground">SYSTEM@CDBPRD - 290</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>SCH: SYSTEM</span>
                        <span>USR: SYSTEM</span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1 border-b border-border bg-surface">
                    <div className="flex items-center border-r border-border pr-1 mr-1 gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Execute (F8)">
                            <Play className="h-4 w-4 fill-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Break">
                            <Square className="h-4 w-4 fill-red-600" />
                        </Button>
                    </div>
                    <div className="flex items-center border-r border-border pr-1 mr-1 gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Previous SQL">
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Next SQL">
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Commit">
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Rollback">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Main Split Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Pane: Tree */}
                    <div className="w-64 border-r border-border flex flex-col bg-muted/5">
                        <div className="p-2 border-b border-border flex gap-1">
                            {/* Small toolbar for tree could go here */}
                            <Input className="h-6 text-xs" placeholder="Search..." />
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="py-2">
                                {MOCK_FILE_SYSTEM.map(node => (
                                    <FileTreeItem
                                        key={node.id}
                                        node={node}
                                        level={0}
                                        onSelect={handleScriptSelect}
                                        selectedId={selectedScript?.id}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Pane: Editor & Results */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs for Editor/Log */}
                        <div className="flex border-b border-border bg-muted/10">
                            <button className="px-3 py-1 text-xs font-medium border-b-2 border-primary bg-background">SQL Editor</button>
                            <button className="px-3 py-1 text-xs font-medium text-muted-foreground border-b-2 border-transparent">Log</button>
                            <button className="px-3 py-1 text-xs font-medium text-muted-foreground border-b-2 border-transparent">Page Properties</button>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 border-b border-border relative bg-white">
                            {/* Simple line numbers + textarea simulation */}
                            <div className="absolute inset-0 flex">
                                <div className="w-10 bg-muted/20 border-r border-border text-right pr-2 pt-2 text-xs text-muted-foreground select-none font-mono">
                                    {editorContent.split('\n').map((_, i) => (
                                        <div key={i} className="leading-5">{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    className="flex-1 resize-none p-2 font-mono text-xs focus:outline-none leading-5 text-blue-900"
                                    value={editorContent}
                                    onChange={e => setEditorContent(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        {/* Bottom Results */}
                        <div className="h-1/3 min-h-[150px] flex flex-col bg-surface">
                            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 h-8">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                                    <TabsList className="h-full bg-transparent p-0">
                                        <TabsTrigger value="grid" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2 shadow-none">Grid</TabsTrigger>
                                        <TabsTrigger value="text" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2 shadow-none">Text</TabsTrigger>
                                        <TabsTrigger value="exec_stat" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-2 shadow-none">SQL Exec Stat</TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Checkbox id="exec" defaultChecked />
                                        <Label htmlFor="exec" className="font-normal">Exec Stat</Label>
                                    </div>
                                    <div className="text-muted-foreground">Last SQL: n/a</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {activeTab === 'grid' && (
                                    <Table>
                                        <TableBody>
                                            <TableRow className="h-6 hover:bg-transparent">
                                                <TableCell className="p-1 bg-muted/20 font-semibold text-xs border-r w-8 text-center">{''}</TableCell>
                                                <TableCell className="p-1 bg-muted/20 font-semibold text-xs border-r">SYSDATE</TableCell>
                                            </TableRow>
                                            <TableRow className="h-6 text-xs hover:bg-muted/50">
                                                <TableCell className="p-1 bg-muted/20 text-center text-muted-foreground border-r">1</TableCell>
                                                <TableCell className="p-1 font-mono text-blue-700">1/29/2026 21:10:23</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

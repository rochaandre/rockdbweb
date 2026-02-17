
import { useState, useEffect, useMemo, useRef } from 'react'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from "@/components/ui/input"
import { useSearchParams, useParams } from 'react-router-dom'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table'
import { API_URL, useApp } from '@/context/app-context'
import {
    Terminal,
    Table as TableIcon,
    Plus,
    X,
    FolderPlus,
    Database,
    ChevronRight,
    ChevronDown,
    PieChart as PieIcon,
    BarChart2 as BarIcon,
    Activity as GaugeIcon,
    FileText,
    Play,
    Square,
    Save,
    RotateCcw,
    Trash2,
    Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PieChartView, BarChartView, LineChartView, GaugeChartView } from '@/components/sql/sql-charts'

// Types
interface SqlScript {
    id: number
    name: string
    link_label: string
    link_url: string
    icon_url: string
    codmenutype: number
    type_name: string
    type_icon: string
}

interface TreeNode {
    id: string
    name: string
    type: 'folder' | 'file'
    icon?: string
    children?: TreeNode[]
    script?: SqlScript
}

// Helper to build tree from registry
function buildTree(scripts: SqlScript[]): TreeNode[] {
    const root: TreeNode[] = []

    scripts.forEach(script => {
        const parts = script.link_url.split('/')
        let currentLevel = root

        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1
            const existing = currentLevel.find(n => n.name === part)

            if (existing) {
                if (!isLast && existing.children) {
                    currentLevel = existing.children
                }
            } else {
                const newNode: TreeNode = {
                    id: isLast ? `script-${script.id}` : `folder-${script.link_url}-${index}`,
                    name: isLast ? script.link_label : part,
                    type: isLast ? 'file' : 'folder',
                    icon: isLast ? script.type_icon : undefined,
                    children: isLast ? undefined : [],
                    script: isLast ? script : undefined
                }
                currentLevel.push(newNode)
                if (!isLast && newNode.children) {
                    currentLevel = newNode.children
                }
            }
        })
    })

    return root
}

// Tree Item Component
function FileTreeItem({ node, level, onSelect, selectedId, onAddScript, onDeleteScript }: {
    node: TreeNode
    level: number
    onSelect: (node: TreeNode) => void
    selectedId?: string
    onAddScript: (folderPath: string) => void
    onDeleteScript: (rel_path: string) => void
}) {
    const [isOpen, setIsOpen] = useState(level < 1) // Open first level by default
    const hasChildren = node.type === 'folder' && node.children && node.children.length > 0
    const isSelected = node.id === selectedId

    const getIcon = () => {
        if (node.type === 'folder') {
            return isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
        }
        // File icons based on type_icon or codmenutype
        const iconName = node.icon || 'file'
        switch (iconName) {
            case 'pie-chart': return <PieIcon className="h-3.5 w-3.5 text-orange-500" />
            case 'bar-chart-2': return <BarIcon className="h-3.5 w-3.5 text-blue-500" />
            case 'gauge': return <GaugeIcon className="h-3.5 w-3.5 text-green-500" />
            case 'file-text': return <Terminal className="h-3.5 w-3.5 text-purple-500" />
            case 'monitor': return <Monitor className="h-3.5 w-3.5 text-cyan-500" />
            default: return <FileText className="h-3.5 w-3.5 text-slate-400" />
        }
    }

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 text-xs cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap group",
                    isSelected && "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => {
                    if (hasChildren) setIsOpen(!isOpen)
                    else onSelect(node)
                }}
            >
                {getIcon()}
                <span className="truncate flex-1">{node.name}</span>
                {node.type === 'folder' && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                        <button
                            className="p-0.5 hover:bg-primary/20 rounded transition-all text-primary"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Determine folder rel_path
                                const path = node.id.replace('folder-', '').replace(/-\d+$/, '')
                                onAddScript(path)
                            }}
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                )}
                {node.type === 'file' && node.script && (
                    <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 rounded transition-all text-destructive"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteScript(node.script!.link_url)
                        }}
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.children!.sort((a: TreeNode, b: TreeNode) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)).map((child: TreeNode) => (
                        <FileTreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            onAddScript={onAddScript}
                            onDeleteScript={onDeleteScript}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function NewScriptDialog({ folder, onOpenChange, onSuccess }: {
    folder: string
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}) {
    const [name, setName] = useState('')
    const [label, setLabel] = useState('')
    const [type, setType] = useState('1')
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch(`${API_URL}/sql/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder,
                    name,
                    label: label || name,
                    codmenutype: parseInt(type)
                })
            })
            if (res.ok) {
                onSuccess()
                onOpenChange(false)
            }
        } catch (err) {
            console.error('Failed to create script:', err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-96 bg-card border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-bold uppercase flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" /> New SQL Script
                    </h3>
                    <button onClick={() => onOpenChange(false)} className="hover:bg-muted p-1 rounded-md transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-70">Target Folder</Label>
                        <Input disabled value={folder} className="h-8 text-xs bg-muted/30" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="script-name" className="text-[10px] font-bold uppercase">Filename (.sql)</Label>
                        <Input
                            id="script-name"
                            placeholder="e.g. check_tablespace_usage"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-9 text-xs"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="script-label" className="text-[10px] font-bold uppercase">Display Label</Label>
                        <Input
                            id="script-label"
                            placeholder="e.g. Tablespace Usage Report"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            className="h-9 text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Script Type (Visualization)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: '1', label: 'Grid (Default)' },
                                { id: '2', label: 'Pie Chart' },
                                { id: '3', label: 'Bar Chart' },
                                { id: '4', label: 'Gauge' },
                                { id: '6', label: 'Line Chart' },
                                { id: '7', label: 'Plain Text' },
                                { id: '8', label: 'External Tool (SQLcl/RMAN/DGMGRL/SQLLDR)' }
                            ].map(t => (
                                <div key={t.id} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id={`type-${t.id}`}
                                        name="script-type"
                                        value={t.id}
                                        checked={type === t.id}
                                        onChange={e => setType(e.target.value)}
                                        className="h-3 w-3 accent-primary"
                                    />
                                    <Label htmlFor={`type-${t.id}`} className="text-[11px] cursor-pointer">{t.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 h-9 text-xs font-bold uppercase"
                            onClick={() => onOpenChange(false)}
                        > Cancel </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-9 text-xs font-bold uppercase"
                            disabled={isSaving || !name}
                        > {isSaving ? 'Creating...' : 'Create Script'} </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function SqlCentralView() {
    const { connection } = useApp()
    const [searchParams, setSearchParams] = useSearchParams()

    const [registry, setRegistry] = useState<SqlScript[]>([])
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
    const [editorContent, setEditorContent] = useState('')
    const [topTab, setTopTab] = usePersistentState('sql-central', 'topTab', 'editor')
    const [bottomTab, setBottomTab] = usePersistentState('sql-central', 'bottomTab', 'grid')
    const [execResults, setExecResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [autoExecute, setAutoExecute] = useState(false)
    const [autoCommit, setAutoCommit] = useState(false)
    const [showNewScript, setShowNewScript] = useState(false)
    const [newScriptFolder, setNewScriptFolder] = useState('root')
    const [toolOutput, setToolOutput] = useState<any>(null)
    const [contentSearchPaths, setContentSearchPaths] = useState<string[]>([])
    const { sqlId } = useParams()
    const hasAutoExecuted = useRef(false)

    const fetchRegistry = async () => {
        try {
            const res = await fetch(`${API_URL}/sql/registry`)
            const data = await res.json()
            setRegistry(data)
        } catch (err) {
            console.error('Error fetching registry:', err)
        }
    }

    // Fetch registry on mount
    useEffect(() => {
        fetchRegistry()
    }, [])

    // Content Search logic
    useEffect(() => {
        if (!searchQuery) {
            setContentSearchPaths([])
            return
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/sql/search?query=${encodeURIComponent(searchQuery)}`)
                const paths = await res.json()
                setContentSearchPaths(paths)
            } catch (err) {
                console.error('Content search failed:', err)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Check for URL parameters
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setNewScriptFolder('root')
            setShowNewScript(true)
            // Remove the param after using it
            const newParams = new URLSearchParams(searchParams)
            newParams.delete('new')
            setSearchParams(newParams, { replace: true })
        }
    }, [searchParams, setSearchParams])

    // Handle sqlId selection from URL
    useEffect(() => {
        if (sqlId && registry.length > 0 && !hasAutoExecuted.current) {
            const script = registry.find(s => s.name.toLowerCase() === sqlId.toLowerCase())
            if (script) {
                const node: TreeNode = {
                    id: `script-${script.id}`,
                    name: script.link_label,
                    type: 'file',
                    icon: script.type_icon,
                    script: script
                }
                handleScriptSelect(node, true)
                hasAutoExecuted.current = true
            }
        }
    }, [sqlId, registry])

    const tree = useMemo(() => {
        let filtered = registry
        // Removed tools type filter as it's moving to its own page

        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.link_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contentSearchPaths.includes(s.link_url)
            )
        }
        return buildTree(filtered)
    }, [registry, searchQuery, searchParams, contentSearchPaths])

    const handleScriptSelect = async (node: TreeNode, forceExecute = false) => {
        setSelectedNode(node)
        setExecResults([]) // Clear previous results
        setToolOutput(null)
        setBottomTab('grid') // Default to grid on new selection
        if (node.script) {
            try {
                const res = await fetch(`${API_URL}/sql/content?path=${encodeURIComponent(node.script.link_url)}`)
                const data = await res.json()
                const content = data.content || ''
                setEditorContent(content)

                if ((autoExecute || forceExecute) && content) {
                    // Extract query params for bind variables
                    const bindVars: Record<string, string> = {}
                    searchParams.forEach((value, key) => {
                        bindVars[key] = value
                    })
                    handleExecute(content, bindVars)
                }
            } catch (err) {
                console.error('Error fetching script content:', err)
            }
        }
    }

    const handleExecute = async (overrideContent?: string, bindVars?: Record<string, any>) => {
        const sql = typeof overrideContent === 'string' ? overrideContent : editorContent
        if (!sql.trim() || (!selectedNode?.script && topTab !== 'free-sql')) return

        setIsLoading(true)
        if (!overrideContent) {
            setExecResults([])
            setToolOutput(null)
        }

        try {
            if (selectedNode?.script?.codmenutype === 8) {
                // External Tool
                const res = await fetch(`${API_URL}/sql/execute_tool`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tool: selectedNode?.script?.name?.toLowerCase().includes('rman') ? 'rman' :
                            selectedNode?.script?.name?.toLowerCase().includes('dgmgrl') ? 'dgmgrl' :
                                selectedNode?.script?.name?.toLowerCase().includes('sqlldr') ? 'sqlldr' : 'sqlcl',
                        rel_path: selectedNode?.script?.link_url
                    })
                })
                const data = await res.json()
                setToolOutput(data)
                setBottomTab('console')
            } else {
                // Internal SQL
                const res = await fetch(`${API_URL}/sql/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sql_text: sql,
                        auto_commit: true,
                        bind_vars: bindVars
                    })
                })
                const data = await res.json()
                setExecResults(data)
            }
        } catch (err) {
            console.error('Execution failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteScript = async (path: string) => {
        if (!confirm('Are you sure you want to delete this script? This will remove the file from disk.')) return
        try {
            setIsLoading(true)
            const res = await fetch(`${API_URL}/sql/delete?path=${encodeURIComponent(path)}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchRegistry()
                if (selectedNode?.script?.link_url === path) {
                    setSelectedNode(null)
                    setEditorContent('')
                }
            }
        } catch (err) {
            console.error('Delete failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!selectedNode?.script || !editorContent) return
        try {
            setIsLoading(true)
            const res = await fetch(`${API_URL}/sql/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rel_path: selectedNode.script.link_url,
                    content: editorContent
                })
            })
            if (res.ok) {
                console.log('Script saved successfully')
            }
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const currentResult = execResults[0] // Simplify for now: show first result grid

    return (
        <MainLayout>
            <div className="flex h-full flex-col bg-surface overflow-hidden">
                {/* Top Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20 text-[11px] text-muted-foreground shrink-0">
                    <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-foreground uppercase">{connection.name} - {connection.host}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px]">{connection.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Schema: <span className="text-foreground font-medium">{connection.user}</span></span>
                        <span>DB Version: <span className="text-foreground font-medium">{connection.version || 'unknown'}</span></span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1 px-2 border-b border-border bg-background shrink-0 shadow-sm">
                    <div className="flex items-center border-r border-border pr-2 mr-1 gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleExecute()}
                            disabled={isLoading}
                        >
                            <Play className={cn("h-4 w-4 fill-green-600", isLoading && "animate-pulse")} />
                            <span className="text-xs font-semibold">Execute</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                            <Square className="h-4 w-4 fill-red-600" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            title="Save to Disk"
                            onClick={handleSave}
                            disabled={!selectedNode?.script || isLoading}
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Rollback">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 ml-4 px-3 border-l border-border">
                        <div className="flex items-center gap-1.5">
                            <Checkbox
                                id="autoExec"
                                checked={autoExecute}
                                onChange={(e) => setAutoExecute(e.target.checked)}
                            />
                            <Label htmlFor="autoExec" className="text-[10px] font-bold uppercase cursor-pointer">Auto Execute</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Checkbox
                                id="autoCommit"
                                checked={autoCommit}
                                onChange={(e) => setAutoCommit(e.target.checked)}
                            />
                            <Label htmlFor="autoCommit" className="text-[10px] font-bold uppercase cursor-pointer">Auto Commit</Label>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                        {selectedNode?.name && (
                            <span className="bg-muted px-2 py-0.5 rounded border border-border">{selectedNode.name}</span>
                        )}
                    </div>
                </div>

                {/* Main Split Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Pane: Tree */}
                    <div className="w-72 border-r border-border flex flex-col bg-muted/5 shrink-0">
                        <div className="p-2 border-b border-border bg-background flex items-center gap-2">
                            <Input
                                className="h-7 text-xs bg-muted/30 focus-visible:ring-1 flex-1"
                                placeholder="Filter scripts..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary hover:bg-primary/10"
                                onClick={() => {
                                    setNewScriptFolder('root')
                                    setShowNewScript(true)
                                }}
                                title="New Script in root"
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="py-2">
                                {tree.map(node => (
                                    <FileTreeItem
                                        key={node.id}
                                        node={node}
                                        level={0}
                                        onSelect={handleScriptSelect}
                                        onAddScript={(path) => {
                                            setNewScriptFolder(path)
                                            setShowNewScript(true)
                                        }}
                                        onDeleteScript={handleDeleteScript}
                                        selectedId={selectedNode?.id}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Pane: Editor & Results */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        {/* Tabs for Editor/Free SQL */}
                        <div className="flex border-b border-border bg-muted/5 shrink-0 h-9">
                            <Tabs value={topTab} onValueChange={setTopTab} className="h-full">
                                <TabsList className="h-full bg-transparent p-0 gap-1">
                                    <TabsTrigger
                                        value="editor"
                                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background text-[11px] font-bold uppercase px-4 shadow-none transition-all"
                                    >
                                        SQL Editor
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 border-b border-border relative bg-white overflow-hidden">
                            <div className="absolute inset-0 flex">
                                <div className="w-10 bg-muted/10 border-r border-border text-right pr-2 pt-2.5 text-[10px] text-muted-foreground select-none font-mono tracking-tighter shrink-0">
                                    {editorContent.split('\n').map((_, i) => (
                                        <div key={i} className="leading-5 h-5">{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    className="flex-1 resize-none p-2.5 font-mono text-[11px] focus:outline-none leading-5 text-slate-800 bg-transparent selection:bg-primary/20"
                                    value={editorContent}
                                    onChange={e => setEditorContent(e.target.value)}
                                    spellCheck={false}
                                    placeholder="Enter SQL here..."
                                />
                            </div>
                        </div>

                        {/* Bottom Results */}
                        <div className="h-1/2 min-h-[200px] flex flex-col bg-surface shadow-inner shrink-0 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-2 h-9 shrink-0">
                                <Tabs value={bottomTab} onValueChange={setBottomTab} className="h-full">
                                    <TabsList className="h-full bg-transparent p-0 gap-1">
                                        <TabsTrigger value="grid" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background/50 text-[10px] font-bold uppercase px-3 shadow-none gap-1.5 transition-all">
                                            <TableIcon className="h-3 w-3" /> Data Grid
                                        </TabsTrigger>
                                        {(selectedNode?.script?.codmenutype === 8 || toolOutput) && (
                                            <TabsTrigger value="console" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background/50 text-[10px] font-bold uppercase px-3 shadow-none gap-1.5 transition-all">
                                                <Monitor className="h-3 w-3" /> Console
                                            </TabsTrigger>
                                        )}
                                        {selectedNode?.script?.codmenutype === 2 && (
                                            <TabsTrigger value="pie" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background/50 text-[10px] font-bold uppercase px-3 shadow-none gap-1.5 transition-all">
                                                <PieIcon className="h-3 w-3" /> Pie Chart
                                            </TabsTrigger>
                                        )}
                                        {selectedNode?.script?.codmenutype === 3 && (
                                            <TabsTrigger value="bar" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background/50 text-[10px] font-bold uppercase px-3 shadow-none gap-1.5 transition-all">
                                                <BarIcon className="h-3 w-3" /> Bar Chart
                                            </TabsTrigger>
                                        )}
                                        {selectedNode?.script?.codmenutype === 4 && (
                                            <TabsTrigger value="gauge" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background/50 text-[10px] font-bold uppercase px-3 shadow-none gap-1.5 transition-all">
                                                <GaugeIcon className="h-3 w-3" /> Gauge
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground uppercase">
                                    {currentResult?.data?.length > 0 && (
                                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/20">{currentResult.data.length} rows fetched</span>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Checkbox id="exec" defaultChecked />
                                        <Label htmlFor="exec" className="font-semibold text-[10px]">Auto Stat</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                {bottomTab === 'grid' && (
                                    <div className="flex-1 overflow-auto bg-background">
                                        {currentResult?.type === 'grid' && (
                                            <Table className="border-collapse">
                                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                                    <TableRow className="h-8 hover:bg-transparent">
                                                        <TableHead className="w-10 text-center border-r p-0 text-[10px] font-bold">#</TableHead>
                                                        {Object.keys(currentResult.data[0] || {}).map(col => (
                                                            <TableHead key={col} className="p-2 border-r text-[10px] uppercase font-bold text-muted-foreground">{col}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentResult.data.map((row: any, i: number) => (
                                                        <TableRow key={i} className="h-7 text-[11px] hover:bg-muted/20 odd:bg-muted/5 transition-colors group">
                                                            <TableCell className="p-1 text-center text-[10px] font-mono text-muted-foreground border-r bg-muted/10 group-hover:bg-primary/5">{i + 1}</TableCell>
                                                            {Object.values(row).map((val: any, j: number) => (
                                                                <TableCell key={j} className="p-2 border-r font-mono whitespace-nowrap truncate max-w-[300px]" title={String(val)}>
                                                                    {String(val)}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                    {currentResult.data.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={100} className="p-8 text-center text-muted-foreground italic text-xs">No data to display. Execute a query to see results.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                        {currentResult?.type === 'message' && (
                                            <div className="p-4 font-mono text-xs text-green-700 bg-green-50/30 whitespace-pre-wrap flex items-start gap-2">
                                                <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                                                {currentResult.text}
                                            </div>
                                        )}
                                        {currentResult?.type === 'error' && (
                                            <div className="p-4 font-mono text-xs text-red-600 bg-red-50/30 whitespace-pre-wrap border-l-4 border-red-500">
                                                <div className="font-bold mb-1">Execution Error:</div>
                                                {currentResult.message}
                                            </div>
                                        )}
                                        {!currentResult && (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-50">
                                                <TableIcon className="h-10 w-10 text-muted/30" />
                                                <p className="text-xs uppercase tracking-widest font-medium">Ready for execution</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bottomTab === 'console' && (
                                    <div className="flex-1 flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                            <div className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
                                            <div className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            <div className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
                                        </div>
                                        <div className="flex h-6 items-center bg-slate-900/50 px-3 border-b border-white/5 shrink-0">
                                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Oracle Session Output</span>
                                        </div>
                                        <div className="flex-1 p-3 font-mono text-[11px] overflow-auto selection:bg-primary/30 leading-relaxed">
                                            {toolOutput ? (
                                                <div className="space-y-1">
                                                    {toolOutput.split('\n').map((line: string, i: number) => (
                                                        <div key={i} className="flex gap-3">
                                                            <span className="text-white/20 select-none text-[8px] w-4 text-right pt-0.5 italic">{i + 1}</span>
                                                            <span className={cn(
                                                                "white-space-pre-wrap break-all",
                                                                line.toLowerCase().includes('error') ? "text-red-400" : "text-slate-300"
                                                            )}>
                                                                {line || <br />}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                                                    <Monitor className="h-8 w-8" />
                                                    <span className="italic">Waiting for execution output...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className={cn("flex-1 bg-muted/5 p-4 overflow-auto", bottomTab === 'grid' && "hidden")}>
                                    <div className="max-w-4xl mx-auto h-full">
                                        {currentResult?.data?.length > 0 ? (
                                            <>
                                                {bottomTab === 'pie' && <PieChartView data={currentResult.data} />}
                                                {bottomTab === 'bar' && <BarChartView data={currentResult.data} />}
                                                {bottomTab === 'gauge' && <GaugeChartView data={currentResult.data} />}
                                                {bottomTab === 'line' && <LineChartView data={currentResult.data} />}
                                            </>
                                        ) : (
                                            <div className="h-full border border-dashed rounded-lg border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-xs italic">
                                                Select and execute a chart-enabled script to visualize data here.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showNewScript && (
                <NewScriptDialog
                    folder={newScriptFolder}
                    onOpenChange={setShowNewScript}
                    onSuccess={fetchRegistry}
                />
            )}
        </MainLayout>
    )
}

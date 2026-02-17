import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Play } from "lucide-react"

export interface DatabaseConnection {
    id: string
    name: string
    host: string
    port: string
    service: string
    username: string
    password?: string
    type: 'PROD' | 'DEV' | 'TEST'
    status: 'Connected' | 'Online' | 'Offline' | 'Connecting...'
    version?: string
    patch?: string
    os?: string
    db_type?: string
    role?: string
    apply_status?: string
    log_mode?: string
    is_rac?: boolean
    inst_name?: string
    connection_mode?: 'BASIC' | 'STRING'
    connection_role?: 'NORMAL' | 'SYSDBA' | 'SYSOPER' | 'SYSBACKUP' | 'SYSDG' | 'SYSKM'
    connect_string?: string
    wallet_path?: string
    tns_admin?: string
}

interface DatabaseFormProps {
    initialData?: DatabaseConnection
    onSave: (data: DatabaseConnection) => void
    onCancel: () => void
    onTest?: (data: DatabaseConnection) => void
    isTesting?: boolean
}

export function DatabaseForm({ initialData, onSave, onCancel, onTest, isTesting }: DatabaseFormProps) {
    const [formData, setFormData] = useState<Partial<DatabaseConnection>>({
        name: '',
        host: '',
        port: '1521',
        service: '',
        username: '',
        type: 'DEV',
        status: 'Offline',
        connection_mode: 'BASIC',
        connection_role: 'NORMAL',
        connect_string: '',
        wallet_path: '',
        tns_admin: '',
        ...initialData
    })

    const [availableRoles, setAvailableRoles] = useState<string[]>(['NORMAL'])

    // Fetch available Oracle roles from backend
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080' : ''
                const res = await fetch(`${API_URL}/api/config/oracle-roles`)
                if (res.ok) {
                    const roles = await res.json()
                    setAvailableRoles(roles)
                }
            } catch (err) {
                console.error("Failed to fetch Oracle roles:", err)
            }
        }
        fetchRoles()
    }, [])

    // Auto-generate TNS String when Name, Host, Port, Service or Wallet changes
    useEffect(() => {
        if (formData.host && formData.port && formData.service) {
            const protocol = formData.wallet_path ? 'TCPS' : 'TCP';
            const security = formData.wallet_path ? `(SECURITY=(MY_WALLET_DIRECTORY=${formData.wallet_path}))` : '';

            const suggestedTNS = `(DESCRIPTION=(ADDRESS=(PROTOCOL=${protocol})(HOST=${formData.host})(PORT=${formData.port}))${security}(CONNECT_DATA=(SERVICE_NAME=${formData.service})))`;

            // Always update the connection string automatically
            setFormData(prev => ({ ...prev, connect_string: suggestedTNS }));
        }
    }, [formData.name, formData.host, formData.port, formData.service, formData.wallet_path]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData as DatabaseConnection)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-2">
                {/* 1. Display Name (Full) */}
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. My Oracle DB" />
                </div>

                {/* 2. Environment / Mode (Same line) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Environment</Label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="PROD">Production</option>
                            <option value="DEV">Development</option>
                            <option value="TEST">Testing</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="connection_mode">Connection Mode</Label>
                        <select
                            id="connection_mode"
                            name="connection_mode"
                            value={formData.connection_mode}
                            onChange={handleChange}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                        >
                            <option value="BASIC">Direct (Host/Port/Service)</option>
                            <option value="STRING">TNS Connection String</option>
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4 mt-2">
                    {/* 3. Network Configuration (Host, Port, Service) - ALWAYS VISIBLE and MANDATORY */}
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Network Configuration</h4>
                    <div className="grid grid-cols-6 gap-4 mb-4">
                        <div className="col-span-3 space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input id="host" name="host" value={formData.host} onChange={handleChange} required placeholder="hostname or IP" />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input id="port" name="port" value={formData.port} onChange={handleChange} required placeholder="1521" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="service">Service Name</Label>
                            <Input id="service" name="service" value={formData.service} onChange={handleChange} required placeholder="ORCL" />
                        </div>
                    </div>

                    {/* 4. Connection String (The output of the fields above, but editable) */}
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="connect_string" className="text-blue-600 font-medium flex justify-between">
                            <span>Connection String (TNS)</span>
                            <span className="text-[10px] text-muted-foreground font-normal italic">Auto-generated from fields above</span>
                        </Label>
                        <textarea
                            id="connect_string"
                            name="connect_string"
                            value={formData.connect_string}
                            onChange={handleChange}
                            required
                            placeholder="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=...)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=...)))"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-[11px]"
                        />
                    </div>

                    {/* 5. TNS_ADMIN Path (Optional) */}
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="tns_admin">TNS_ADMIN Path (Optional - directory containing tnsnames.ora)</Label>
                        <Input
                            id="tns_admin"
                            name="tns_admin"
                            value={formData.tns_admin}
                            onChange={handleChange}
                            placeholder="/path/to/tns_admin_dir"
                            className="bg-slate-50 border-dashed"
                        />
                    </div>

                    {/* 6. Wallet Path (Always available but optional) */}
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="wallet_path" className="flex justify-between">
                            <span>Oracle Wallet Path (Optional)</span>
                            <span className="text-[10px] text-muted-foreground italic">Use /opt/rockdbweb/wallets for persistence</span>
                        </Label>
                        <Input
                            id="wallet_path"
                            name="wallet_path"
                            value={formData.wallet_path}
                            onChange={handleChange}
                            placeholder="/opt/rockdbweb/wallets"
                            className="bg-slate-50 border-dashed"
                        />
                    </div>
                </div>

                {/* 5. Username / Password */}
                <div className="border-t pt-4 mt-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={handleChange} />
                    </div>
                </div>

                {/* 6. Connect As (Role) */}
                <div className="space-y-2">
                    <Label htmlFor="connection_role" className="text-orange-600 font-semibold">Connect As (Role)</Label>
                    <select
                        id="connection_role"
                        name="connection_role"
                        value={formData.connection_role}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md border border-orange-200 bg-orange-50/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 font-medium"
                    >
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role.charAt(0) + role.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                {onTest && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                        onClick={() => onTest(formData as DatabaseConnection)}
                        disabled={isTesting}
                    >
                        {isTesting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Test Connection
                            </>
                        )}
                    </Button>
                )}
                <Button type="submit">Save Connection</Button>
            </div>
        </form>
    )
}

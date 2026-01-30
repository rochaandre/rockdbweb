import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
}

interface DatabaseFormProps {
    initialData?: DatabaseConnection
    onSave: (data: DatabaseConnection) => void
    onCancel: () => void
}

export function DatabaseForm({ initialData, onSave, onCancel }: DatabaseFormProps) {
    const [formData, setFormData] = useState<Partial<DatabaseConnection>>({
        name: '',
        host: '',
        port: '1521',
        service: '',
        username: '',
        type: 'DEV',
        status: 'Offline',
        ...initialData
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Basic validation could go here
        onSave(formData as DatabaseConnection)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. My Oracle DB" />
                    </div>
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input id="host" name="host" value={formData.host} onChange={handleChange} required placeholder="hostname or IP" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" name="port" value={formData.port} onChange={handleChange} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="service">Service Name / SID</Label>
                    <Input id="service" name="service" value={formData.service} onChange={handleChange} required placeholder="ORCL" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Connection</Button>
            </div>
        </form>
    )
}

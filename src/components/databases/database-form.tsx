/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: database-form.tsx
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 *
 * TERMS:
 * 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
 * 2. YOU MAY NOT MODIFY, transform, or build upon this code.
 * 3. You must maintain this header and original naming/ownership information.
 *
 * This software is provided "AS IS", without warranty of any kind.
 * Copyright (c) 2026 Andre Rocha. All rights reserved.
 * ==============================================================================
 */
import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Database,
    ShieldCheck,
    Globe,
    Server,
    Key,
    Info,
    ChevronRight,
    Monitor,
    CheckCircle2,
    AlertCircle,
    Activity,
    Box,
    Layout
} from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

export function DatabaseForm({
    initialData,
    onSubmit,
    onCancel,
    isTesting = false,
    testStatus = null
}: any) {
    const [formData, setFormData] = useState<any>({
        label: '',
        host: '',
        port: '1521',
        service_name: '',
        sid: '',
        username: '',
        password: '',
        is_sysdba: false,
        use_ssh: false,
        ssh_host: '',
        ssh_port: '22',
        ssh_user: '',
        ssh_key_path: ''
    })

    useEffect(() => {
        if (initialData) {
            setFormData({ ...formData, ...initialData })
        }
    }, [initialData])

    const handleChange = (e: any) => {
        const { id, value } = e.target
        setFormData((prev: any) => ({ ...prev, [id]: value }))
    }

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [id]: checked }))
    }

    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Database className="size-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight uppercase">Database Connection</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Configure Oracle database access parameters</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {/* General Information */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="size-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Identification</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Profile Name</Label>
                            <Input id="label" placeholder="e.g. Production Core" value={formData.label} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold focus:ring-primary/20" />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border/20" />

                {/* Database Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Server className="size-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Database Connectivity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="host" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hostname / IP</Label>
                            <Input id="host" placeholder="10.0.0.1" value={formData.host} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Port</Label>
                            <Input id="port" value={formData.port} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-mono font-bold" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="service_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Name</Label>
                            <Input id="service_name" placeholder="orclpdb1" value={formData.service_name} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sid" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SID (Optional)</Label>
                            <Input id="sid" placeholder="orcl" value={formData.sid} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border/20" />

                {/* Auth Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Key className="size-4 text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Authentication</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                            <Input id="username" placeholder="system" value={formData.username} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-muted/10 rounded-xl border border-border/20">
                        <Checkbox
                            id="is_sysdba"
                            checked={formData.is_sysdba}
                            onCheckedChange={(checked) => handleCheckboxChange('is_sysdba', !!checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="is_sysdba" className="text-xs font-black uppercase tracking-widest text-foreground cursor-pointer">SYSDBA Connection</label>
                            <p className="text-[9px] text-muted-foreground font-bold italic">Connect using administrative privileges (AS SYSDBA)</p>
                        </div>
                    </div>
                </div>

                {/* Optional SSH Tunneling removed here as requested in previous refactor */}
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => onSubmit(formData, true)}
                        className="h-10 px-6 gap-2 font-black uppercase text-[10px] tracking-widest border-border/50 hover:bg-muted"
                        disabled={isTesting}
                    >
                        {isTesting ? <Activity className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
                        Test Connection
                    </Button>

                    {testStatus && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${testStatus.success ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'} animate-in fade-in zoom-in duration-300`}>
                            {testStatus.success ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}
                            <span className="text-[10px] font-black uppercase tracking-tighter">{testStatus.message}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="h-10 px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit(formData)}
                        className="h-10 px-8 gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                    >
                        Save Configuration <ChevronRight className="size-3.5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

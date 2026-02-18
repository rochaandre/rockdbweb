/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: server-form.tsx
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Server, Key, ChevronRight, Info } from 'lucide-react'

export function ServerForm({ initialData, onSubmit, onCancel }: any) {
    const [formData, setFormData] = useState<any>({
        label: '',
        host: '',
        port: '22',
        username: '',
        password: '',
        key_path: ''
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

    return (
        <Card className="shadow-2xl border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/30 bg-muted/20 py-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Server className="size-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight uppercase">Server Configuration</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5 italic">Configure remote host SSH access details</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="size-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Host Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Friendly Name</Label>
                            <Input id="label" placeholder="e.g. Oracle PRD 01" value={formData.label} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="host" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hostname / IP</Label>
                                <Input id="host" placeholder="10.0.0.1" value={formData.host} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SSH Port</Label>
                                <Input id="port" value={formData.port} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-mono font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border/20" />

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Key className="size-4 text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">SSH Credentials</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                            <Input id="username" placeholder="oracle" value={formData.username} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password (Optional)</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} className="h-10 bg-muted/20 border-border/40 font-bold" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key_path" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SSH Private Key Content / Path</Label>
                        <Textarea
                            id="key_path"
                            placeholder="Paste your private key content here or provide the file path..."
                            value={formData.key_path}
                            onChange={handleChange}
                            rows={8}
                            className="bg-muted/20 border-border/40 font-mono text-[11px] min-h-[160px]"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/30 p-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel} className="h-10 px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button onClick={() => onSubmit(formData)} className="h-10 px-8 gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                    Save Server <ChevronRight className="size-3.5" />
                </Button>
            </CardFooter>
        </Card>
    )
}

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
import { Server, ChevronRight, Info, Shield, ShieldCheck } from 'lucide-react'

interface ServerFormProps {
    initialData?: any
    onSubmit: (data: any) => void
    onCancel: () => void
}

export function ServerForm({ initialData, onSubmit, onCancel }: ServerFormProps) {
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
            setFormData({
                label: initialData.label || '',
                host: initialData.host || '',
                port: initialData.port || '22',
                username: initialData.username || '',
                password: initialData.password || '',
                key_path: initialData.key_path || ''
            })
        }
    }, [initialData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData((prev: any) => ({ ...prev, [id]: value }))
    }

    return (
        <Card className="shadow-2xl border-border/40 bg-surface/60 backdrop-blur-2xl overflow-hidden rounded-2xl ring-1 ring-white/10">
            <CardHeader className="border-b border-border/20 bg-primary/5 py-8">
                <div className="flex items-center gap-5">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner ring-1 ring-primary/20">
                        <Server className="size-7" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight uppercase bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Host Provisioning
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-1 flex items-center gap-1.5">
                            <Shield className="size-3" /> Secure Infrastructure Entry
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-10">
                {/* Network Layer */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5">
                        <div className="h-4 w-1 bg-primary rounded-full" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">Network Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Instance Label</Label>
                            <Input id="label" placeholder="e.g. Production Web-Node-01" value={formData.label} onChange={handleChange} className="h-11 bg-surface/50 border-border/30 focus:border-primary/50 font-bold px-4" />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3 space-y-2.5">
                                <Label htmlFor="host" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Hostname / IPv4</Label>
                                <Input id="host" placeholder="10.0.0.1" value={formData.host} onChange={handleChange} className="h-11 bg-surface/50 border-border/30 focus:border-primary/50 font-bold px-4" />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="port" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Port</Label>
                                <Input id="port" value={formData.port} onChange={handleChange} className="h-11 bg-surface/50 border-border/30 focus:border-primary/50 font-mono font-bold text-center" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

                {/* Security Layer */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-4 w-1 bg-amber-500 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">Access Identities</h3>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                            <ShieldCheck className="size-3 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase text-emerald-600/80 tracking-tighter">RSA/ED25519 Supported</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Provisioned User</Label>
                            <Input id="username" placeholder="oracle / root" value={formData.username} onChange={handleChange} className="h-11 bg-surface/50 border-border/30 focus:border-primary/50 font-bold px-4" />
                        </div>
                        <div className="space-y-2.5">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Passphrase (Optional)</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="h-11 bg-surface/50 border-border/30 focus:border-primary/50 font-bold px-4" />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center ml-1">
                            <Label htmlFor="key_path" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">SSH Private Key Material</Label>
                            <span className="text-[9px] font-bold text-muted-foreground/40 italic">PEM / OPENSSH FORMAT</span>
                        </div>
                        <Textarea
                            id="key_path"
                            placeholder="Paste your private key binary content or provide local filesystem path..."
                            value={formData.key_path}
                            onChange={handleChange}
                            rows={6}
                            className="bg-surface/50 border-border/30 focus:border-primary/40 font-mono text-[11px] min-h-[140px] p-4 leading-relaxed"
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-surface/80 border-t border-border/20 p-8 flex justify-between items-center">
                <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <Info className="size-3" /> All configurations are encrypted at rest
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onCancel} className="h-11 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-surface transition-all">
                        Cancel
                    </Button>
                    <Button onClick={() => onSubmit(formData)} className="h-11 px-10 gap-2 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary/30 rounded-xl">
                        Deploy Host <ChevronRight className="size-3.5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

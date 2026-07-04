'use client'

import React, { useState } from 'react'
import { X, Plus } from '@/components/ui/icons'
import { Project, ProjectStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const PROJECT_TYPES = ['Website', 'Web App', 'Mobile App', 'Landing Page', 'Logo / Branding', 'API / Backend', 'E-commerce', 'Other']
export const CLIENT_TYPES = ['Individual', 'Startup', 'Agency', 'Enterprise', 'Nonprofit']
export const SOURCES = ['Direct', 'Referral', 'Upwork', 'Fiverr', 'LinkedIn', 'Twitter / X', 'Cold Outreach', 'Other']
export const FIELD_PRESETS = ['Frontend', 'Backend', 'Fullstack', 'Design', 'UI/UX', 'DevOps', 'Mobile', 'Copywriting', 'SEO']
export const COLORS = ['#000000', '#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#ea580c', '#0891b2']
export const STATUSES: { value: ProjectStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
]

export type ProjectFormValues = Partial<Project>

/** Section heading with a trailing divider. */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <h3 className="shrink-0 text-sm font-medium text-foreground">{children}</h3>
            <Separator className="flex-1" />
        </div>
    )
}

export function ProjectFormModal({
    title,
    initial,
    submitLabel,
    onClose,
    onSubmit,
}: {
    title: string
    initial?: ProjectFormValues
    submitLabel: string
    onClose: () => void
    onSubmit: (values: ProjectFormValues) => Promise<void>
}) {
    const today = new Date().toISOString().split('T')[0]
    const [form, setForm] = useState<ProjectFormValues>({
        name: '', type: 'Website', fields: [], clientName: '', clientType: 'Individual',
        source: 'Direct', startedAt: today, deadline: '', prodUrl: '', githubUrl: '',
        notes: '', amount: 0, currency: '$', paid: false, color: '#2563eb', status: 'active',
        ...initial,
    })
    const [fieldInput, setFieldInput] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const set = (patch: ProjectFormValues) => setForm(prev => ({ ...prev, ...patch }))

    const addField = (raw: string) => {
        const f = raw.trim()
        if (!f) return
        if (!(form.fields || []).includes(f)) set({ fields: [...(form.fields || []), f] })
        setFieldInput('')
    }
    const removeField = (f: string) => set({ fields: (form.fields || []).filter(x => x !== f) })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await onSubmit({ ...form, amount: Number(form.amount) || 0 })
        } finally {
            setSubmitting(false)
        }
    }

    const presets = FIELD_PRESETS.filter(p => !(form.fields || []).includes(p))

    return (
        <Modal open onClose={onClose} size="lg" className="max-w-3xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader
                    title={title}
                    description="Project details, client, commercials and links."
                    onClose={onClose}
                />

                <ModalBody className="max-h-[70vh] space-y-8 overflow-y-auto">
                    {/* Basics */}
                    <section className="space-y-4">
                        <SectionTitle>Basics</SectionTitle>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project name</Label>
                                <Input id="name" required placeholder="e.g. Acme Store" value={form.name} onChange={e => set({ name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select id="type" value={form.type} onChange={e => set({ type: e.target.value })}>
                                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select id="status" value={form.status} onChange={e => set({ status: e.target.value as ProjectStatus })}>
                                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startedAt">Start date</Label>
                                <Input id="startedAt" type="date" value={form.startedAt} onChange={e => set({ startedAt: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline">Deadline (optional)</Label>
                                <Input id="deadline" type="date" value={form.deadline} onChange={e => set({ deadline: e.target.value })} />
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-2">
                            <Label>Fields / skill areas</Label>
                            {(form.fields || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {(form.fields || []).map(f => (
                                        <Badge key={f} variant="default" className="gap-1 pr-1">
                                            {f}
                                            <button
                                                type="button"
                                                onClick={() => removeField(f)}
                                                aria-label={`Remove ${f}`}
                                                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    value={fieldInput}
                                    onChange={e => setFieldInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(fieldInput) } }}
                                    placeholder="Type a field and press Enter"
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => addField(fieldInput)} aria-label="Add field">
                                    <Plus />
                                </Button>
                            </div>
                            {presets.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {presets.map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => addField(p)}
                                            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                                        >
                                            <Plus className="size-3" />
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme color */}
                        <div className="space-y-2">
                            <Label>Theme color</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => set({ color: c })}
                                        aria-label={`Select color ${c}`}
                                        className={cn(
                                            'size-8 rounded-full border transition-transform hover:scale-105',
                                            form.color === c
                                                ? 'scale-105 border-transparent ring-2 ring-ring ring-offset-2 ring-offset-card'
                                                : 'border-border'
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Client & Source */}
                    <section className="space-y-4">
                        <SectionTitle>Client &amp; Source</SectionTitle>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="clientName">Client name</Label>
                                <Input id="clientName" placeholder="e.g. Acme Inc" value={form.clientName} onChange={e => set({ clientName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientType">Client type</Label>
                                <Select id="clientType" value={form.clientType} onChange={e => set({ clientType: e.target.value })}>
                                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source">Source</Label>
                                <Select id="source" value={form.source} onChange={e => set({ source: e.target.value })}>
                                    {SOURCES.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* Commercials */}
                    <section className="space-y-4">
                        <SectionTitle>Commercials</SectionTitle>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" min="0" step="any" value={form.amount} onChange={e => set({ amount: e.target.value as any })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input id="currency" value={form.currency} onChange={e => set({ currency: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="paid">Base amount already paid</Label>
                                <p className="text-xs text-muted-foreground">Mark this if you&apos;ve received the base payment.</p>
                            </div>
                            <Switch id="paid" checked={!!form.paid} onCheckedChange={v => set({ paid: v })} aria-label="Base amount already paid" />
                        </div>
                    </section>

                    {/* Links & notes */}
                    <section className="space-y-4">
                        <SectionTitle>Links &amp; Notes</SectionTitle>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="prodUrl">Production URL</Label>
                                <Input id="prodUrl" placeholder="https://..." value={form.prodUrl} onChange={e => set({ prodUrl: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="githubUrl">GitHub URL</Label>
                                <Input id="githubUrl" placeholder="https://github.com/..." value={form.githubUrl} onChange={e => set({ githubUrl: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" rows={3} value={form.notes} onChange={e => set({ notes: e.target.value })} placeholder="Scope, terms, anything worth remembering..." />
                        </div>
                    </section>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={submitting || !form.name}>
                        {submitting ? 'Saving…' : submitLabel}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}

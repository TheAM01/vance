'use client'

import React, { useState } from 'react'
import { Contact, Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { COLORS } from '@/components/projects/project-form-modal'
import { RELATIONSHIP_PRESETS } from '@/lib/contacts'

export type ContactFormValues = Partial<Contact>

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <h3 className="shrink-0 text-sm font-medium text-foreground">{children}</h3>
            <Separator className="flex-1" />
        </div>
    )
}

export function ContactFormModal({
    title,
    initial,
    submitLabel,
    projects,
    onClose,
    onSubmit,
}: {
    title: string
    initial?: ContactFormValues
    submitLabel: string
    projects: Project[]
    onClose: () => void
    onSubmit: (values: ContactFormValues) => Promise<void>
}) {
    const [form, setForm] = useState<ContactFormValues>({
        name: '', email: '', phone: '', company: '', role: '', location: '',
        linkedin: '', website: '', source: '', relationship: '', description: '',
        color: '#2563eb', projectIds: [],
        ...initial,
    })
    const [submitting, setSubmitting] = useState(false)

    const set = (patch: ContactFormValues) => setForm(prev => ({ ...prev, ...patch }))

    const toggleProject = (id: string) => {
        const current = form.projectIds || []
        set({ projectIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id] })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name?.trim()) return
        setSubmitting(true)
        try {
            await onSubmit(form)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal open onClose={onClose} size="lg" className="max-w-3xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader title={title} description="People, clients and everyone worth remembering." onClose={onClose} />

                <ModalBody className="max-h-[70vh] space-y-8 overflow-y-auto">
                    {/* Basics */}
                    <section className="space-y-4">
                        <SectionTitle>Basics</SectionTitle>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" required placeholder="e.g. Tahseen Islam" value={form.name} onChange={e => set({ name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source">How you met / acquired them</Label>
                                <Input id="source" placeholder="e.g. Referral, Upwork, LinkedIn" value={form.source} onChange={e => set({ source: e.target.value })} />
                            </div>
                        </div>

                        {/* Relationship */}
                        <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {RELATIONSHIP_PRESETS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => set({ relationship: p })}
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                            (form.relationship || '').toLowerCase() === p.toLowerCase()
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <Input
                                id="relationship"
                                placeholder="…or type your own (e.g. “I don't like them”)"
                                value={form.relationship}
                                onChange={e => set({ relationship: e.target.value })}
                            />
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => set({ color: c })}
                                        aria-label={`Select color ${c}`}
                                        className={cn(
                                            'size-8 rounded-full border transition-transform hover:scale-105',
                                            form.color === c ? 'scale-105 border-transparent ring-2 ring-ring ring-offset-2 ring-offset-card' : 'border-border'
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact details */}
                    <section className="space-y-4">
                        <SectionTitle>Contact details</SectionTitle>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@company.com" value={form.email} onChange={e => set({ email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" placeholder="+1 555 000 0000" value={form.phone} onChange={e => set({ phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" placeholder="e.g. Acme Inc" value={form.company} onChange={e => set({ company: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role / title</Label>
                                <Input id="role" placeholder="e.g. Founder, CTO" value={form.role} onChange={e => set({ role: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" placeholder="e.g. Karachi, PK" value={form.location} onChange={e => set({ location: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input id="linkedin" placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={e => set({ linkedin: e.target.value })} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" placeholder="https://…" value={form.website} onChange={e => set({ website: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="space-y-4">
                        <SectionTitle>Projects</SectionTitle>
                        {projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No projects yet to associate.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {projects.map(p => {
                                    const selected = (form.projectIds || []).includes(p._id)
                                    return (
                                        <button
                                            key={p._id}
                                            type="button"
                                            onClick={() => toggleProject(p._id)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                                                selected
                                                    ? 'border-primary bg-primary/10 text-foreground'
                                                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                            )}
                                        >
                                            <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
                                            {p.name}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* Description */}
                    <section className="space-y-4">
                        <SectionTitle>Description</SectionTitle>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={e => set({ description: e.target.value })}
                            placeholder="Anything worth remembering — context, preferences, history…"
                        />
                    </section>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={submitting || !form.name?.trim()}>
                        {submitting ? 'Saving…' : submitLabel}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}

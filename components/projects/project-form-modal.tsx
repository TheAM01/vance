'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Project, ProjectStatus } from '@/lib/types'

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

const INPUT = 'w-full px-4 py-3 bg-background border-2 border-border rounded-sm focus:outline-none focus:border-foreground text-foreground transition-colors font-mono text-sm'
const LABEL = 'text-xs font-bold uppercase tracking-widest text-foreground'

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
                <div className="flex items-center justify-between p-6 border-b-2 border-border shrink-0">
                    <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={LABEL}>Project Name</label>
                            <input required placeholder="e.g. Acme Store" value={form.name} onChange={e => set({ name: e.target.value })} className={INPUT} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Type</label>
                            <select value={form.type} onChange={e => set({ type: e.target.value })} className={INPUT}>
                                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-2">
                        <label className={LABEL}>Fields / Skill Areas</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {(form.fields || []).map(f => (
                                <span key={f} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-foreground text-background">
                                    {f}
                                    <button type="button" onClick={() => removeField(f)}><X size={11} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={fieldInput}
                                onChange={e => setFieldInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(fieldInput) } }}
                                placeholder="Type a field and press Enter"
                                className={INPUT}
                            />
                            <button type="button" onClick={() => addField(fieldInput)} className="px-4 border-2 border-border hover:border-foreground transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {FIELD_PRESETS.filter(p => !(form.fields || []).includes(p)).map(p => (
                                <button key={p} type="button" onClick={() => addField(p)} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                                    + {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className={LABEL}>Client Name</label>
                            <input placeholder="e.g. Acme Inc" value={form.clientName} onChange={e => set({ clientName: e.target.value })} className={INPUT} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Client Type</label>
                            <select value={form.clientType} onChange={e => set({ clientType: e.target.value })} className={INPUT}>
                                {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Source</label>
                            <select value={form.source} onChange={e => set({ source: e.target.value })} className={INPUT}>
                                {SOURCES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={LABEL}>Start Date</label>
                            <input type="date" value={form.startedAt} onChange={e => set({ startedAt: e.target.value })} className={`${INPUT} min-h-[46px]`} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Deadline (optional)</label>
                            <input type="date" value={form.deadline} onChange={e => set({ deadline: e.target.value })} className={`${INPUT} min-h-[46px]`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className={LABEL}>Amount</label>
                            <input type="number" min="0" step="any" value={form.amount} onChange={e => set({ amount: e.target.value as any })} className={INPUT} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Currency</label>
                            <input value={form.currency} onChange={e => set({ currency: e.target.value })} className={INPUT} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>Status</label>
                            <select value={form.status} onChange={e => set({ status: e.target.value as ProjectStatus })} className={INPUT}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => set({ paid: !form.paid })}>
                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${form.paid ? 'bg-foreground border-foreground' : 'border-border group-hover:border-foreground'}`}>
                            {form.paid && <div className="w-2.5 h-2.5 bg-background" />}
                        </div>
                        <span className="text-xs uppercase font-black tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">Base amount already paid</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={LABEL}>Production URL</label>
                            <input placeholder="https://..." value={form.prodUrl} onChange={e => set({ prodUrl: e.target.value })} className={INPUT} />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL}>GitHub URL</label>
                            <input placeholder="https://github.com/..." value={form.githubUrl} onChange={e => set({ githubUrl: e.target.value })} className={INPUT} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={LABEL}>Theme Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => set({ color: c })}
                                    className={`h-11 w-11 rounded-sm border-2 transition-all ${form.color === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border/40 hover:scale-105'}`}
                                    style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={LABEL}>Notes</label>
                        <textarea rows={3} value={form.notes} onChange={e => set({ notes: e.target.value })} className={`${INPUT} resize-none`} placeholder="Scope, terms, anything worth remembering..." />
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t-2 border-border">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-sm text-foreground font-bold uppercase text-sm hover:bg-muted border-2 border-transparent transition-colors">Cancel</button>
                        <button type="submit" disabled={submitting || !form.name} className="px-6 py-2 rounded-sm border-2 border-foreground bg-foreground text-background uppercase font-bold text-sm tracking-wide hover:bg-background hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

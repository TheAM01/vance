'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, GitPullRequestArrow } from 'lucide-react'
import { Change, ChangeStatus } from '@/lib/types'
import { formatMoney } from '@/lib/format'

const STATUS_STYLE: Record<ChangeStatus, string> = {
    pending: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    'in-progress': 'text-blue-500 border-blue-500/30 bg-blue-500/10',
    done: 'text-green-500 border-green-500/30 bg-green-500/10',
}
const STATUS_LABEL: Record<ChangeStatus, string> = { pending: 'Pending', 'in-progress': 'In Progress', done: 'Done' }

const INPUT = 'w-full px-3 py-2 bg-background border-2 border-border rounded-sm focus:outline-none focus:border-foreground text-foreground transition-colors font-mono text-xs'

export function ChangeSection({ projectId, changes, currency, onChange }: { projectId: string; changes: Change[]; currency: string; onChange: () => void }) {
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const sorted = [...(changes || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
    const done = (changes || []).filter(c => c.completed).length
    const extra = (changes || []).reduce((s, c) => s + (Number(c.amount) || 0), 0)

    const nextTitle = `Change ${(changes?.length || 0) + 1}`

    const patchChange = async (changeId: string, patch: Partial<Change>) => {
        await fetch(`/api/projects/${projectId}/changes/${changeId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
        })
        onChange()
    }
    const deleteChange = async (changeId: string) => {
        if (!confirm('Delete this change?')) return
        await fetch(`/api/projects/${projectId}/changes/${changeId}`, { method: 'DELETE' })
        onChange()
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitPullRequestArrow size={16} className="text-muted-foreground" />
                    <h2 className="text-lg font-black uppercase tracking-tight">Changes</h2>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{done}/{changes?.length || 0}</span>
                    {extra > 0 && <span className="text-[10px] font-mono font-bold text-green-500">+{formatMoney(extra, currency)}</span>}
                </div>
                <button onClick={() => setAdding(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-colors">
                    <Plus size={13} /> Add Change
                </button>
            </div>

            {adding && (
                <ChangeForm
                    defaultTitle={nextTitle}
                    onCancel={() => setAdding(false)}
                    onSave={async (values) => {
                        await fetch(`/api/projects/${projectId}/changes`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
                        })
                        setAdding(false)
                        onChange()
                    }}
                />
            )}

            <div className="space-y-2">
                {sorted.length === 0 && !adding && (
                    <div className="p-8 text-center border-2 border-dashed border-border text-muted-foreground text-xs font-mono uppercase tracking-widest">
                        No change requests logged.
                    </div>
                )}

                {sorted.map(change => editingId === change._id ? (
                    <ChangeForm
                        key={change._id}
                        initial={change}
                        defaultTitle={change.title}
                        onCancel={() => setEditingId(null)}
                        onSave={async (values) => { await patchChange(change._id, values); setEditingId(null) }}
                    />
                ) : (
                    <div key={change._id} className={`flex items-start gap-3 p-3 border border-border bg-card group ${change.completed ? 'opacity-60' : ''}`}>
                        <button
                            onClick={() => patchChange(change._id, { completed: !change.completed })}
                            className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-colors ${change.completed ? 'bg-foreground border-foreground text-background' : 'border-border hover:border-foreground'}`}
                        >
                            {change.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold ${change.completed ? 'line-through' : ''}`}>{change.title}</div>
                            {change.description && <div className="text-xs text-muted-foreground font-mono mt-0.5">{change.description}</div>}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border ${STATUS_STYLE[change.status]}`}>
                                    {STATUS_LABEL[change.status]}
                                </span>
                                {change.amount ? (
                                    <span className="text-[9px] font-mono font-bold text-green-500">+{formatMoney(change.amount, currency)}</span>
                                ) : (
                                    <span className="text-[9px] font-mono font-bold text-muted-foreground">Free revision</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingId(change._id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => deleteChange(change._id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ChangeForm({ initial, defaultTitle, onSave, onCancel }: { initial?: Change; defaultTitle: string; onSave: (v: Partial<Change>) => Promise<void>; onCancel: () => void }) {
    const [title, setTitle] = useState(initial?.title || defaultTitle)
    const [description, setDescription] = useState(initial?.description || '')
    const [status, setStatus] = useState<ChangeStatus>(initial?.status || 'pending')
    const [amount, setAmount] = useState<number | ''>(initial?.amount ?? 0)
    const [saving, setSaving] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        setSaving(true)
        try {
            await onSave({ title: title.trim(), description, status, amount: Number(amount) || 0 })
        } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="p-4 border-2 border-foreground bg-card space-y-3">
            <input autoFocus placeholder="Change title" value={title} onChange={e => setTitle(e.target.value)} className={INPUT} />
            <input placeholder="What needs to change?" value={description} onChange={e => setDescription(e.target.value)} className={INPUT} />
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as ChangeStatus)} className={INPUT}>
                        <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Extra Charge</label>
                    <input type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className={INPUT} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"><X size={12} /> Cancel</button>
                <button type="submit" disabled={saving || !title.trim()} className="flex items-center gap-1 px-4 py-1.5 border-2 border-foreground bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-colors disabled:opacity-50">
                    <Check size={12} /> {saving ? 'Saving' : 'Save'}
                </button>
            </div>
        </form>
    )
}

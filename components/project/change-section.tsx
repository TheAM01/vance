'use client'

import { useId, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, GitPullRequestArrow } from '@/components/ui/icons'
import { Change, ChangeStatus } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/theme/settings-provider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'

const STATUS_VARIANT: Record<ChangeStatus, 'outline' | 'highlight' | 'success'> = {
    pending: 'outline',
    'in-progress': 'highlight',
    done: 'success',
}
const STATUS_LABEL: Record<ChangeStatus, string> = { pending: 'Pending', 'in-progress': 'In Progress', done: 'Done' }

export function ChangeSection({ projectId, changes, currency, onChange }: { projectId: string; changes: Change[]; currency: string; onChange: () => void }) {
    const { strikethroughCompleted } = useSettings()
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
        <Card>
            <CardHeader
                action={
                    <Button size="sm" onClick={() => setAdding(v => !v)}>
                        <Plus /> Add change
                    </Button>
                }
            >
                <CardTitle className="flex items-center gap-2">
                    <GitPullRequestArrow className="size-[18px] text-muted-foreground" />
                    Changes
                    <span className="text-sm font-normal tabular-nums text-muted-foreground">{done}/{changes?.length || 0}</span>
                    {extra > 0 && <span className="text-sm font-normal tabular-nums text-success">+{formatMoney(extra, currency)}</span>}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
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

                {sorted.length === 0 && !adding && (
                    <EmptyState
                        icon={GitPullRequestArrow}
                        title="No change requests"
                        description="Revision requests you log will show up here."
                        action={
                            <Button size="sm" onClick={() => setAdding(true)}>
                                <Plus /> Add change
                            </Button>
                        }
                    />
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
                    <div key={change._id} className="group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60">
                        <button
                            onClick={() => patchChange(change._id, { completed: !change.completed })}
                            className={cn(
                                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                change.completed ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'
                            )}
                        >
                            {change.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className={cn('text-sm font-medium text-foreground', change.completed && strikethroughCompleted && 'text-muted-foreground line-through')}>{change.title}</div>
                            {change.description && <div className="mt-0.5 text-xs text-muted-foreground">{change.description}</div>}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant={STATUS_VARIANT[change.status]}>{STATUS_LABEL[change.status]}</Badge>
                                {change.amount ? (
                                    <span className="text-xs font-medium tabular-nums text-success">+{formatMoney(change.amount, currency)}</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Free revision</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(change._id)}><Pencil /></Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteChange(change._id)}><Trash2 /></Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function ChangeForm({ initial, defaultTitle, onSave, onCancel }: { initial?: Change; defaultTitle: string; onSave: (v: Partial<Change>) => Promise<void>; onCancel: () => void }) {
    const uid = useId()
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
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
                <Label htmlFor={`${uid}-title`}>Title</Label>
                <Input id={`${uid}-title`} autoFocus placeholder="Change title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${uid}-desc`}>Description</Label>
                <Input id={`${uid}-desc`} placeholder="What needs to change?" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-status`}>Status</Label>
                    <Select id={`${uid}-status`} value={status} onChange={e => setStatus(e.target.value as ChangeStatus)}>
                        <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-amount`}>Extra charge</Label>
                    <Input id={`${uid}-amount`} type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X /> Cancel</Button>
                <Button type="submit" size="sm" disabled={saving || !title.trim()}><Check /> {saving ? 'Saving' : 'Save'}</Button>
            </div>
        </form>
    )
}

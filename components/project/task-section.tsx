'use client'

import { useId, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, Flag, Clock, CalendarClock, ListTodo } from '@/components/ui/icons'
import { Task, Priority, TaskStatus } from '@/lib/types'
import { parseDateLocal } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/theme/settings-provider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'

const PRIORITY_VARIANT: Record<Priority, 'destructive' | 'warning' | 'outline'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'outline',
}
const STATUS_VARIANT: Record<TaskStatus, 'outline' | 'highlight' | 'success'> = {
    todo: 'outline',
    'in-progress': 'highlight',
    done: 'success',
}
const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }

function fmtDate(d?: string) {
    if (!d) return null
    try { return parseDateLocal(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } catch { return d }
}

export function TaskSection({ projectId, tasks, onChange }: { projectId: string; tasks: Task[]; onChange: () => void }) {
    const { strikethroughCompleted } = useSettings()
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const sorted = [...(tasks || [])].sort((a, b) => {
        if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
        return (a.order || 0) - (b.order || 0)
    })

    const done = (tasks || []).filter(t => t.completed).length

    const patchTask = async (taskId: string, patch: Partial<Task>) => {
        await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
        })
        onChange()
    }
    const deleteTask = async (taskId: string) => {
        if (!confirm('Delete this task?')) return
        await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
        onChange()
    }

    return (
        <Card>
            <CardHeader
                action={
                    <Button size="sm" onClick={() => setAdding(v => !v)}>
                        <Plus /> Add task
                    </Button>
                }
            >
                <CardTitle className="flex items-center gap-2">
                    <ListTodo className="size-[18px] text-muted-foreground" />
                    Tasks
                    <span className="text-sm font-normal tabular-nums text-muted-foreground">{done}/{tasks?.length || 0}</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
                {adding && (
                    <TaskForm
                        onCancel={() => setAdding(false)}
                        onSave={async (values) => {
                            await fetch(`/api/projects/${projectId}/tasks`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
                            })
                            setAdding(false)
                            onChange()
                        }}
                    />
                )}

                {sorted.length === 0 && !adding && (
                    <EmptyState
                        icon={ListTodo}
                        title="No tasks yet"
                        description="Add the first thing to do on this project."
                        action={
                            <Button size="sm" onClick={() => setAdding(true)}>
                                <Plus /> Add task
                            </Button>
                        }
                    />
                )}

                {sorted.map(task => editingId === task._id ? (
                    <TaskForm
                        key={task._id}
                        initial={task}
                        onCancel={() => setEditingId(null)}
                        onSave={async (values) => { await patchTask(task._id, values); setEditingId(null) }}
                    />
                ) : (
                    <div key={task._id} className="group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60">
                        <button
                            onClick={() => patchTask(task._id, { completed: !task.completed })}
                            className={cn(
                                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                task.completed ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'
                            )}
                        >
                            {task.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className={cn('text-sm font-medium text-foreground', task.completed && strikethroughCompleted && 'text-muted-foreground line-through')}>{task.title}</div>
                            {task.description && <div className="mt-0.5 text-xs text-muted-foreground">{task.description}</div>}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant={PRIORITY_VARIANT[task.priority]}>
                                    <Flag /> {task.priority}
                                </Badge>
                                <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                                {task.estimatedHours ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> <span className="tabular-nums">{task.estimatedHours}h</span></span>
                                ) : null}
                                {task.deadline ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" /> {fmtDate(task.deadline)}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(task._id)}><Pencil /></Button>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteTask(task._id)}><Trash2 /></Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function TaskForm({ initial, onSave, onCancel }: { initial?: Task; onSave: (v: Partial<Task>) => Promise<void>; onCancel: () => void }) {
    const uid = useId()
    const [title, setTitle] = useState(initial?.title || '')
    const [description, setDescription] = useState(initial?.description || '')
    const [priority, setPriority] = useState<Priority>(initial?.priority || 'medium')
    const [status, setStatus] = useState<TaskStatus>(initial?.status || 'todo')
    const [estimatedHours, setEstimatedHours] = useState<number | ''>(initial?.estimatedHours ?? 1)
    const [deadline, setDeadline] = useState(initial?.deadline || '')
    const [saving, setSaving] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        setSaving(true)
        try {
            await onSave({ title: title.trim(), description, priority, status, estimatedHours: Number(estimatedHours) || 0, deadline })
        } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
                <Label htmlFor={`${uid}-title`}>Title</Label>
                <Input id={`${uid}-title`} autoFocus placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${uid}-desc`}>Description</Label>
                <Input id={`${uid}-desc`} placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-priority`}>Priority</Label>
                    <Select id={`${uid}-priority`} value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-status`}>Status</Label>
                    <Select id={`${uid}-status`} value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                        <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-hours`}>Est. hours</Label>
                    <Input id={`${uid}-hours`} type="number" min="0" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${uid}-deadline`}>Deadline</Label>
                    <Input id={`${uid}-deadline`} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X /> Cancel</Button>
                <Button type="submit" size="sm" disabled={saving || !title.trim()}><Check /> {saving ? 'Saving' : 'Save'}</Button>
            </div>
        </form>
    )
}

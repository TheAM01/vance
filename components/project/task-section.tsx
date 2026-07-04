'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, Flag, Clock, CalendarClock, ListTodo } from 'lucide-react'
import { Task, Priority, TaskStatus } from '@/lib/types'
import { parseDateLocal } from '@/lib/date-utils'

const PRIORITY_STYLE: Record<Priority, string> = {
    high: 'text-red-500 border-red-500/30 bg-red-500/10',
    medium: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    low: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
}
const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }

const INPUT = 'w-full px-3 py-2 bg-background border-2 border-border rounded-sm focus:outline-none focus:border-foreground text-foreground transition-colors font-mono text-xs'

function fmtDate(d?: string) {
    if (!d) return null
    try { return parseDateLocal(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } catch { return d }
}

export function TaskSection({ projectId, tasks, onChange }: { projectId: string; tasks: Task[]; onChange: () => void }) {
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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListTodo size={16} className="text-muted-foreground" />
                    <h2 className="text-lg font-black uppercase tracking-tight">Tasks</h2>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{done}/{tasks?.length || 0}</span>
                </div>
                <button onClick={() => setAdding(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-colors">
                    <Plus size={13} /> Add Task
                </button>
            </div>

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

            <div className="space-y-2">
                {sorted.length === 0 && !adding && (
                    <div className="p-8 text-center border-2 border-dashed border-border text-muted-foreground text-xs font-mono uppercase tracking-widest">
                        No tasks yet — add the first thing to do.
                    </div>
                )}

                {sorted.map(task => editingId === task._id ? (
                    <TaskForm
                        key={task._id}
                        initial={task}
                        onCancel={() => setEditingId(null)}
                        onSave={async (values) => { await patchTask(task._id, values); setEditingId(null) }}
                    />
                ) : (
                    <div key={task._id} className={`flex items-start gap-3 p-3 border border-border bg-card group ${task.completed ? 'opacity-60' : ''}`}>
                        <button
                            onClick={() => patchTask(task._id, { completed: !task.completed })}
                            className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-foreground border-foreground text-background' : 'border-border hover:border-foreground'}`}
                        >
                            {task.completed && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
                            {task.description && <div className="text-xs text-muted-foreground font-mono mt-0.5">{task.description}</div>}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border ${PRIORITY_STYLE[task.priority]}`}>
                                    <Flag size={9} /> {task.priority}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 border border-border text-muted-foreground">
                                    {STATUS_LABEL[task.status]}
                                </span>
                                {task.estimatedHours ? (
                                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-muted-foreground"><Clock size={9} /> {task.estimatedHours}h</span>
                                ) : null}
                                {task.deadline ? (
                                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-muted-foreground"><CalendarClock size={9} /> {fmtDate(task.deadline)}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingId(task._id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => deleteTask(task._id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TaskForm({ initial, onSave, onCancel }: { initial?: Task; onSave: (v: Partial<Task>) => Promise<void>; onCancel: () => void }) {
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
        <form onSubmit={submit} className="p-4 border-2 border-foreground bg-card space-y-3">
            <input autoFocus placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} className={INPUT} />
            <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className={INPUT} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={INPUT}>
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={INPUT}>
                        <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Est. Hours</label>
                    <input type="number" min="0" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))} className={INPUT} />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Deadline</label>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={INPUT} />
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

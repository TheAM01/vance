'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeft, Pencil, Trash2, ExternalLink, Github, Loader2, AlertTriangle,
    User, Building2, Radio, Calendar, CalendarClock, DollarSign, StickyNote,
} from 'lucide-react'
import { fetcher } from '@/lib/swr-fetcher'
import { Project, ProjectStatus } from '@/lib/types'
import { parseDateLocal } from '@/lib/date-utils'
import { formatMoney } from '@/lib/format'
import { TaskSection } from '@/components/project/task-section'
import { ChangeSection } from '@/components/project/change-section'
import { ProjectFormModal, ProjectFormValues, STATUSES } from '@/components/projects/project-form-modal'

const STATUS_COLOR: Record<string, string> = {
    active: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    completed: 'bg-green-500/10 text-green-500 border-green-500/30',
    'on-hold': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
}

function fmt(d?: string) {
    if (!d) return '—'
    try { return parseDateLocal(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

function Prop({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={15} className="text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="text-sm font-bold text-foreground truncate">{children}</div>
            </div>
        </div>
    )
}

export default function ProjectDetailPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const { data: project, error, mutate } = useSWR<Project>(`/api/projects/${id}`, fetcher)
    const [editing, setEditing] = useState(false)

    if (error) {
        return (
            <div className="min-h-full flex items-center justify-center p-6">
                <div className="bg-red-500/10 border-2 border-red-500 p-8 max-w-lg text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4 w-12 h-12" />
                    <h2 className="text-xl font-black uppercase text-red-500 mb-2">Project Not Found</h2>
                    <Link href="/projects" className="text-sm font-bold text-red-500/70 uppercase font-mono">← Back to projects</Link>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <p className="font-mono text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Loading project...</p>
            </div>
        )
    }

    const changesExtra = (project.changes || []).reduce((s, c) => s + (Number(c.amount) || 0), 0)
    const total = (Number(project.amount) || 0) + changesExtra

    const updateStatus = async (status: ProjectStatus) => {
        await fetch(`/api/projects/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
        })
        mutate()
    }

    const handleEdit = async (values: ProjectFormValues) => {
        const res = await fetch(`/api/projects/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
        })
        if (res.ok) { mutate(); setEditing(false) } else alert('Failed to save')
    }

    const handleDelete = async () => {
        if (!confirm(`Permanently purge "${project.name}" and all its data?`)) return
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
        if (res.ok) router.push('/projects')
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Top bar */}
            <div className="sticky top-0 z-40 md:bg-white/20 md:dark:bg-background/20 md:backdrop-blur-md border-b border-border/10 px-4 md:px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <Link href="/projects" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={14} /> Projects
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-border hover:border-foreground text-[10px] font-black uppercase tracking-widest transition-colors">
                            <Pencil size={12} /> Edit
                        </button>
                        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6 space-y-6">
                {/* Title */}
                <div className="border-l-4 pl-4" style={{ borderColor: project.color }}>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{project.name}</h1>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border ${STATUS_COLOR[project.status]}`}>
                            {project.status.replace('-', ' ')}
                        </span>
                    </div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">{project.type}</p>
                    {project.fields?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {project.fields.map(f => (
                                <span key={f} className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-secondary text-secondary-foreground border border-border">{f}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status switcher */}
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => (
                        <button
                            key={s.value}
                            onClick={() => updateStatus(s.value)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${project.status === s.value ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Properties + Money */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card border-2 border-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Prop icon={User} label="Client">{project.clientName || '—'}</Prop>
                        <Prop icon={Building2} label="Client Type">{project.clientType}</Prop>
                        <Prop icon={Radio} label="Source">{project.source}</Prop>
                        <Prop icon={Calendar} label="Started">{fmt(project.startedAt)}</Prop>
                        <Prop icon={CalendarClock} label="Deadline">{fmt(project.deadline)}</Prop>
                        <Prop icon={DollarSign} label="Payment">{project.paid ? 'Paid' : 'Unpaid'}</Prop>
                        {project.prodUrl && (
                            <div className="flex items-start gap-3">
                                <ExternalLink size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Production</div>
                                    <a href={project.prodUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-500 hover:underline truncate block">{project.prodUrl}</a>
                                </div>
                            </div>
                        )}
                        {project.githubUrl && (
                            <div className="flex items-start gap-3">
                                <Github size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">GitHub</div>
                                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-500 hover:underline truncate block">{project.githubUrl}</a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Money */}
                    <div className="bg-foreground text-background p-5 flex flex-col justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Project Value</div>
                        <div>
                            <div className="text-4xl font-black tracking-tighter mt-2">{formatMoney(total, project.currency)}</div>
                            <div className="mt-3 space-y-1 text-[11px] font-mono uppercase tracking-wide opacity-70">
                                <div className="flex justify-between"><span>Base</span><span>{formatMoney(project.amount, project.currency)}</span></div>
                                <div className="flex justify-between"><span>Changes</span><span>+{formatMoney(changesExtra, project.currency)}</span></div>
                                <div className="flex justify-between pt-1 border-t border-background/20"><span>Status</span><span>{project.paid ? 'Paid' : 'Unpaid'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {project.notes && (
                    <div className="bg-card border-2 border-border p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <StickyNote size={15} className="text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{project.notes}</p>
                    </div>
                )}

                {/* Tasks + Changes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                    <TaskSection projectId={id} tasks={project.tasks || []} onChange={mutate} />
                    <ChangeSection projectId={id} changes={project.changes || []} currency={project.currency} onChange={mutate} />
                </div>
            </div>

            {editing && (
                <ProjectFormModal
                    title="Edit Project"
                    submitLabel="Save Changes"
                    initial={project}
                    onClose={() => setEditing(false)}
                    onSubmit={handleEdit}
                />
            )}
        </div>
    )
}

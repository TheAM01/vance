'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeft, Pencil, Trash2, ExternalLink, Github, Loader2, AlertTriangle,
    User, Building2, Radio, Calendar, CalendarClock, DollarSign, StickyNote,
} from '@/components/ui/icons'
import { fetcher } from '@/lib/swr-fetcher'
import { Project, ProjectStatus } from '@/lib/types'
import { parseDateLocal } from '@/lib/date-utils'
import { formatMoney } from '@/lib/format'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { TaskSection } from '@/components/project/task-section'
import { ChangeSection } from '@/components/project/change-section'
import { ProjectFormModal, ProjectFormValues, STATUSES } from '@/components/projects/project-form-modal'
import { useSettings } from '@/components/theme/settings-provider'

const STATUS_VARIANT: Record<ProjectStatus, 'primary' | 'warning' | 'success' | 'outline'> = {
    active: 'primary',
    completed: 'success',
    'on-hold': 'warning',
    cancelled: 'outline',
}

function fmt(d?: string) {
    if (!d) return '—'
    try { return parseDateLocal(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

function Prop({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="truncate text-sm font-medium text-foreground">{children}</div>
            </div>
        </div>
    )
}

export default function ProjectDetailPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const { data: project, error, mutate } = useSWR<Project>(`/api/projects/${id}`, fetcher)
    const { currencySymbol } = useSettings()
    const [editing, setEditing] = useState(false)

    if (error) {
        return (
            <div className="flex min-h-full items-center justify-center p-6">
                <EmptyState
                    icon={AlertTriangle}
                    title="Project not found"
                    description="This project may have been deleted, or the link is no longer valid."
                    action={
                        <Button variant="outline" asChild>
                            <Link href="/projects"><ArrowLeft /> Back to projects</Link>
                        </Button>
                    }
                />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex min-h-full flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading project…</p>
            </div>
        )
    }

    const tasks = project.tasks || []
    const doneTasks = tasks.filter(t => t.completed).length
    const taskPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0
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
        <div className="flex min-h-full flex-col">
            <PageHeader
                title={project.name}
                description={[project.clientName, project.type].filter(Boolean).join(' · ') || undefined}
            >
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects"><ArrowLeft /> Projects</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil /> Edit
                </Button>
                <Button variant="destructive-outline" size="sm" onClick={handleDelete}>
                    <Trash2 /> Delete
                </Button>
            </PageHeader>

            <PageBody width="wide" className="space-y-6">
                {/* Status + fields */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                        <Badge variant={STATUS_VARIANT[project.status]}>{project.status.replace('-', ' ')}</Badge>
                        {project.fields?.map(f => (
                            <Badge key={f} variant="outline">{f}</Badge>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map(s => (
                            <Button
                                key={s.value}
                                variant={project.status === s.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateStatus(s.value)}
                            >
                                {s.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Meta + money */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            <Prop icon={User} label="Client">{project.clientName || '—'}</Prop>
                            <Prop icon={Building2} label="Client type">{project.clientType}</Prop>
                            <Prop icon={Radio} label="Source">{project.source}</Prop>
                            <Prop icon={Calendar} label="Started">{fmt(project.startedAt)}</Prop>
                            <Prop icon={CalendarClock} label="Deadline">{fmt(project.deadline)}</Prop>
                            <Prop icon={DollarSign} label="Payment">{project.paid ? 'Paid' : 'Unpaid'}</Prop>
                            {project.prodUrl && (
                                <div className="flex items-start gap-3">
                                    <ExternalLink size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-muted-foreground">Production</div>
                                        <a href={project.prodUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-primary hover:underline">{project.prodUrl}</a>
                                    </div>
                                </div>
                            )}
                            {project.githubUrl && (
                                <div className="flex items-start gap-3">
                                    <Github size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-muted-foreground">GitHub</div>
                                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-primary hover:underline">{project.githubUrl}</a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        {tasks.length > 0 && (
                            <CardFooter className="flex-col items-stretch gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Task progress</span>
                                    <span className="tabular-nums text-muted-foreground">{doneTasks}/{tasks.length}</span>
                                </div>
                                <Progress value={taskPct} />
                            </CardFooter>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project value</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="font-heading text-3xl font-semibold tabular-nums text-foreground">{formatMoney(total, currencySymbol)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">Total including changes</div>
                            </div>
                            <Separator />
                            <dl className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground">Base</dt>
                                    <dd className="tabular-nums text-foreground">{formatMoney(project.amount, currencySymbol)}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground">Changes</dt>
                                    <dd className="tabular-nums text-foreground">+{formatMoney(changesExtra, currencySymbol)}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground">Payment</dt>
                                    <dd><Badge variant={project.paid ? 'success' : 'outline'}>{project.paid ? 'Paid' : 'Unpaid'}</Badge></dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                {project.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <StickyNote className="size-4 text-muted-foreground" /> Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{project.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Tasks + Changes */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TaskSection projectId={id} tasks={project.tasks || []} onChange={mutate} />
                    <ChangeSection projectId={id} changes={project.changes || []} currency={currencySymbol} onChange={mutate} />
                </div>
            </PageBody>

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

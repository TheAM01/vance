'use client'

import React, { useState } from 'react'
import { MoreVertical, Trash2 } from '@/components/ui/icons'
import Link from 'next/link'
import { Project, ProjectStatus } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const STATUS_LABEL: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    'on-hold': 'On Hold',
    cancelled: 'Cancelled',
}

const STATUS_VARIANT: Record<ProjectStatus, 'primary' | 'warning' | 'success' | 'outline'> = {
    active: 'primary',
    'on-hold': 'warning',
    completed: 'success',
    cancelled: 'outline',
}

export function ProjectCard({ project, onChange }: { project: Project; onChange?: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const tasks = project.tasks || []
    const done = tasks.filter(t => t.completed || t.status === 'done').length
    const total = tasks.length
    const changes = project.changes?.length || 0

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(`CRITICAL ACTION: Permanently purge project "${project.name}" and all its tasks & changes. Confirm erasure?`)) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/projects/${project._id}`, { method: 'DELETE' })
            if (res.ok) onChange?.()
            else alert('Purge failed. System error.')
        } catch (err) {
            console.error(err)
            alert('Purge failed. Network error.')
        } finally {
            setIsDeleting(false)
            setIsMenuOpen(false)
        }
    }

    return (
        <Card className="group/card relative flex h-full flex-col overflow-hidden transition-all hover:border-primary/40 hover:shadow-elevated">
            <Link href={`/projects/${project._id}`} className="flex h-full flex-col">
                {/* Colored header (uses the project's stored color) */}
                <div
                    className="border-b border-border px-5 py-4"
                    style={{ backgroundColor: `${project.color || '#215E61'}22` }}
                >
                    <div className="flex items-start gap-2.5">
                        <span
                            aria-hidden
                            className="mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-card"
                            style={{ backgroundColor: project.color || '#215E61' }}
                        />
                        <div className="min-w-0 pr-8">
                            <p className="truncate text-xs text-muted-foreground">{project.type}</p>
                            <h3 className="truncate font-heading text-base font-semibold tracking-tight text-foreground transition-colors group-hover/card:text-primary">
                                {project.name}
                            </h3>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                {project.clientName || 'No client'} · {project.clientType}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 px-5 py-4">
                    {/* Status + paid */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={STATUS_VARIANT[project.status] || 'outline'}>
                            {STATUS_LABEL[project.status] || project.status}
                        </Badge>
                        <Badge variant={project.paid ? 'success' : 'outline'}>
                            {project.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                    </div>

                    {/* Fields */}
                    {project.fields?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {project.fields.slice(0, 4).map(f => (
                                <Badge key={f} variant="outline" className="font-normal">
                                    {f}
                                </Badge>
                            ))}
                            {project.fields.length > 4 && (
                                <Badge variant="outline" className="font-normal">
                                    +{project.fields.length - 4}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Amount */}
                    <div className="font-heading text-lg font-semibold tabular-nums text-foreground">
                        {formatMoney(project.amount, project.currency)}
                    </div>

                    {/* Progress */}
                    <div className="mt-auto space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Tasks</span>
                            <span className="tabular-nums">
                                {done}/{total}
                                {changes > 0 && ` · ${changes} ${changes === 1 ? 'change' : 'changes'}`}
                            </span>
                        </div>
                        <Progress value={total > 0 ? Math.round((done / total) * 100) : 0} />
                    </div>
                </div>
            </Link>

            {/* Actions menu */}
            <div className="absolute right-3 top-3 z-10">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                    aria-label="Project actions"
                    className={cn(
                        'inline-flex size-8 items-center justify-center rounded-md border transition-colors',
                        isMenuOpen
                            ? 'border-border bg-accent text-foreground'
                            : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                >
                    <MoreVertical className="size-4" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-popover">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        >
                            <Trash2 className="size-4" />
                            {isDeleting ? 'Deleting…' : 'Delete project'}
                        </button>
                    </div>
                )}
            </div>
        </Card>
    )
}

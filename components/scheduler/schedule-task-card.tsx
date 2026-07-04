'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Flag, Clock, CalendarClock, AlertTriangle } from '@/components/ui/icons'
import { ScheduledTask } from '@/lib/scheduler'
import { parseDateLocal } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'outline'> = {
    high: 'destructive', medium: 'warning', low: 'outline',
}

function due(d?: string) {
    if (!d) return ''
    try { return parseDateLocal(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return d }
}

export function ScheduleTaskCard({
    item, onToggle, compact = false, showDescription = false,
}: {
    item: ScheduledTask
    onToggle: (s: ScheduledTask) => void
    compact?: boolean
    showDescription?: boolean
}) {
    const [busy, setBusy] = useState(false)
    const { task, projectColor, projectName, projectId, overdue, atRisk, done } = item
    const hours = Math.max(0.5, task.estimatedHours || 1)

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setBusy(true)
        try { await onToggle(item) } finally { setBusy(false) }
    }

    return (
        <div
            className={cn(
                'group relative flex overflow-hidden rounded-lg border border-border bg-card transition-all',
                done ? 'opacity-60' : 'shadow-xs hover:border-primary/40 hover:shadow-sm',
                busy && 'pointer-events-none opacity-40'
            )}
        >
            <div className={cn('flex min-w-0 flex-1 flex-col', compact ? 'gap-2 p-2.5' : 'gap-2.5 p-3.5')}>
                <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                        <h4
                            className={cn(
                                compact ? 'text-[13px]' : 'text-sm',
                                'font-medium leading-snug',
                                done ? 'text-muted-foreground line-through' : 'text-foreground'
                            )}
                        >
                            {task.title}
                        </h4>
                        <Link
                            href={`/projects/${projectId}`}
                            onClick={e => e.stopPropagation()}
                            className="mt-1 flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: projectColor }} />
                            <span className="truncate">{projectName}</span>
                        </Link>
                    </div>
                    <button
                        onClick={toggle}
                        title={done ? 'Mark as not done' : 'Mark done'}
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-md border transition-colors',
                            compact ? 'size-6' : 'size-7',
                            done
                                ? 'border-success bg-success text-success-foreground'
                                : 'border-border text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground'
                        )}
                    >
                        <Check size={compact ? 13 : 15} strokeWidth={3} />
                    </button>
                </div>

                {showDescription && task.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
                    <Badge variant={done ? 'outline' : (PRIORITY_VARIANT[task.priority] || 'outline')}>
                        <Flag /> {task.priority}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <Clock className="size-3" /> {hours}h
                    </span>
                    {task.deadline && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                            <CalendarClock className="size-3" /> {due(task.deadline)}
                        </span>
                    )}
                    {done ? (
                        <Badge variant="success" className="ml-auto"><Check /> Done</Badge>
                    ) : overdue ? (
                        <Badge variant="destructive" className="ml-auto"><AlertTriangle /> Overdue</Badge>
                    ) : atRisk ? (
                        <Badge variant="warning" className="ml-auto"><AlertTriangle /> At risk</Badge>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

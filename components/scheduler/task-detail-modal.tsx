'use client'

import Link from 'next/link'
import { Flag, Clock, CalendarClock, Check, AlertTriangle, ExternalLink, Hourglass } from '@/components/ui/icons'
import { ScheduledTask } from '@/lib/scheduler'
import { parseDateLocal } from '@/lib/date-utils'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'outline'> = {
    high: 'destructive', medium: 'warning', low: 'outline',
}
const STATUS_LABEL: Record<string, string> = {
    todo: 'To do', 'in-progress': 'In progress', done: 'Done',
}

function fmtDate(d?: string | null) {
    if (!d) return '—'
    try {
        // date-only 'YYYY-MM-DD' vs full ISO timestamp
        const date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? parseDateLocal(d) : new Date(d)
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return d
    }
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{children}</dd>
        </div>
    )
}

export function TaskDetailModal({
    item,
    open,
    onClose,
    onToggle,
}: {
    item: ScheduledTask | null
    open: boolean
    onClose: () => void
    onToggle: (s: ScheduledTask) => void
}) {
    if (!item) return null
    const { task, projectId, projectName, projectColor, date, overdue, atRisk, done } = item
    const hours = Math.max(0.5, task.estimatedHours || 1)

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <ModalHeader
                title={task.title}
                description={
                    <Link
                        href={`/projects/${projectId}`}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                        <span className="size-2 shrink-0 rounded-full" style={{ background: projectColor }} />
                        {projectName}
                    </Link>
                }
                onClose={onClose}
            />

            <ModalBody className="space-y-5">
                {/* Status line */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={PRIORITY_VARIANT[task.priority] || 'outline'}>
                        <Flag /> {task.priority}
                    </Badge>
                    <Badge variant={done ? 'success' : 'outline'}>
                        {STATUS_LABEL[task.status] || task.status}
                    </Badge>
                    {done ? (
                        <Badge variant="success"><Check /> Done</Badge>
                    ) : overdue ? (
                        <Badge variant="destructive"><AlertTriangle /> Overdue</Badge>
                    ) : atRisk ? (
                        <Badge variant="warning"><AlertTriangle /> At risk</Badge>
                    ) : null}
                </div>

                {/* Description */}
                {task.description ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{task.description}</p>
                ) : (
                    <p className="text-sm italic text-muted-foreground">No description.</p>
                )}

                {/* Meta grid */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-3">
                    <Detail label="Estimated">
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <Clock className="size-3.5 text-muted-foreground" /> {hours}h
                        </span>
                    </Detail>
                    {task.actualHours != null && (
                        <Detail label="Logged">
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                                <Hourglass className="size-3.5 text-muted-foreground" /> {task.actualHours}h
                            </span>
                        </Detail>
                    )}
                    <Detail label="Scheduled">
                        <span className="tabular-nums">{fmtDate(date)}</span>
                    </Detail>
                    <Detail label="Deadline">
                        <span className={overdue ? 'inline-flex items-center gap-1.5 tabular-nums text-destructive' : 'inline-flex items-center gap-1.5 tabular-nums'}>
                            <CalendarClock className="size-3.5 text-muted-foreground" /> {fmtDate(task.deadline)}
                        </span>
                    </Detail>
                    {done && task.completedAt && (
                        <Detail label="Completed">
                            <span className="tabular-nums">{fmtDate(task.completedAt)}</span>
                        </Detail>
                    )}
                    {task.createdAt && (
                        <Detail label="Created">
                            <span className="tabular-nums">{fmtDate(task.createdAt)}</span>
                        </Detail>
                    )}
                </dl>
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}`}>
                        <ExternalLink /> Open project
                    </Link>
                </Button>
                <Button
                    variant={done ? 'outline' : 'default'}
                    onClick={() => { onToggle(item); onClose() }}
                >
                    <Check /> {done ? 'Mark as not done' : 'Mark done'}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

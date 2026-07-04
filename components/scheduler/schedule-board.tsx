'use client'

import { Check, Flag, Clock, AlertTriangle, CalendarRange } from '@/components/ui/icons'
import Link from 'next/link'
import { Project } from '@/lib/types'
import { buildSchedule, groupByDay, ScheduledTask } from '@/lib/scheduler'
import { parseDateLocal, toLocalDateStr, startOfDay } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'outline'> = {
    high: 'destructive', medium: 'warning', low: 'outline',
}

function dayLabel(dateStr: string): { big: string; small: string; isToday: boolean } {
    const d = parseDateLocal(dateStr)
    const today = startOfDay(new Date())
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const todayStr = toLocalDateStr(today)
    const tomStr = toLocalDateStr(tomorrow)
    let big = d.toLocaleDateString(undefined, { weekday: 'short' })
    if (dateStr === todayStr) big = 'Today'
    else if (dateStr === tomStr) big = 'Tomorrow'
    return { big, small: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), isToday: dateStr === todayStr }
}

export function ScheduleBoard({
    projects, hoursPerDay, days = 7, onChange,
}: {
    projects: Project[]
    hoursPerDay: number
    days?: number
    onChange: () => void
}) {
    const scheduled = buildSchedule(projects, { hoursPerDay }).filter(s => !s.done)
    const grouped = groupByDay(scheduled)

    // Limit to first `days` distinct days
    const entries = [...grouped.entries()].slice(0, days)

    const toggle = async (s: ScheduledTask) => {
        await fetch(`/api/projects/${s.projectId}/tasks/${s.task._id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: true }),
        })
        onChange()
    }

    if (scheduled.length === 0) {
        return (
            <EmptyState
                icon={CalendarRange}
                title="Nothing to schedule"
                description="Add tasks to your active projects to see them planned here."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map(([date, items]) => {
                const { big, small, isToday } = dayLabel(date)
                const load = items.reduce((s, i) => s + Math.max(0.5, i.task.estimatedHours || 1), 0)
                const over = load > hoursPerDay
                return (
                    <div
                        key={date}
                        className={cn(
                            'flex flex-col rounded-xl border bg-card shadow-xs',
                            isToday ? 'border-primary/40 ring-1 ring-primary/40' : 'border-border'
                        )}
                    >
                        <div className="border-b border-border px-3 py-2.5">
                            <div className="flex items-baseline justify-between">
                                <span className={cn('text-sm font-semibold', isToday ? 'text-primary' : 'text-foreground')}>{big}</span>
                                <span className="text-xs tabular-nums text-muted-foreground">{small}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <Progress
                                    value={Math.min(100, (load / hoursPerDay) * 100)}
                                    className="h-1.5 flex-1"
                                    indicatorClassName={over ? 'bg-destructive' : 'bg-highlight'}
                                />
                                <span className={cn('shrink-0 font-mono text-[11px] tabular-nums', over ? 'text-destructive' : 'text-muted-foreground')}>{load}h</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 p-2">
                            {items.map(s => (
                                <div key={s.task._id} className="flex gap-2 rounded-lg bg-muted/50 p-2 transition-colors hover:bg-muted">
                                    <button
                                        onClick={() => toggle(s)}
                                        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                        title="Mark done"
                                    >
                                        <Check size={10} strokeWidth={3} />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium leading-tight text-foreground">{s.task.title}</div>
                                        <Link
                                            href={`/projects/${s.projectId}`}
                                            className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: s.projectColor }} />
                                            <span className="truncate">{s.projectName}</span>
                                        </Link>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            <Badge variant={PRIORITY_VARIANT[s.task.priority] || 'outline'}>
                                                <Flag /> {s.task.priority}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                                                <Clock className="size-3" /> {Math.max(0.5, s.task.estimatedHours || 1)}h
                                            </span>
                                            {s.overdue ? (
                                                <Badge variant="destructive"><AlertTriangle /> Overdue</Badge>
                                            ) : s.atRisk ? (
                                                <Badge variant="warning"><AlertTriangle /> At risk</Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

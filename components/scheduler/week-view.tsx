'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, AlertTriangle } from '@/components/ui/icons'
import { ScheduledTask } from '@/lib/scheduler'
import { toLocalDateStr, startOfDay } from '@/lib/date-utils'
import { Progress } from '@/components/ui/progress'
import { useSettings } from '@/components/theme/settings-provider'
import { TaskDetailModal } from '@/components/scheduler/task-detail-modal'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PRIORITY_DOT: Record<string, string> = {
    high: 'bg-destructive',
    medium: 'bg-warning',
    low: 'bg-muted-foreground/40',
}

/** Dense, board-friendly task card for a week column (Jira-style). Click opens details. */
function WeekTaskChip({
    item,
    onToggle,
    onOpen,
    strikethrough,
}: {
    item: ScheduledTask
    onToggle: (s: ScheduledTask) => void
    onOpen: (s: ScheduledTask) => void
    strikethrough: boolean
}) {
    const { task, projectColor, projectName, projectId, overdue, atRisk, done } = item
    const hours = Math.max(0.5, task.estimatedHours || 1)

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(item)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(item) }
            }}
            title="View task details"
            className={cn(
                'group/chip cursor-pointer rounded-md border border-l-[3px] border-border bg-card p-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                done ? 'opacity-60' : 'hover:border-primary/40 hover:shadow-sm'
            )}
            style={done ? undefined : { borderLeftColor: projectColor }}
        >
            <div className="flex items-start gap-1.5">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(item) }}
                    title={done ? 'Mark as not done' : 'Mark done'}
                    className={cn(
                        'mt-px flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                        done
                            ? 'border-success bg-success text-success-foreground'
                            : 'border-border text-transparent hover:border-primary hover:bg-primary hover:text-primary-foreground'
                    )}
                >
                    <Check size={11} strokeWidth={3} />
                </button>
                <p
                    className={cn(
                        'line-clamp-2 min-w-0 flex-1 text-xs font-medium leading-snug',
                        done ? 'text-muted-foreground' : 'text-foreground',
                        done && strikethrough && 'line-through'
                    )}
                >
                    {task.title}
                </p>
            </div>

            <div className="mt-1.5 flex items-center gap-2 pl-[22px]">
                <Link
                    href={`/projects/${projectId}`}
                    title={projectName}
                    onClick={(e) => e.stopPropagation()}
                    className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: projectColor }} />
                    <span className="truncate">{projectName}</span>
                </Link>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                    <span
                        className="flex items-center gap-1 font-mono text-[10px] tabular-nums text-muted-foreground"
                        title={`${task.priority} priority`}
                    >
                        <span className={cn('size-1.5 rounded-full', PRIORITY_DOT[task.priority] || PRIORITY_DOT.low)} />
                        {hours}h
                    </span>
                    {!done && overdue ? (
                        <AlertTriangle className="size-3 shrink-0 text-destructive" title="Overdue" />
                    ) : !done && atRisk ? (
                        <AlertTriangle className="size-3 shrink-0 text-warning" title="At risk" />
                    ) : null}
                </span>
            </div>
        </div>
    )
}

export function WeekView({
    weekStart,
    grouped,
    hoursPerDay,
    onToggle,
}: {
    weekStart: Date
    grouped: Map<string, ScheduledTask[]>
    hoursPerDay: number
    onToggle: (s: ScheduledTask) => void
    /** Accepted for API compatibility; the week board uses its own dense cards. */
    compact?: boolean
}) {
    const { strikethroughCompleted } = useSettings()
    const [detail, setDetail] = useState<ScheduledTask | null>(null)
    const todayStr = toLocalDateStr(startOfDay(new Date()))

    const days = DAY_NAMES.map((name, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const key = toLocalDateStr(d)
        const items = grouped.get(key) || []
        const pending = items.filter(it => !it.done)
        const finished = items.filter(it => it.done)
        const hours = pending.reduce((s, it) => s + Math.max(0.5, it.task.estimatedHours || 1), 0)
        return {
            name,
            key,
            items,
            pending,
            finished,
            hours,
            dateNum: d.getDate(),
            isToday: key === todayStr,
            isPast: key < todayStr,
            isWeekend: i >= 5,
        }
    })

    const weekPending = days.reduce((s, d) => s + d.pending.length, 0)
    const weekDone = days.reduce((s, d) => s + d.finished.length, 0)
    const weekHours = days.reduce((s, d) => s + d.hours, 0)
    const weekCapacity = hoursPerDay * 7
    const overDays = days.filter(d => d.hours > hoursPerDay).length
    const weekPct = Math.min(100, weekCapacity ? (weekHours / weekCapacity) * 100 : 0)
    const weekOver = weekHours > weekCapacity

    return (
        <div className="space-y-3">
            {/* Week workload summary */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-lg border border-border bg-card px-4 py-3">
                <span className="text-sm font-semibold text-foreground">This week</span>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Workload</span>
                    <Progress
                        value={weekPct}
                        className="h-1.5 w-28"
                        indicatorClassName={weekOver ? 'bg-destructive' : 'bg-highlight'}
                    />
                    <span
                        className={cn(
                            'font-mono text-xs tabular-nums',
                            weekOver ? 'font-semibold text-destructive' : 'text-foreground'
                        )}
                    >
                        {weekHours}h / {weekCapacity}h
                    </span>
                </div>

                <span className="text-sm text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">{weekPending}</span> to do
                    {weekDone > 0 && (
                        <>
                            {' · '}
                            <span className="tabular-nums">{weekDone}</span> done
                        </>
                    )}
                </span>

                {overDays > 0 && (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                        <AlertTriangle className="size-3.5" />
                        {overDays} day{overDays > 1 ? 's' : ''} over capacity
                    </span>
                )}
            </div>

            {/* Day board — fills the width on large screens, scrolls on small */}
            <div className="overflow-x-auto pb-1">
                <div className="flex items-stretch gap-3">
                    {days.map(day => {
                        const over = day.hours > hoursPerDay
                        const pct = Math.min(100, (day.hours / hoursPerDay) * 100)
                        return (
                            <div
                                key={day.key}
                                className={cn(
                                    'flex min-w-[156px] flex-1 basis-0 flex-col rounded-xl border bg-card transition-colors',
                                    day.isToday
                                        ? 'border-primary/50 shadow-sm ring-1 ring-primary/25'
                                        : 'border-border',
                                    day.isPast && !day.isToday && 'opacity-65'
                                )}
                            >
                                {/* Column header */}
                                <div
                                    className={cn(
                                        'rounded-t-xl border-b border-border px-3 py-2.5',
                                        day.isWeekend && !day.isToday && 'bg-muted/40'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                'text-[11px] font-semibold uppercase tracking-wide',
                                                day.isToday ? 'text-primary' : 'text-muted-foreground'
                                            )}
                                        >
                                            {day.name}
                                        </span>
                                        <span
                                            className={cn(
                                                'flex size-6 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                                                day.isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                                            )}
                                        >
                                            {day.dateNum}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <Progress
                                            value={pct}
                                            className="h-1 flex-1"
                                            indicatorClassName={over ? 'bg-destructive' : 'bg-highlight'}
                                        />
                                        <span
                                            className={cn(
                                                'shrink-0 font-mono text-[10px] tabular-nums',
                                                over ? 'font-semibold text-destructive' : 'text-muted-foreground'
                                            )}
                                        >
                                            {day.hours}h
                                        </span>
                                    </div>
                                    {over && (
                                        <p className="mt-1 text-[10px] font-medium text-destructive">Over capacity</p>
                                    )}
                                </div>

                                {/* Column body */}
                                <div className="flex-1 space-y-2 p-2">
                                    {day.items.length === 0 ? (
                                        <div className="flex h-full min-h-[100px] items-center justify-center">
                                            <span className="text-[11px] text-muted-foreground/50">No tasks</span>
                                        </div>
                                    ) : (
                                        [...day.pending, ...day.finished].map(item => (
                                            <WeekTaskChip
                                                key={item.task._id}
                                                item={item}
                                                onToggle={onToggle}
                                                onOpen={setDetail}
                                                strikethrough={strikethroughCompleted}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <TaskDetailModal
                item={detail}
                open={!!detail}
                onClose={() => setDetail(null)}
                onToggle={onToggle}
            />
        </div>
    )
}

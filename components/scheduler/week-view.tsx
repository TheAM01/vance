'use client'

import { ScheduledTask } from '@/lib/scheduler'
import { toLocalDateStr, startOfDay } from '@/lib/date-utils'
import { ScheduleTaskCard } from './schedule-task-card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WeekView({
    weekStart,
    grouped,
    hoursPerDay,
    onToggle,
    compact = false,
}: {
    weekStart: Date
    grouped: Map<string, ScheduledTask[]>
    hoursPerDay: number
    onToggle: (s: ScheduledTask) => void
    compact?: boolean
}) {
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
            name, key, items, pending, finished, hours,
            dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isToday: key === todayStr,
            isPast: key < todayStr,
        }
    })

    return (
        <div className="scrollbar-hide -mx-1 overflow-x-auto px-1 pb-2">
            <div className="grid grid-cols-1 gap-3 md:min-w-[1280px] md:grid-cols-7">
                {days.map(day => {
                    const over = day.hours > hoursPerDay
                    const pct = Math.min(100, (day.hours / hoursPerDay) * 100)
                    return (
                        <div
                            key={day.key}
                            className={cn(
                                'flex flex-col rounded-xl border bg-card shadow-xs',
                                day.isToday ? 'border-primary/40 ring-1 ring-primary/40' : 'border-border',
                                day.isPast && !day.isToday && 'opacity-70'
                            )}
                        >
                            {/* Header */}
                            <div className="border-b border-border px-3 py-3">
                                <div className="flex items-baseline justify-between">
                                    <span className={cn('text-sm font-semibold', day.isToday ? 'text-primary' : 'text-foreground')}>
                                        {day.isToday ? 'Today' : day.name}
                                    </span>
                                    <span className="text-xs tabular-nums text-muted-foreground">{day.dateLabel}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Progress
                                        value={pct}
                                        className="h-1.5 flex-1"
                                        indicatorClassName={over ? 'bg-destructive' : 'bg-highlight'}
                                    />
                                    <span className={cn('shrink-0 font-mono text-[11px] tabular-nums', over ? 'text-destructive' : 'text-muted-foreground')}>
                                        {day.hours}h
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="min-h-[140px] flex-1 space-y-2.5 p-2.5">
                                {day.items.length === 0 ? (
                                    <div className="flex h-full min-h-[120px] items-center justify-center">
                                        <span className="text-xs text-muted-foreground/60">No tasks</span>
                                    </div>
                                ) : (
                                    [...day.pending, ...day.finished].map(item => (
                                        <ScheduleTaskCard key={item.task._id} item={item} onToggle={onToggle} compact={compact} />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    )
}

'use client'

import { ScheduledTask } from '@/lib/scheduler'
import { toLocalDateStr, startOfDay } from '@/lib/date-utils'
import { ScheduleTaskCard } from './schedule-task-card'

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
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:min-w-[1280px]">
                {days.map(day => {
                    const over = day.hours > hoursPerDay
                    return (
                        <div key={day.key} className={`flex flex-col border-2 ${day.isToday ? 'border-foreground' : 'border-border'} bg-card/40`}>
                            {/* Header */}
                            <div className={`px-3 py-3 border-b-2 ${day.isToday ? 'bg-foreground text-background border-foreground' : day.isPast ? 'border-border opacity-60' : 'border-border'}`}>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm font-black uppercase tracking-[0.15em]">{day.isToday ? 'Today' : day.name}</span>
                                    <span className="font-mono text-[11px] font-bold opacity-70">{day.dateLabel}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className={`h-1.5 flex-1 ${day.isToday ? 'bg-background/20' : 'bg-muted'} overflow-hidden`}>
                                        <div className="h-full" style={{ width: `${Math.min(100, (day.hours / hoursPerDay) * 100)}%`, background: over ? '#ef4444' : (day.isToday ? 'currentColor' : 'hsl(var(--foreground))') }} />
                                    </div>
                                    <span className="font-mono text-[10px] font-bold opacity-70 shrink-0">{day.hours}h</span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-2.5 space-y-2.5 flex-1 min-h-[140px]">
                                {day.items.length === 0 ? (
                                    <div className="h-full min-h-[120px] flex items-center justify-center border border-dashed border-border/50">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">Free</span>
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

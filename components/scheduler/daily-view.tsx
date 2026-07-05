'use client'

import { CalendarCheck } from '@/components/ui/icons'
import { ScheduledTask } from '@/lib/scheduler'
import { ScheduleTaskCard } from './schedule-task-card'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export function DailyView({
    items,
    hoursPerDay,
    onToggle,
    compact = false,
}: {
    items: ScheduledTask[]
    hoursPerDay: number
    onToggle: (s: ScheduledTask) => void
    compact?: boolean
}) {
    const pending = items.filter(i => !i.done)
    const finished = items.filter(i => i.done)
    const hours = pending.reduce((s, it) => s + Math.max(0.5, it.task.estimatedHours || 1), 0)
    const over = hours > hoursPerDay
    const pct = Math.min(100, (hours / hoursPerDay) * 100)

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            {/* Capacity summary */}
            <Card className="p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">Planned for this day</span>
                    <span className={cn('font-mono text-sm font-semibold tabular-nums', over ? 'text-destructive' : 'text-foreground')}>
                        {hours}h / {hoursPerDay}h
                    </span>
                </div>
                <Progress value={pct} indicatorClassName={over ? 'bg-destructive' : 'bg-highlight'} />
                <p className="mt-2 text-xs text-muted-foreground">
                    {pending.length} to do{finished.length > 0 ? ` · ${finished.length} done` : ''}
                </p>
            </Card>

            {items.length === 0 ? (
                <EmptyState
                    icon={CalendarCheck}
                    title="Nothing scheduled"
                    description="This day is clear. Enjoy the breathing room, or pull work forward."
                />
            ) : (
                <div className="space-y-2.5">
                    {[...pending, ...finished].map(item => (
                        <ScheduleTaskCard key={item.task._id} item={item} onToggle={onToggle} compact={compact} showDescription />
                    ))}
                </div>
            )}
        </div>
    )
}

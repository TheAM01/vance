'use client'

import { ScheduledTask } from '@/lib/scheduler'
import { ScheduleTaskCard } from './schedule-task-card'

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
        <div className="max-w-2xl space-y-4">
            {/* Capacity summary */}
            <div className="border-2 border-border bg-card/40 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Planned for this day</span>
                    <span className={`font-mono text-sm font-black ${over ? 'text-red-500' : ''}`}>{hours}h / {hoursPerDay}h</span>
                </div>
                <div className="h-2 w-full bg-muted overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: over ? '#ef4444' : 'hsl(var(--foreground))' }} />
                </div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {pending.length} to do{finished.length > 0 ? ` · ${finished.length} done` : ''}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border text-center">
                    <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground/50">Nothing scheduled for this day</span>
                </div>
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

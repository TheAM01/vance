'use client'

import { Check, Flag, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Project, Priority } from '@/lib/types'
import { buildSchedule, groupByDay, ScheduledTask } from '@/lib/scheduler'
import { parseDateLocal, toLocalDateStr, startOfDay } from '@/lib/date-utils'

const PRIORITY_DOT: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }

function dayLabel(dateStr: string): { big: string; small: string; isToday: boolean } {
    const d = parseDateLocal(dateStr)
    const today = startOfDay(new Date())
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const todayStr = toLocalDateStr(today)
    const tomStr = toLocalDateStr(tomorrow)
    let big = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()
    if (dateStr === todayStr) big = 'TODAY'
    else if (dateStr === tomStr) big = 'TOMORROW'
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
            <div className="p-12 text-center border-2 border-dashed border-border text-muted-foreground text-sm font-mono uppercase tracking-widest">
                No pending tasks to schedule. Add tasks to your active projects.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {entries.map(([date, items]) => {
                const { big, small, isToday } = dayLabel(date)
                const load = items.reduce((s, i) => s + Math.max(0.5, i.task.estimatedHours || 1), 0)
                return (
                    <div key={date} className={`border-2 ${isToday ? 'border-foreground' : 'border-border'} bg-card flex flex-col`}>
                        <div className={`flex items-center justify-between px-3 py-2 border-b-2 ${isToday ? 'bg-foreground text-background border-foreground' : 'border-border'}`}>
                            <span className="text-xs font-black uppercase tracking-widest">{big}</span>
                            <span className="text-[9px] font-mono opacity-70">{small} · {load}h</span>
                        </div>
                        <div className="p-2 space-y-2 flex-1">
                            {items.map(s => (
                                <div key={s.task._id} className="border-l-2 bg-secondary/40 p-2" style={{ borderColor: s.projectColor }}>
                                    <div className="flex items-start gap-2">
                                        <button
                                            onClick={() => toggle(s)}
                                            className="mt-0.5 w-4 h-4 shrink-0 border-2 border-border hover:border-foreground flex items-center justify-center transition-colors"
                                            title="Mark done"
                                        >
                                            <Check size={10} strokeWidth={3} className="opacity-0 hover:opacity-100" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold leading-tight">{s.task.title}</div>
                                            <Link href={`/projects/${s.projectId}`} className="flex items-center gap-1 mt-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.projectColor }} />
                                                <span className="truncate">{s.projectName}</span>
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider" style={{ color: PRIORITY_DOT[s.task.priority] }}>
                                                    <Flag size={8} /> {s.task.priority}
                                                </span>
                                                <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-muted-foreground">
                                                    <Clock size={8} /> {Math.max(0.5, s.task.estimatedHours || 1)}h
                                                </span>
                                                {s.overdue && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-red-500">
                                                        <AlertTriangle size={8} /> Overdue
                                                    </span>
                                                )}
                                                {!s.overdue && s.atRisk && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-amber-500">
                                                        <AlertTriangle size={8} /> At Risk
                                                    </span>
                                                )}
                                            </div>
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

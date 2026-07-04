'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
    Loader2, ChevronLeft, ChevronRight, CalendarRange, CalendarDays, LayoutList,
    SlidersHorizontal, AlertTriangle, FolderKanban,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { useSettings } from '@/components/theme/settings-provider'
import { buildSchedule, groupByDay, ScheduledTask } from '@/lib/scheduler'
import { WeekView } from '@/components/scheduler/week-view'
import { DailyView } from '@/components/scheduler/daily-view'
import { ScheduleTaskCard } from '@/components/scheduler/schedule-task-card'
import { PropertyPanel } from '@/components/scheduler/property-panel'
import { startOfDay, toLocalDateStr, parseDateLocal } from '@/lib/date-utils'

function mondayOf(d: Date): Date {
    const x = startOfDay(d)
    const day = x.getDay()
    const diff = x.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(x.getFullYear(), x.getMonth(), diff)
}
function addDays(d: Date, n: number): Date {
    const x = new Date(d); x.setDate(x.getDate() + n); return x
}
function listDayLabel(key: string): string {
    const today = toLocalDateStr(startOfDay(new Date()))
    const tom = toLocalDateStr(addDays(new Date(), 1))
    if (key === today) return 'Today'
    if (key === tom) return 'Tomorrow'
    return parseDateLocal(key).toLocaleDateString('en-US', { weekday: 'long' })
}

type View = 'week' | 'day' | 'list'

export default function SchedulePage() {
    const { data: projects, mutate } = useSWR<Project[]>('/api/projects', fetcher)
    const { hoursPerDay, setHoursPerDay, compactCards, setCompactCards } = useSettings()

    const [view, setView] = useState<View>('week')
    const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()))
    const [panelOpen, setPanelOpen] = useState(false)
    const [hidden, setHidden] = useState<string[]>([])
    const [showCompleted, setShowCompleted] = useState(true)

    // Load persisted view prefs
    useEffect(() => {
        try {
            const h = localStorage.getItem('vance_hidden_projects')
            if (h) setHidden(JSON.parse(h))
            const sc = localStorage.getItem('vance_show_completed')
            if (sc !== null) setShowCompleted(sc === 'true')
        } catch { /* ignore */ }
    }, [])

    const toggleProject = (id: string) => {
        setHidden(h => {
            const next = h.includes(id) ? h.filter(x => x !== id) : [...h, id]
            localStorage.setItem('vance_hidden_projects', JSON.stringify(next))
            return next
        })
    }
    const updateShowCompleted = (v: boolean) => {
        setShowCompleted(v)
        localStorage.setItem('vance_show_completed', String(v))
    }

    if (!projects) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <p className="font-mono text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Building your schedule...</p>
            </div>
        )
    }

    const visibleProjects = projects.filter(p => !hidden.includes(p._id))
    const scheduledAll = buildSchedule(visibleProjects, { hoursPerDay })
    const scheduled = showCompleted ? scheduledAll : scheduledAll.filter(s => !s.done)
    const grouped = groupByDay(scheduled)
    const overdueCount = scheduledAll.filter(s => s.overdue).length

    const toggle = async (s: ScheduledTask) => {
        await fetch(`/api/projects/${s.projectId}/tasks/${s.task._id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !s.task.completed }),
        })
        mutate()
    }

    // ── Labels & nav ──
    const todayMid = startOfDay(new Date())
    const weekStart = mondayOf(cursor)
    const weekEnd = addDays(weekStart, 6)
    const isThisWeek = toLocalDateStr(weekStart) === toLocalDateStr(mondayOf(todayMid))
    const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
        ? `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.getDate()}`
        : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

    const dayKey = toLocalDateStr(cursor)
    const isToday = dayKey === toLocalDateStr(todayMid)
    const dayLabel = isToday ? 'Today' : cursor.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    const step = view === 'day' ? 1 : 7
    const atDefault = view === 'day' ? isToday : isThisWeek

    const VIEWS: { v: View; label: string; icon: any }[] = [
        { v: 'week', label: 'Week', icon: CalendarRange },
        { v: 'day', label: 'Day', icon: CalendarDays },
        { v: 'list', label: 'List', icon: LayoutList },
    ]

    return (
        <div className="flex flex-col min-h-full">
            <Header title="Schedule" subtitle="What to work on, and when.">
                <div className="flex border-2 border-border">
                    {VIEWS.map(({ v, label, icon: Icon }) => (
                        <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${view === v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Icon size={13} /> <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-border hover:border-foreground text-[10px] font-black uppercase tracking-widest transition-colors">
                    <SlidersHorizontal size={13} /> <span className="hidden sm:inline">Filters</span>
                    {hidden.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
            </Header>

            <div className="flex-1 w-full px-4 md:px-6 py-5 space-y-5">
                {/* Control bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {view !== 'list' ? (
                            <>
                                <button onClick={() => setCursor(d => addDays(d, -step))} className="p-2 border-2 border-border hover:border-foreground transition-colors" title="Previous">
                                    <ChevronLeft size={15} />
                                </button>
                                <div className="px-3 py-2 border-2 border-border min-w-[150px] text-center">
                                    <span className="text-sm font-black uppercase tracking-tight">
                                        {view === 'week' ? (isThisWeek ? 'This Week' : weekLabel) : dayLabel}
                                    </span>
                                </div>
                                <button onClick={() => setCursor(d => addDays(d, step))} className="p-2 border-2 border-border hover:border-foreground transition-colors" title="Next">
                                    <ChevronRight size={15} />
                                </button>
                                {!atDefault && (
                                    <button onClick={() => setCursor(startOfDay(new Date()))} className="px-3 py-2 border-2 border-border hover:border-foreground text-[10px] font-black uppercase tracking-widest transition-colors">
                                        Today
                                    </button>
                                )}
                            </>
                        ) : (
                            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                {scheduled.length} task{scheduled.length === 1 ? '' : 's'} planned
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hidden md:inline">
                        {hoursPerDay}h / day capacity
                    </span>
                </div>

                {/* Overdue heads-up */}
                {overdueCount > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 border-2 border-red-500/30 bg-red-500/10">
                        <AlertTriangle size={16} className="text-red-500 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wide text-red-500">
                            {overdueCount} task{overdueCount === 1 ? ' is' : 's are'} past their deadline — scheduled first so you can catch up.
                        </span>
                    </div>
                )}

                {/* Body */}
                {scheduledAll.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border bg-card/30 text-center">
                        <FolderKanban className="w-8 h-8 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-black uppercase text-foreground mb-2">
                            {hidden.length > 0 ? 'Everything is hidden' : 'Nothing to schedule yet'}
                        </h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wide max-w-sm mb-6">
                            {hidden.length > 0
                                ? 'All your projects are filtered out. Re-enable some in Filters.'
                                : 'Add tasks to your active projects and Vance lays out exactly what to do, day by day.'}
                        </p>
                        <Link href="/projects" className="px-6 py-2 border-2 border-foreground text-foreground uppercase font-bold text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors">
                            Go to Projects →
                        </Link>
                    </div>
                ) : view === 'week' ? (
                    <WeekView weekStart={weekStart} grouped={grouped} hoursPerDay={hoursPerDay} onToggle={toggle} compact={compactCards} />
                ) : view === 'day' ? (
                    <DailyView items={grouped.get(dayKey) || []} hoursPerDay={hoursPerDay} onToggle={toggle} compact={compactCards} />
                ) : (
                    <div className="max-w-2xl space-y-6">
                        {[...grouped.entries()].length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed border-border font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
                                Nothing matches your current filters.
                            </div>
                        ) : [...grouped.entries()].map(([key, rawItems]) => {
                            const items = [...rawItems].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0))
                            const dateObj = parseDateLocal(key)
                            const hours = items.filter(i => !i.done).reduce((s, it) => s + Math.max(0.5, it.task.estimatedHours || 1), 0)
                            return (
                                <div key={key} className="space-y-2.5">
                                    <div className="flex items-baseline justify-between border-b-2 border-border/30 pb-1.5">
                                        <h3 className="text-base font-black uppercase tracking-tighter">
                                            {listDayLabel(key)}
                                            <span className="ml-2 font-mono text-[11px] font-bold text-muted-foreground">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </h3>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{items.length} · {hours}h</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {items.map(item => (
                                            <ScheduleTaskCard key={item.task._id} item={item} onToggle={toggle} compact={compactCards} showDescription />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <PropertyPanel
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
                projects={projects}
                hidden={hidden}
                onToggleProject={toggleProject}
                hoursPerDay={hoursPerDay}
                setHoursPerDay={setHoursPerDay}
                compact={compactCards}
                setCompact={setCompactCards}
                showCompleted={showCompleted}
                setShowCompleted={updateShowCompleted}
            />
        </div>
    )
}

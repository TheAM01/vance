'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
    Loader2, ChevronLeft, ChevronRight, CalendarRange, CalendarDays, LayoutList,
    SlidersHorizontal, AlertTriangle, FolderKanban, Gauge,
} from '@/components/ui/icons'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { useSettings } from '@/components/theme/settings-provider'
import { buildSchedule, groupByDay, ScheduledTask } from '@/lib/scheduler'
import { WeekView } from '@/components/scheduler/week-view'
import { DailyView } from '@/components/scheduler/daily-view'
import { ScheduleTaskCard } from '@/components/scheduler/schedule-task-card'
import { PropertyPanel } from '@/components/scheduler/property-panel'
import { startOfDay, toLocalDateStr, parseDateLocal } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

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
            <div className="flex min-h-full flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Building your schedule…</p>
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
        <div className="flex min-h-full flex-col">
            <PageHeader title="Schedule" description="Your auto-built day-by-day plan." icon={CalendarRange}>
                <div className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5">
                    {VIEWS.map(({ v, label, icon: Icon }) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                                view === v ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="size-4" /> <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPanelOpen(true)} className="relative">
                    <SlidersHorizontal /> <span className="hidden sm:inline">Filters</span>
                    {hidden.length > 0 && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-primary" />}
                </Button>
            </PageHeader>

            <PageBody width="wide" className="space-y-5">
                {/* Control bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {view !== 'list' ? (
                            <>
                                <Button variant="outline" size="icon-sm" onClick={() => setCursor(d => addDays(d, -step))} aria-label="Previous">
                                    <ChevronLeft />
                                </Button>
                                <div className="flex h-8 min-w-[150px] items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground">
                                    {view === 'week' ? (isThisWeek ? 'This week' : weekLabel) : dayLabel}
                                </div>
                                <Button variant="outline" size="icon-sm" onClick={() => setCursor(d => addDays(d, step))} aria-label="Next">
                                    <ChevronRight />
                                </Button>
                                {!atDefault && (
                                    <Button variant="ghost" size="sm" onClick={() => setCursor(startOfDay(new Date()))}>
                                        Today
                                    </Button>
                                )}
                            </>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                {scheduled.length} task{scheduled.length === 1 ? '' : 's'} planned
                            </span>
                        )}
                    </div>
                    <span className="hidden items-center gap-1.5 text-sm tabular-nums text-muted-foreground md:inline-flex">
                        <Gauge className="size-4" /> {hoursPerDay}h / day capacity
                    </span>
                </div>

                {/* Overdue heads-up */}
                {overdueCount > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                        <AlertTriangle className="size-4 shrink-0 text-destructive" />
                        <span className="text-sm text-destructive">
                            {overdueCount} task{overdueCount === 1 ? ' is' : 's are'} past their deadline — scheduled first so you can catch up.
                        </span>
                    </div>
                )}

                {/* Body */}
                {scheduledAll.length === 0 ? (
                    <EmptyState
                        icon={FolderKanban}
                        title={hidden.length > 0 ? 'Everything is hidden' : 'Nothing to schedule yet'}
                        description={hidden.length > 0
                            ? 'All your projects are filtered out. Re-enable some in Filters.'
                            : 'Add tasks to your active projects and Vance lays out exactly what to do, day by day.'}
                        action={
                            <Button asChild>
                                <Link href="/projects">Go to projects</Link>
                            </Button>
                        }
                    />
                ) : view === 'week' ? (
                    <WeekView weekStart={weekStart} grouped={grouped} hoursPerDay={hoursPerDay} onToggle={toggle} compact={compactCards} />
                ) : view === 'day' ? (
                    <DailyView items={grouped.get(dayKey) || []} hoursPerDay={hoursPerDay} onToggle={toggle} compact={compactCards} />
                ) : (
                    <div className="max-w-2xl space-y-6">
                        {[...grouped.entries()].length === 0 ? (
                            <EmptyState
                                icon={LayoutList}
                                title="Nothing matches your filters"
                                description="Adjust your filters to see planned work."
                            />
                        ) : [...grouped.entries()].map(([key, rawItems]) => {
                            const items = [...rawItems].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0))
                            const dateObj = parseDateLocal(key)
                            const hours = items.filter(i => !i.done).reduce((s, it) => s + Math.max(0.5, it.task.estimatedHours || 1), 0)
                            return (
                                <div key={key} className="space-y-2.5">
                                    <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                                        <h3 className="font-heading text-base font-semibold text-foreground">
                                            {listDayLabel(key)}
                                            <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">
                                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </h3>
                                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{items.length} · {hours}h</span>
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
            </PageBody>

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

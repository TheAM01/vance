'use client'

import useSWR from 'swr'
import Link from 'next/link'
import {
    Loader2, FolderKanban, ListTodo, DollarSign, AlertTriangle, ArrowRight, CalendarRange,
    LayoutDashboard, CheckCircle2, ChevronRight,
} from '@/components/ui/icons'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { useSettings } from '@/components/theme/settings-provider'
import { ScheduleBoard } from '@/components/scheduler/schedule-board'
import { buildSchedule } from '@/lib/scheduler'
import { startOfDay, toLocalDateStr, parseDateLocal } from '@/lib/date-utils'

const TONE_CHIP = {
    primary: 'bg-accent text-primary',
    info: 'bg-[hsl(var(--chart-3)/0.14)] text-[hsl(var(--chart-3))]',
    highlight: 'bg-highlight/15 text-highlight',
    destructive: 'bg-destructive/12 text-destructive',
    success: 'bg-success/12 text-success',
} as const

function Metric({ label, value, icon: Icon, tone, sub }: { label: string; value: string | number; icon: any; tone: keyof typeof TONE_CHIP; sub?: string }) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TONE_CHIP[tone])}>
                        <Icon className="size-4" />
                    </div>
                </div>
                <div>
                    <div className="font-heading text-2xl font-semibold leading-none tabular-nums text-foreground md:text-3xl">{value}</div>
                    {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
                </div>
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
    const { data: projects } = useSWR<Project[]>('/api/projects', fetcher)
    const { hoursPerDay, currencySymbol } = useSettings()

    if (!projects) {
        return (
            <div className="flex min-h-full flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        )
    }

    const active = projects.filter(p => p.status === 'active')
    const live = projects.filter(p => p.status === 'active' || p.status === 'on-hold')

    const allTasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, _pColor: p.color, _pName: p.name, _pId: p._id, _pStatus: p.status })))
    const pendingTasks = allTasks.filter(t => !t.completed && (t._pStatus === 'active' || t._pStatus === 'on-hold'))

    const todayStr = toLocalDateStr(startOfDay(new Date()))
    const today = startOfDay(new Date())

    const overdue = pendingTasks.filter(t => t.deadline && parseDateLocal(t.deadline) < today).length

    const pendingRevenue = projects
        .filter(p => !p.paid && p.status !== 'cancelled')
        .reduce((s, p) => s + (Number(p.amount) || 0) + (p.changes || []).reduce((a, c) => a + (Number(c.amount) || 0), 0), 0)

    const currency = currencySymbol

    const scheduled = buildSchedule(projects, { hoursPerDay })
    const todays = scheduled.filter(s => s.date === todayStr && !s.done)
    const focusHours = todays.reduce((s, t) => s + Math.max(0.5, t.task.estimatedHours || 1), 0)

    return (
        <div className="flex min-h-full flex-col">
            <PageHeader title="Dashboard" description="Your freelance operation at a glance." icon={LayoutDashboard}>
                <Button asChild variant="outline">
                    <Link href="/projects"><FolderKanban /> Projects</Link>
                </Button>
            </PageHeader>

            <PageBody width="wide">
                <div className="space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Metric label="Active Projects" value={active.length} icon={FolderKanban} tone="primary" sub={`${projects.length} total`} />
                        <Metric label="Pending Tasks" value={pendingTasks.length} icon={ListTodo} tone="info" sub={`across ${live.length} projects`} />
                        <Metric label="Pending Revenue" value={formatMoney(pendingRevenue, currency)} icon={DollarSign} tone="highlight" sub="unpaid + changes" />
                        <Metric label="Overdue Tasks" value={overdue} icon={AlertTriangle} tone={overdue ? 'destructive' : 'success'} sub={overdue ? 'needs attention' : 'all clear'} />
                    </div>

                    {/* Today's focus */}
                    <Card>
                        <CardHeader
                            action={
                                <span className="text-sm tabular-nums text-muted-foreground">
                                    {todays.length} {todays.length === 1 ? 'task' : 'tasks'} · {focusHours}h
                                </span>
                            }
                        >
                            <CardTitle>Today&apos;s Focus</CardTitle>
                        </CardHeader>
                        {todays.length === 0 ? (
                            <CardContent>
                                <EmptyState icon={CheckCircle2} title="Nothing scheduled today" description="Enjoy the breathing room." />
                            </CardContent>
                        ) : (
                            <CardContent className="p-2">
                                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                                    {todays.map(s => (
                                        <Link
                                            key={s.task._id}
                                            href={`/projects/${s.projectId}`}
                                            className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60"
                                        >
                                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.projectColor }} />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-foreground">{s.task.title}</div>
                                                <div className="truncate text-xs text-muted-foreground">{s.projectName} · {Math.max(0.5, s.task.estimatedHours || 1)}h · {s.task.priority}</div>
                                            </div>
                                            {(s.overdue || s.atRisk) && (
                                                <Badge variant={s.overdue ? 'destructive' : 'warning'}>
                                                    <AlertTriangle /> {s.overdue ? 'Overdue' : 'At risk'}
                                                </Badge>
                                            )}
                                            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Upcoming schedule */}
                    <Card>
                        <CardHeader
                            action={
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/schedule">Full schedule <ArrowRight /></Link>
                                </Button>
                            }
                        >
                            <CardTitle className="flex items-center gap-2"><CalendarRange className="size-[18px]" /> Upcoming Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScheduleBoardWrapper projects={projects} hoursPerDay={hoursPerDay} />
                        </CardContent>
                    </Card>
                </div>
            </PageBody>
        </div>
    )
}

function ScheduleBoardWrapper({ projects, hoursPerDay }: { projects: Project[]; hoursPerDay: number }) {
    const { mutate } = useSWR<Project[]>('/api/projects', fetcher)
    return <ScheduleBoard projects={projects} hoursPerDay={hoursPerDay} days={4} onChange={() => mutate()} />
}

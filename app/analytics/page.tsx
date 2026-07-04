'use client'

import useSWR from 'swr'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import {
    Loader2, DollarSign, FolderKanban, CheckCircle2, Clock, AlertTriangle,
    Layers, GitPullRequestArrow, Wallet, Hourglass, Radio, Building2, BarChart3,
} from '@/components/ui/icons'

const STATUS_META: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'hsl(var(--chart-3))' },
    completed: { label: 'Completed', color: 'hsl(var(--chart-4))' },
    'on-hold': { label: 'On Hold', color: 'hsl(var(--chart-2))' },
    cancelled: { label: 'Cancelled', color: 'hsl(var(--chart-5))' },
}

const FIELD_COLORS = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
]

const TONE_CHIP = {
    primary: 'bg-accent text-primary',
    highlight: 'bg-highlight/15 text-highlight',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/15 text-warning',
} as const

function MetricCard({ title, value, icon: Icon, extra, tone = 'primary' }: {
    title: string
    value: string | number
    icon: any
    extra?: string
    tone?: keyof typeof TONE_CHIP
}) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{title}</span>
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TONE_CHIP[tone])}>
                        <Icon className="size-4" />
                    </div>
                </div>
                <div>
                    <div className="font-heading text-2xl font-semibold leading-none tabular-nums text-foreground md:text-3xl">{value}</div>
                    {extra && <div className="mt-1.5 text-xs text-muted-foreground">{extra}</div>}
                </div>
            </CardContent>
        </Card>
    )
}

function SectionHeader({ title }: { title: string }) {
    return <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">{title}</h2>
}

export default function AnalyticsPage() {
    const { data: projects, error } = useSWR<Project[]>('/api/projects', fetcher)

    if (error) {
        return (
            <div className="flex min-h-full flex-col">
                <PageHeader title="Analytics" description="Revenue, time, and delivery insights." icon={BarChart3} />
                <PageBody width="wide">
                    <EmptyState icon={AlertTriangle} title="Couldn't load analytics" description={error.message} />
                </PageBody>
            </div>
        )
    }

    if (!projects) {
        return (
            <div className="flex min-h-full flex-col">
                <PageHeader title="Analytics" description="Revenue, time, and delivery insights." icon={BarChart3} />
                <PageBody width="wide">
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading…</p>
                    </div>
                </PageBody>
            </div>
        )
    }

    const currency = projects[0]?.currency || '$'
    const money = (n: number) => formatMoney(Math.round(n), currency)

    const projectValue = (p: Project) => (Number(p.amount) || 0) + (p.changes || []).reduce((a, c) => a + (Number(c.amount) || 0), 0)

    const byStatus: Record<string, number> = {}
    let totalRevenue = 0, earnedRevenue = 0, pendingRevenue = 0, changeRevenue = 0
    let totalTasks = 0, completedTasks = 0, totalHours = 0, completedHours = 0
    let totalChanges = 0
    const fieldStats: Record<string, { count: number; hours: number; revenue: number }> = {}
    const sourceStats: Record<string, { count: number; revenue: number }> = {}
    const clientTypeStats: Record<string, number> = {}
    const changesByClient: Record<string, number> = {}

    for (const p of projects) {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1
        const val = projectValue(p)
        const changeExtra = (p.changes || []).reduce((a, c) => a + (Number(c.amount) || 0), 0)
        changeRevenue += changeExtra

        if (p.status !== 'cancelled') {
            totalRevenue += val
            if (p.paid) earnedRevenue += val
            else pendingRevenue += val
        }

        for (const t of p.tasks || []) {
            totalTasks++
            const h = Number(t.estimatedHours) || 0
            totalHours += h
            if (t.completed) { completedTasks++; completedHours += h }
        }

        totalChanges += (p.changes || []).length
        if (p.clientName) changesByClient[p.clientName] = (changesByClient[p.clientName] || 0) + (p.changes || []).length

        const phours = (p.tasks || []).reduce((a, t) => a + (Number(t.estimatedHours) || 0), 0)
        for (const f of p.fields || []) {
            if (!fieldStats[f]) fieldStats[f] = { count: 0, hours: 0, revenue: 0 }
            fieldStats[f].count++
            fieldStats[f].hours += phours
            fieldStats[f].revenue += val
        }

        const src = p.source || 'Direct'
        if (!sourceStats[src]) sourceStats[src] = { count: 0, revenue: 0 }
        sourceStats[src].count++
        sourceStats[src].revenue += val

        clientTypeStats[p.clientType || 'Individual'] = (clientTypeStats[p.clientType || 'Individual'] || 0) + 1
    }

    const activeCount = byStatus['active'] || 0
    const completedCount = byStatus['completed'] || 0
    const avgChanges = projects.length ? (totalChanges / projects.length) : 0

    const rankedFields = Object.entries(fieldStats).sort((a, b) => b[1].hours - a[1].hours)
    const maxFieldHours = Math.max(...rankedFields.map(f => f[1].hours), 1)

    const rankedSources = Object.entries(sourceStats).sort((a, b) => b[1].revenue - a[1].revenue)
    const maxSourceRev = Math.max(...rankedSources.map(s => s[1].revenue), 1)

    const topChangeClient = Object.entries(changesByClient).sort((a, b) => b[1] - a[1])[0]

    const leaderboard = [...projects]
        .filter(p => p.status !== 'cancelled')
        .map(p => ({ p, value: projectValue(p) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    const maxValue = Math.max(...leaderboard.map(l => l.value), 1)

    const statusEntries = Object.entries(byStatus)

    return (
        <div className="flex min-h-full flex-col">
            <PageHeader title="Analytics" description="Revenue, time, and delivery insights." icon={BarChart3} />

            <PageBody width="wide">
                <div className="space-y-10">

                    {/* Global Overview */}
                    <section className="space-y-4">
                        <SectionHeader title="Global Overview" />
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <MetricCard title="Total Pipeline" value={money(totalRevenue)} icon={DollarSign} tone="primary" extra="Across all live projects" />
                            <MetricCard title="Earned" value={money(earnedRevenue)} icon={Wallet} tone="success" extra="Marked as paid" />
                            <MetricCard title="Pending" value={money(pendingRevenue)} icon={Hourglass} tone="warning" extra="Awaiting payment" />
                            <MetricCard title="Active Projects" value={activeCount} icon={FolderKanban} tone="primary" extra={`${completedCount} completed`} />
                        </div>
                    </section>

                    {/* Earnings banner */}
                    <Card className="border-transparent bg-primary text-primary-foreground shadow-elevated">
                        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
                            <div className="space-y-1.5">
                                <h3 className="font-heading text-lg font-semibold text-primary-foreground">Total Earned to Date</h3>
                                <p className="text-sm text-primary-foreground/70">{money(changeRevenue)} of it from change requests</p>
                            </div>
                            <div className="font-heading text-4xl font-semibold leading-none tabular-nums md:text-6xl">{money(earnedRevenue)}</div>
                        </CardContent>
                    </Card>

                    {/* Workload */}
                    <section className="space-y-4">
                        <SectionHeader title="Workload" />
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <MetricCard title="Total Tasks" value={totalTasks} icon={Layers} tone="primary" extra={`${completedTasks} completed`} />
                            <MetricCard title="Completion" value={`${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%`} icon={CheckCircle2} tone="success" extra="Of all tasks" />
                            <MetricCard title="Hours Logged" value={`${Math.round(completedHours)}h`} icon={Clock} tone="primary" extra={`of ${Math.round(totalHours)}h planned`} />
                            <MetricCard title="Total Changes" value={totalChanges} icon={GitPullRequestArrow} tone="highlight" extra={`${avgChanges.toFixed(1)} avg / project`} />
                        </div>
                    </section>

                    {/* Fields + Sources */}
                    <section className="space-y-4">
                        <SectionHeader title="Where Your Time Goes" />
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Fields */}
                            <Card>
                                <CardHeader
                                    action={
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                                            <Layers className="size-4" />
                                        </div>
                                    }
                                >
                                    <CardTitle>Fields You Work In Most</CardTitle>
                                    <CardDescription>By planned hours</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {rankedFields.length === 0 ? (
                                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No field data</div>
                                    ) : (
                                        <div className="space-y-3.5">
                                            {rankedFields.slice(0, 8).map(([field, s], i) => (
                                                <div key={field} className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2 text-sm">
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: FIELD_COLORS[i % FIELD_COLORS.length] }} />
                                                            <span className="truncate font-medium text-foreground">{field}</span>
                                                            <span className="shrink-0 text-muted-foreground">· {s.count} proj</span>
                                                        </span>
                                                        <span className="shrink-0 tabular-nums text-muted-foreground">{Math.round(s.hours)}h</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.hours / maxFieldHours) * 100}%`, backgroundColor: FIELD_COLORS[i % FIELD_COLORS.length] }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sources */}
                            <Card>
                                <CardHeader
                                    action={
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-highlight/15 text-highlight">
                                            <Radio className="size-4" />
                                        </div>
                                    }
                                >
                                    <CardTitle>Revenue by Source</CardTitle>
                                    <CardDescription>Where leads come from</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {rankedSources.length === 0 ? (
                                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No source data</div>
                                    ) : (
                                        <div className="space-y-3.5">
                                            {rankedSources.map(([src, s]) => (
                                                <div key={src} className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2 text-sm">
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                                                            <span className="truncate font-medium text-foreground">{src}</span>
                                                            <span className="shrink-0 text-muted-foreground">· {s.count}</span>
                                                        </span>
                                                        <span className="shrink-0 tabular-nums text-muted-foreground">{money(s.revenue)}</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.revenue / maxSourceRev) * 100}%`, backgroundColor: 'hsl(var(--chart-2))' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Status + Client + Changes */}
                    <section className="space-y-4">
                        <SectionHeader title="Portfolio Breakdown" />
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {/* Status split */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3.5">
                                        {statusEntries.map(([st, count]) => {
                                            const meta = STATUS_META[st] || { label: st, color: 'hsl(var(--muted-foreground))' }
                                            const pct = projects.length ? Math.round((count / projects.length) * 100) : 0
                                            return (
                                                <div key={st} className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2 text-sm">
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                                                            <span className="truncate font-medium text-foreground">{meta.label}</span>
                                                            <span className="shrink-0 tabular-nums text-muted-foreground">({count})</span>
                                                        </span>
                                                        <span className="shrink-0 tabular-nums text-muted-foreground">{pct}%</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Client types */}
                            <Card>
                                <CardHeader
                                    action={<Building2 className="size-[18px] text-muted-foreground" />}
                                >
                                    <CardTitle>Client Types</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        {Object.entries(clientTypeStats).sort((a, b) => b[1] - a[1]).map(([ct, count]) => (
                                            <div key={ct} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
                                                <span className="text-sm font-medium text-foreground">{ct}</span>
                                                <span className="font-heading text-lg font-semibold tabular-nums text-foreground">{count}</span>
                                            </div>
                                        ))}
                                        {Object.keys(clientTypeStats).length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Changes */}
                            <Card>
                                <CardHeader
                                    action={<GitPullRequestArrow className="size-[18px] text-muted-foreground" />}
                                >
                                    <CardTitle>Change Requests</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="font-heading text-3xl font-semibold leading-none tabular-nums text-foreground">{totalChanges}</div>
                                        <div className="mt-1.5 text-xs text-muted-foreground">Total changes · {money(changeRevenue)} billed</div>
                                    </div>
                                    {topChangeClient && (
                                        <div className="border-t border-border pt-3">
                                            <div className="text-xs text-muted-foreground">Most demanding client</div>
                                            <div className="mt-1 text-sm font-medium text-foreground">{topChangeClient[0]}</div>
                                            <div className="text-xs text-muted-foreground"><span className="tabular-nums">{topChangeClient[1]}</span> change requests</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Leaderboard */}
                    <section className="space-y-4">
                        <SectionHeader title="Top Projects by Value" />
                        {leaderboard.length === 0 ? (
                            <EmptyState icon={FolderKanban} title="No projects yet" description="Value rankings will appear here once you add projects." />
                        ) : (
                            <Card>
                                <CardContent className="space-y-1">
                                    {leaderboard.map(({ p, value }, idx) => (
                                        <div key={p._id} className="group grid grid-cols-12 items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
                                            <div className="col-span-1 font-heading text-lg font-semibold tabular-nums text-muted-foreground/60 transition-colors group-hover:text-foreground">{String(idx + 1).padStart(2, '0')}</div>
                                            <div className="col-span-5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                                                    <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                                                </div>
                                                <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.clientName || '—'} · {p.status}</div>
                                            </div>
                                            <div className="col-span-4">
                                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: p.color }} />
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-1.5">
                                                {!p.paid && <Hourglass className="size-3.5 text-warning" />}
                                                <span className="font-heading text-sm font-semibold tabular-nums text-foreground">{money(value)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </section>

                </div>
            </PageBody>
        </div>
    )
}

'use client'

import useSWR from 'swr'
import { Header } from '@/components/layout/header'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import {
    Loader2, DollarSign, FolderKanban, CheckCircle2, Clock, AlertTriangle,
    TrendingUp, Layers, GitPullRequestArrow, Wallet, Hourglass, Trophy, Radio, Building2,
} from 'lucide-react'

const STATUS_META: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: '#3b82f6' },
    completed: { label: 'Completed', color: '#10b981' },
    'on-hold': { label: 'On Hold', color: '#f59e0b' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
}

const FIELD_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#9333ea', '#ef4444', '#0891b2', '#ea580c', '#16a34a']

function MetricCard({ title, value, icon: Icon, extra, colorClass }: any) {
    return (
        <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.08)] transition-all">
            <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{title}</span>
                <div className={`p-2 rounded-sm ${colorClass}`}><Icon size={20} strokeWidth={2.5} /></div>
            </div>
            <div className="mt-auto">
                <span className="text-4xl font-black tracking-tighter text-foreground leading-none">{value}</span>
                {extra && <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{extra}</div>}
            </div>
        </div>
    )
}

function SectionHeader({ title, accent }: { title: string; accent?: string }) {
    return (
        <div className="flex items-center gap-4 border-b-2 border-border/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter" style={accent ? { color: accent } : undefined}>{title}</h2>
            <div className="h-1 flex-1" style={{ backgroundColor: accent ? `${accent}1A` : 'rgba(0,0,0,0.05)' }} />
        </div>
    )
}

export default function AnalyticsPage() {
    const { data: projects, error } = useSWR<Project[]>('/api/projects', fetcher)

    if (error) {
        return (
            <div className="min-h-full flex items-center justify-center p-6">
                <div className="bg-red-500/10 border-2 border-red-500 p-8 max-w-lg text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4 w-12 h-12" />
                    <h2 className="text-xl font-black uppercase text-red-500 mb-2">Error Loading Analytics</h2>
                    <p className="text-sm font-bold text-red-500/70 uppercase font-mono">{error.message}</p>
                </div>
            </div>
        )
    }

    if (!projects) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <p className="font-mono text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Computing Matrix...</p>
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
        <div className="flex flex-col min-h-full">
            <Header title="Analytics Center" subtitle="Your freelance operation, quantified." hideOnMobile />

            <div className="flex-1 p-6">
                <div className="max-w-[1400px] mx-auto space-y-12 pb-24">

                    {/* Global Overview */}
                    <div className="space-y-4">
                        <SectionHeader title="Global Overview" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Pipeline" value={money(totalRevenue)} icon={DollarSign} colorClass="bg-indigo-500/10 text-indigo-500" extra="Across all live projects" />
                            <MetricCard title="Earned" value={money(earnedRevenue)} icon={Wallet} colorClass="bg-green-500/10 text-green-500" extra="Marked as paid" />
                            <MetricCard title="Pending" value={money(pendingRevenue)} icon={Hourglass} colorClass="bg-amber-500/10 text-amber-500" extra="Awaiting payment" />
                            <MetricCard title="Active Projects" value={activeCount} icon={FolderKanban} colorClass="bg-blue-500/10 text-blue-500" extra={`${completedCount} completed`} />
                        </div>
                    </div>

                    {/* Earnings banner */}
                    <div className="bg-foreground text-background p-8 lg:p-12 relative overflow-hidden border-2 border-border/20 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="absolute inset-0 opacity-10 bg-[url('/textures/hexellence.png')] mix-blend-overlay" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-2">
                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-background/80">Total Earned to Date</h3>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">{money(changeRevenue)} of it from change requests</p>
                            </div>
                            <div className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{money(earnedRevenue)}</div>
                        </div>
                    </div>

                    {/* Workload */}
                    <div className="space-y-4 pt-4 border-t-2 border-border/10">
                        <SectionHeader title="Workload" accent="#10b981" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <MetricCard title="Total Tasks" value={totalTasks} icon={Layers} colorClass="bg-teal-500/10 text-teal-500" extra={`${completedTasks} completed`} />
                            <MetricCard title="Completion" value={`${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%`} icon={CheckCircle2} colorClass="bg-green-500/10 text-green-500" extra="Of all tasks" />
                            <MetricCard title="Hours Logged" value={`${Math.round(completedHours)}h`} icon={Clock} colorClass="bg-cyan-500/10 text-cyan-500" extra={`of ${Math.round(totalHours)}h planned`} />
                            <MetricCard title="Total Changes" value={totalChanges} icon={GitPullRequestArrow} colorClass="bg-purple-500/10 text-purple-500" extra={`${avgChanges.toFixed(1)} avg / project`} />
                        </div>
                    </div>

                    {/* Fields + Sources */}
                    <div className="space-y-6 pt-4 border-t-2 border-border/10">
                        <SectionHeader title="Where Your Time Goes" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Fields */}
                            <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-black uppercase tracking-tight">Fields You Work In Most</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">By planned hours</p>
                                    </div>
                                    <div className="p-2 rounded-sm bg-blue-500/10 text-blue-500"><Layers size={20} strokeWidth={2.5} /></div>
                                </div>
                                {rankedFields.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center text-muted-foreground font-mono uppercase tracking-widest font-bold text-xs">No field data</div>
                                ) : (
                                    <div className="space-y-3">
                                        {rankedFields.slice(0, 8).map(([field, s], i) => (
                                            <div key={field} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                    <span>{field} <span className="text-muted-foreground/60">· {s.count} proj</span></span>
                                                    <span className="text-muted-foreground">{Math.round(s.hours)}h</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-muted/30 overflow-hidden">
                                                    <div className="h-full transition-all duration-700" style={{ width: `${(s.hours / maxFieldHours) * 100}%`, backgroundColor: FIELD_COLORS[i % FIELD_COLORS.length] }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sources */}
                            <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-black uppercase tracking-tight">Revenue by Source</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">Where leads come from</p>
                                    </div>
                                    <div className="p-2 rounded-sm bg-amber-500/10 text-amber-500"><Radio size={20} strokeWidth={2.5} /></div>
                                </div>
                                {rankedSources.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center text-muted-foreground font-mono uppercase tracking-widest font-bold text-xs">No source data</div>
                                ) : (
                                    <div className="space-y-3">
                                        {rankedSources.map(([src, s], i) => (
                                            <div key={src} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                    <span>{src} <span className="text-muted-foreground/60">· {s.count}</span></span>
                                                    <span className="text-muted-foreground">{money(s.revenue)}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-muted/30 overflow-hidden">
                                                    <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${(s.revenue / maxSourceRev) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status + Client + Changes */}
                    <div className="space-y-4 pt-4 border-t-2 border-border/10">
                        <SectionHeader title="Portfolio Breakdown" accent="#9333ea" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Status split */}
                            <div className="bg-card border-2 border-border p-6">
                                <h3 className="text-base font-black uppercase tracking-tight mb-5">Project Status</h3>
                                <div className="space-y-3">
                                    {statusEntries.map(([st, count]) => {
                                        const meta = STATUS_META[st] || { label: st, color: '#888' }
                                        const pct = projects.length ? Math.round((count / projects.length) * 100) : 0
                                        return (
                                            <div key={st} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                    <span style={{ color: meta.color }}>{meta.label} ({count})</span>
                                                    <span className="text-muted-foreground">{pct}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-muted/30 overflow-hidden">
                                                    <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Client types */}
                            <div className="bg-card border-2 border-border p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base font-black uppercase tracking-tight">Client Types</h3>
                                    <Building2 size={18} className="text-muted-foreground" />
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(clientTypeStats).sort((a, b) => b[1] - a[1]).map(([ct, count]) => (
                                        <div key={ct} className="flex items-center justify-between border-b border-border/40 pb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider">{ct}</span>
                                            <span className="text-lg font-black tracking-tighter">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(clientTypeStats).length === 0 && <p className="text-xs font-mono text-muted-foreground uppercase">No data</p>}
                                </div>
                            </div>

                            {/* Changes */}
                            <div className="bg-card border-2 border-border p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base font-black uppercase tracking-tight">Change Requests</h3>
                                    <GitPullRequestArrow size={18} className="text-muted-foreground" />
                                </div>
                                <div className="space-y-4 mt-auto">
                                    <div>
                                        <div className="text-4xl font-black tracking-tighter">{totalChanges}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total changes · {money(changeRevenue)} billed</div>
                                    </div>
                                    {topChangeClient && (
                                        <div className="pt-3 border-t-2 border-border/10">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Most Demanding Client</div>
                                            <div className="text-sm font-black uppercase tracking-tight mt-1">{topChangeClient[0]}</div>
                                            <div className="text-[10px] font-mono text-muted-foreground">{topChangeClient[1]} change requests</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="space-y-6 pt-4 border-t-2 border-border/10">
                        <SectionHeader title="Top Projects by Value" />
                        {leaderboard.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground font-mono uppercase tracking-widest font-bold border-2 border-dashed border-border/50">No projects yet</div>
                        ) : (
                            <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                                <div className="space-y-3">
                                    {leaderboard.map(({ p, value }, idx) => (
                                        <div key={p._id} className="grid grid-cols-12 items-center gap-4 py-2 group">
                                            <div className="col-span-1 text-2xl font-black tracking-tighter text-muted-foreground/40 group-hover:text-foreground transition-colors">{String(idx + 1).padStart(2, '0')}</div>
                                            <div className="col-span-5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                                    <span className="text-sm font-black uppercase tracking-tight truncate">{p.name}</span>
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-muted-foreground/70 mt-0.5">{p.clientName || '—'} · {p.status}</div>
                                            </div>
                                            <div className="col-span-4">
                                                <div className="w-full h-3 bg-muted/30 border border-border/10 overflow-hidden">
                                                    <div className="h-full transition-all duration-700" style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: p.color }} />
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-2">
                                                {!p.paid && <Hourglass size={12} className="text-amber-500" />}
                                                <span className="text-base font-black tracking-tighter tabular-nums">{money(value)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

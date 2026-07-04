'use client'

import useSWR from 'swr'
import Link from 'next/link'
import {
    Loader2, FolderKanban, ListTodo, DollarSign, AlertTriangle, ArrowRight, CalendarRange,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { fetcher } from '@/lib/swr-fetcher'
import { Project } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { useSettings } from '@/components/theme/settings-provider'
import { ScheduleBoard } from '@/components/scheduler/schedule-board'
import { buildSchedule } from '@/lib/scheduler'
import { startOfDay, toLocalDateStr, parseDateLocal } from '@/lib/date-utils'

function Metric({ label, value, icon: Icon, accent, sub }: { label: string; value: string | number; icon: any; accent: string; sub?: string }) {
    return (
        <div className="bg-card border-2 border-border p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
                <div className="p-1.5 rounded-sm" style={{ backgroundColor: `${accent}1A`, color: accent }}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
            </div>
            <div className="mt-auto">
                <span className="text-3xl font-black tracking-tighter leading-none">{value}</span>
                {sub && <div className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{sub}</div>}
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { data: projects } = useSWR<Project[]>('/api/projects', fetcher)
    const { hoursPerDay } = useSettings()

    if (!projects) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <p className="font-mono text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Loading...</p>
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

    const currency = projects[0]?.currency || '$'

    const scheduled = buildSchedule(projects, { hoursPerDay })
    const todays = scheduled.filter(s => s.date === todayStr && !s.done)

    return (
        <div className="flex flex-col min-h-full">
            <Header title="Dashboard" subtitle="Your freelance operation at a glance.">
                <Link href="/projects" className="flex items-center gap-2 px-5 py-2 bg-foreground text-background border-2 border-foreground font-bold text-sm uppercase tracking-wide h-10 rounded-sm hover:bg-background hover:text-foreground transition-colors">
                    <FolderKanban size={16} /> Projects
                </Link>
            </Header>

            <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 space-y-8">
                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Metric label="Active Projects" value={active.length} icon={FolderKanban} accent="#3b82f6" sub={`${projects.length} total`} />
                    <Metric label="Pending Tasks" value={pendingTasks.length} icon={ListTodo} accent="#10b981" sub={`across ${live.length} projects`} />
                    <Metric label="Pending Revenue" value={formatMoney(pendingRevenue, currency)} icon={DollarSign} accent="#f59e0b" sub="unpaid + changes" />
                    <Metric label="Overdue Tasks" value={overdue} icon={AlertTriangle} accent="#ef4444" sub={overdue ? 'needs attention' : 'all clear'} />
                </div>

                {/* Today's focus */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-border/10 pb-3">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Today&apos;s Focus</h2>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{todays.length} tasks · {todays.reduce((s, t) => s + Math.max(0.5, t.task.estimatedHours || 1), 0)}h</span>
                    </div>
                    {todays.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-border text-muted-foreground text-sm font-mono uppercase tracking-widest">
                            Nothing scheduled for today. Enjoy the breathing room.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {todays.map(s => (
                                <Link key={s.task._id} href={`/projects/${s.projectId}`} className="flex items-center gap-3 p-3 border-2 border-border bg-card hover:border-foreground transition-colors group">
                                    <span className="w-1.5 h-10 shrink-0" style={{ background: s.projectColor }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate">{s.task.title}</div>
                                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">{s.projectName} · {Math.max(0.5, s.task.estimatedHours || 1)}h · {s.task.priority}</div>
                                    </div>
                                    {(s.overdue || s.atRisk) && <AlertTriangle size={14} className={s.overdue ? 'text-red-500' : 'text-amber-500'} />}
                                    <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming schedule */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-border/10 pb-3">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><CalendarRange size={18} /> Upcoming Schedule</h2>
                        <Link href="/schedule" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            Full schedule <ArrowRight size={12} />
                        </Link>
                    </div>
                    <ScheduleBoardWrapper projects={projects} hoursPerDay={hoursPerDay} />
                </div>
            </div>
        </div>
    )
}

function ScheduleBoardWrapper({ projects, hoursPerDay }: { projects: Project[]; hoursPerDay: number }) {
    const { mutate } = useSWR<Project[]>('/api/projects', fetcher)
    return <ScheduleBoard projects={projects} hoursPerDay={hoursPerDay} days={4} onChange={() => mutate()} />
}

'use client'

// Self-contained, theme-toggleable mock UIs rendered inside the landing-page
// browser windows. They intentionally use explicit neutral colors (not theme
// CSS vars) so the per-window light/dark toggle works regardless of page theme.

type Kind = 'schedule' | 'projects' | 'analytics'

export function DashboardMock({ kind, isDark }: { kind: Kind; isDark: boolean }) {
    const t = isDark
        ? {
            bg: 'bg-neutral-950', panel: 'bg-neutral-900', sub: 'bg-neutral-800/60',
            text: 'text-neutral-100', muted: 'text-neutral-500', border: 'border-neutral-800',
            line: 'bg-neutral-800',
        }
        : {
            bg: 'bg-neutral-50', panel: 'bg-white', sub: 'bg-neutral-100',
            text: 'text-neutral-900', muted: 'text-neutral-400', border: 'border-neutral-200',
            line: 'bg-neutral-200',
        }

    if (kind === 'schedule') return <ScheduleMock t={t} />
    if (kind === 'projects') return <ProjectsMock t={t} />
    return <AnalyticsMock t={t} />
}

function ScheduleMock({ t }: { t: any }) {
    const days = [
        {
            label: 'TODAY', sub: '6.0 / 6h',
            tasks: [
                { c: '#3b82f6', p: 'Acme Store', n: 'Cart checkout flow', h: '2h', hi: true },
                { c: '#10b981', p: 'Folio', n: 'Hero animation pass', h: '1.5h' },
                { c: '#f59e0b', p: 'CRM Lite', n: 'Auth + sessions', h: '2.5h' },
            ],
        },
        {
            label: 'TOMORROW', sub: '5.0 / 6h',
            tasks: [
                { c: '#3b82f6', p: 'Acme Store', n: 'Stripe webhooks', h: '3h' },
                { c: '#9333ea', p: 'Nimbus', n: 'Landing copy review', h: '2h' },
            ],
        },
        {
            label: 'WED', sub: '4.0 / 6h',
            tasks: [
                { c: '#10b981', p: 'Folio', n: 'Deploy + QA', h: '1.5h' },
                { c: '#dc2626', p: 'CRM Lite', n: 'Bugfix: timezone', h: '1h', risk: true },
                { c: '#f59e0b', p: 'CRM Lite', n: 'Dashboard widgets', h: '1.5h' },
            ],
        },
    ]
    return (
        <div className={`h-full w-full ${t.bg} ${t.text} p-4 flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-[11px] font-black uppercase tracking-widest">Auto Schedule</div>
                    <div className={`text-[8px] font-mono uppercase tracking-widest ${t.muted}`}>9 tasks · 3 projects · 6h / day</div>
                </div>
                <div className="flex gap-1">
                    <div className={`px-2 py-1 text-[7px] font-black uppercase tracking-widest ${t.sub}`}>Weekly</div>
                    <div className="px-2 py-1 text-[7px] font-black uppercase tracking-widest bg-foreground text-background" style={{ background: '#111', color: '#fff' }}>Daily</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1">
                {days.map((d) => (
                    <div key={d.label} className={`${t.panel} border ${t.border} p-2 flex flex-col`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span>
                            <span className={`text-[7px] font-mono ${t.muted}`}>{d.sub}</span>
                        </div>
                        <div className="space-y-1.5">
                            {d.tasks.map((task, i) => (
                                <div key={i} className={`${t.sub} border-l-2 p-1.5`} style={{ borderColor: task.c }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black uppercase tracking-wider truncate">{task.n}</span>
                                        <span className={`text-[7px] font-mono ${t.muted} ml-1 shrink-0`}>{task.h}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="w-1 h-1 rounded-full" style={{ background: task.c }} />
                                        <span className={`text-[7px] font-mono uppercase ${t.muted}`}>{task.p}</span>
                                        {task.risk && <span className="text-[6px] font-black uppercase text-red-500 ml-auto">At Risk</span>}
                                        {task.hi && <span className="text-[6px] font-black uppercase text-blue-500 ml-auto">Now</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProjectsMock({ t }: { t: any }) {
    const projects = [
        { c: '#3b82f6', n: 'Acme Store', client: 'Acme Inc · Agency', amt: '$4,200', st: 'Active', tasks: '6/14', f: ['Frontend', 'Stripe'] },
        { c: '#10b981', n: 'Folio Portfolio', client: 'J. Rivera · Individual', amt: '$1,800', st: 'Active', tasks: '9/11', f: ['Design', 'Next.js'] },
        { c: '#f59e0b', n: 'CRM Lite', client: 'Northwind · Startup', amt: '$6,500', st: 'Active', tasks: '3/22', f: ['Fullstack'] },
        { c: '#9333ea', n: 'Nimbus Landing', client: 'Nimbus · Startup', amt: '$2,400', st: 'On Hold', tasks: '4/8', f: ['Frontend'] },
        { c: '#16a34a', n: 'Mainframe API', client: 'Volt · Enterprise', amt: '$9,000', st: 'Completed', tasks: '18/18', f: ['Backend', 'AWS'] },
        { c: '#dc2626', n: 'Bistro Site', client: 'Bistro 9 · Individual', amt: '$1,200', st: 'Active', tasks: '2/7', f: ['Webflow'] },
    ]
    return (
        <div className={`h-full w-full ${t.bg} ${t.text} p-4 flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-black uppercase tracking-widest">Projects</div>
                <div className="px-2 py-1 text-[7px] font-black uppercase tracking-widest" style={{ background: '#111', color: '#fff' }}>+ New Project</div>
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1">
                {projects.map((p) => (
                    <div key={p.n} className={`${t.panel} border ${t.border} border-l-[3px] p-2 flex flex-col`} style={{ borderLeftColor: p.c }}>
                        <div className="text-[9px] font-black uppercase tracking-tight truncate">{p.n}</div>
                        <div className={`text-[7px] font-mono uppercase ${t.muted} mt-0.5 truncate`}>{p.client}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {p.f.map((f) => (
                                <span key={f} className={`text-[6px] font-black uppercase tracking-wider px-1 py-0.5 ${t.sub}`}>{f}</span>
                            ))}
                        </div>
                        <div className={`mt-auto pt-2 flex items-center justify-between border-t ${t.border}`}>
                            <span className="text-[9px] font-black tracking-tighter" style={{ color: p.c }}>{p.amt}</span>
                            <span className={`text-[6px] font-black uppercase tracking-widest ${t.muted}`}>{p.tasks}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function AnalyticsMock({ t }: { t: any }) {
    const metrics = [
        { label: 'Revenue', value: '$25.1k', c: '#10b981' },
        { label: 'Active', value: '4', c: '#3b82f6' },
        { label: 'Hours', value: '312', c: '#f59e0b' },
        { label: 'Changes', value: '27', c: '#9333ea' },
    ]
    const fields = [
        { n: 'Frontend', v: 90 }, { n: 'Backend', v: 64 }, { n: 'Design', v: 52 },
        { n: 'DevOps', v: 31 }, { n: 'Copy', v: 18 },
    ]
    return (
        <div className={`h-full w-full ${t.bg} ${t.text} p-4 flex flex-col`}>
            <div className="text-[11px] font-black uppercase tracking-widest mb-3">Analytics Center</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
                {metrics.map((m) => (
                    <div key={m.label} className={`${t.panel} border ${t.border} p-2`}>
                        <div className={`text-[6px] font-black uppercase tracking-widest ${t.muted}`}>{m.label}</div>
                        <div className="text-base font-black tracking-tighter leading-none mt-1" style={{ color: m.c }}>{m.value}</div>
                    </div>
                ))}
            </div>
            <div className={`${t.panel} border ${t.border} p-3 flex-1 flex flex-col`}>
                <div className="text-[8px] font-black uppercase tracking-widest mb-3">Fields You Work In Most</div>
                <div className="flex items-end gap-3 flex-1">
                    {fields.map((f, i) => (
                        <div key={f.n} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <span className={`text-[7px] font-mono font-black ${t.muted}`}>{f.v}h</span>
                            <div className="w-full" style={{ height: `${f.v}%`, background: ['#3b82f6', '#10b981', '#f59e0b', '#9333ea', '#dc2626'][i] }} />
                            <span className="text-[6px] font-black uppercase tracking-wider">{f.n}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

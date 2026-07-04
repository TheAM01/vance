'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Flag, Clock, CalendarClock, AlertTriangle } from 'lucide-react'
import { ScheduledTask } from '@/lib/scheduler'
import { parseDateLocal } from '@/lib/date-utils'

const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }

function due(d?: string) {
    if (!d) return ''
    try { return parseDateLocal(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return d }
}

export function ScheduleTaskCard({
    item, onToggle, compact = false, showDescription = false,
}: {
    item: ScheduledTask
    onToggle: (s: ScheduledTask) => void
    compact?: boolean
    showDescription?: boolean
}) {
    const [busy, setBusy] = useState(false)
    const { task, projectColor, projectName, projectId, overdue, atRisk, done } = item
    const hours = Math.max(0.5, task.estimatedHours || 1)
    const pc = PRIORITY_COLOR[task.priority] || '#888'

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setBusy(true)
        try { await onToggle(item) } finally { setBusy(false) }
    }

    return (
        <div
            className={`group relative border-2 border-background bg-card transition-all ${done ? 'opacity-55' : 'shadow-sm hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground)/0.08)] hover:-translate-y-0.5'} ${busy ? 'opacity-40 pointer-events-none' : ''}`}
            style={{ borderLeftWidth: '5px', borderLeftColor: projectColor }}
        >
            <div className={`${compact ? 'p-2.5 gap-2' : 'p-3.5 gap-3'} flex flex-col`}>
                <div className="flex items-start justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                        <h4 className={`${compact ? 'text-[13px]' : 'text-sm'} font-black uppercase tracking-tight leading-snug ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                        </h4>
                        <Link
                            href={`/projects/${projectId}`}
                            onClick={e => e.stopPropagation()}
                            className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest hover:underline w-fit"
                            style={{ color: projectColor }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: projectColor }} />
                            <span className="truncate">{projectName}</span>
                        </Link>
                    </div>
                    <button
                        onClick={toggle}
                        title={done ? 'Mark as not done' : 'Mark done'}
                        className={`shrink-0 ${compact ? 'w-6 h-6' : 'w-7 h-7'} border-2 flex items-center justify-center transition-all ${done
                            ? 'bg-foreground border-foreground text-background'
                            : 'border-border hover:border-foreground hover:bg-foreground hover:text-background text-muted-foreground'}`}
                    >
                        <Check size={compact ? 13 : 15} strokeWidth={3} />
                    </button>
                </div>

                {showDescription && task.description && (
                    <p className="text-[11px] font-mono text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/30">
                    <span
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 border"
                        style={done ? { borderColor: 'hsl(var(--border))' } : { color: pc, borderColor: pc + '59', background: pc + '14' }}
                    >
                        <Flag size={10} /> {task.priority}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground">
                        <Clock size={10} /> {hours}h
                    </span>
                    {task.deadline && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground">
                            <CalendarClock size={10} /> {due(task.deadline)}
                        </span>
                    )}
                    {done ? (
                        <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-foreground/10 text-muted-foreground border border-border">Done</span>
                    ) : overdue ? (
                        <span className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30">
                            <AlertTriangle size={9} /> Overdue
                        </span>
                    ) : atRisk ? (
                        <span className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            <AlertTriangle size={9} /> At Risk
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

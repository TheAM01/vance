'use client'

import { X, Minus, Plus, SlidersHorizontal } from 'lucide-react'
import { Project } from '@/lib/types'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} className={`w-11 h-6 border-2 transition-colors flex items-center shrink-0 ${value ? 'bg-foreground border-foreground justify-end' : 'border-border justify-start'}`}>
            <span className={`w-4 h-4 m-0.5 ${value ? 'bg-background' : 'bg-muted-foreground'}`} />
        </button>
    )
}

export function PropertyPanel({
    open, onClose, projects, hidden, onToggleProject,
    hoursPerDay, setHoursPerDay, compact, setCompact, showCompleted, setShowCompleted,
}: {
    open: boolean
    onClose: () => void
    projects: Project[]
    hidden: string[]
    onToggleProject: (id: string) => void
    hoursPerDay: number
    setHoursPerDay: (n: number) => void
    compact: boolean
    setCompact: (v: boolean) => void
    showCompleted: boolean
    setShowCompleted: (v: boolean) => void
}) {
    // Only active projects produce scheduled tasks, so only they are worth filtering.
    const active = projects.filter(p => p.status === 'active')

    return (
        <>
            {open && <div className="fixed inset-0 bg-black/30 z-[105]" onClick={onClose} />}
            <aside
                className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l-2 border-border z-[106] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} />
                        <h2 className="text-sm font-black uppercase tracking-widest">View Options</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8">
                    {/* Project filter */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Show Projects</h3>
                        {active.length === 0 ? (
                            <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60">No active projects.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {active.map(p => {
                                    const visible = !hidden.includes(p._id)
                                    return (
                                        <button
                                            key={p._id}
                                            onClick={() => onToggleProject(p._id)}
                                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 border-2 transition-all text-left ${visible ? 'border-border bg-secondary/40' : 'border-dashed border-border/60 opacity-50'}`}
                                        >
                                            <span className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${visible ? '' : 'opacity-40'}`} style={{ borderColor: p.color, background: visible ? p.color : 'transparent' }} />
                                            <span className="text-xs font-bold uppercase tracking-tight truncate flex-1">{p.name}</span>
                                            <span className="font-mono text-[10px] text-muted-foreground shrink-0">{(p.tasks || []).filter(t => !t.completed).length}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Preferences */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preferences</h3>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-xs font-black uppercase tracking-tight">Hours / Day</div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">Daily capacity</div>
                            </div>
                            <div className="flex items-center border-2 border-border shrink-0">
                                <button onClick={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))} className="p-1.5 hover:bg-muted transition-colors"><Minus size={12} /></button>
                                <span className="px-2.5 text-sm font-black tabular-nums">{hoursPerDay}</span>
                                <button onClick={() => setHoursPerDay(hoursPerDay + 1)} className="p-1.5 hover:bg-muted transition-colors"><Plus size={12} /></button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-xs font-black uppercase tracking-tight">Compact Cards</div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">Tighter task cards</div>
                            </div>
                            <Toggle value={compact} onChange={setCompact} />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-xs font-black uppercase tracking-tight">Show Completed</div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">Keep done tasks visible</div>
                            </div>
                            <Toggle value={showCompleted} onChange={setShowCompleted} />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

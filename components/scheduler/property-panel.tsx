'use client'

import { X, Minus, Plus, SlidersHorizontal } from '@/components/ui/icons'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
            {open && <div className="fixed inset-0 z-[105] bg-foreground/20 backdrop-blur-sm" onClick={onClose} />}
            <aside
                className={cn(
                    'fixed right-0 top-0 z-[106] flex h-full w-80 max-w-[85vw] flex-col border-l border-border bg-card shadow-elevated transition-transform duration-300',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-muted-foreground" />
                        <h2 className="font-heading text-base font-semibold text-foreground">View options</h2>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                        <X />
                    </Button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto p-5">
                    {/* Project filter */}
                    <div className="space-y-3">
                        <Label className="text-muted-foreground">Show projects</Label>
                        {active.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No active projects.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {active.map(p => {
                                    const visible = !hidden.includes(p._id)
                                    return (
                                        <button
                                            key={p._id}
                                            onClick={() => onToggleProject(p._id)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors',
                                                visible ? 'border-border bg-card hover:bg-muted/60' : 'border-border/60 opacity-55 hover:opacity-80'
                                            )}
                                        >
                                            <span
                                                className="size-4 shrink-0 rounded-[5px] border"
                                                style={{ borderColor: p.color, background: visible ? p.color : 'transparent' }}
                                            />
                                            <span className="flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                                                {(p.tasks || []).filter(t => !t.completed).length}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Preferences */}
                    <div className="space-y-4">
                        <Label className="text-muted-foreground">Preferences</Label>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">Hours / day</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">Daily capacity</div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <Button variant="outline" size="icon-sm" onClick={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))} aria-label="Decrease hours">
                                    <Minus />
                                </Button>
                                <span className="w-8 text-center font-mono text-sm font-semibold tabular-nums">{hoursPerDay}</span>
                                <Button variant="outline" size="icon-sm" onClick={() => setHoursPerDay(hoursPerDay + 1)} aria-label="Increase hours">
                                    <Plus />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">Compact cards</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">Tighter task cards</div>
                            </div>
                            <Switch checked={compact} onCheckedChange={setCompact} />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">Show completed</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">Keep done tasks visible</div>
                            </div>
                            <Switch checked={showCompleted} onCheckedChange={setShowCompleted} />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

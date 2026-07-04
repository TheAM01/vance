'use client'

import React, { useState } from 'react'
import {
    ChevronRight, Hash, MoreVertical, Trash2, User, DollarSign, ListTodo,
} from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/lib/types'
import { formatMoney } from '@/lib/format'

const STATUS_LABEL: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    'on-hold': 'On Hold',
    cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
    active: 'text-blue-500',
    completed: 'text-green-500',
    'on-hold': 'text-amber-500',
    cancelled: 'text-red-500',
}

export function ProjectCard({ project, onChange }: { project: Project; onChange?: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const tasks = project.tasks || []
    const done = tasks.filter(t => t.completed || t.status === 'done').length
    const total = tasks.length

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(`CRITICAL ACTION: Permanently purge project "${project.name}" and all its tasks & changes. Confirm erasure?`)) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/projects/${project._id}`, { method: 'DELETE' })
            if (res.ok) onChange?.()
            else alert('Purge failed. System error.')
        } catch (err) {
            console.error(err)
            alert('Purge failed. Network error.')
        } finally {
            setIsDeleting(false)
            setIsMenuOpen(false)
        }
    }

    return (
        <div className="relative group/card h-full">
            <Link href={`/projects/${project._id}`} className="block h-full">
                <div
                    className="bg-white dark:bg-[#151515] rounded-none p-5 border border-border hover:border-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] h-full flex flex-col"
                    style={{ borderLeftWidth: '4px', borderLeftColor: project.color }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-10">
                            <h3 className="font-bold text-foreground text-base group-hover/card:text-primary transition-colors uppercase tracking-tight">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                                <Hash size={10} />
                                <span>{project.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fields */}
                    {project.fields?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.fields.slice(0, 4).map(f => (
                                <span key={f} className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-secondary text-secondary-foreground border border-border">
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    <div className="space-y-2.5 mb-4 pb-4 border-b border-border flex-1">
                        <div className="flex items-center gap-2 text-xs font-mono">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground uppercase truncate">{project.clientName || 'No client'} • {project.clientType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground uppercase">{formatMoney(project.amount, project.currency)} • {project.paid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                            <ListTodo className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground uppercase">{done}/{total} Tasks • {project.changes?.length || 0} Changes</span>
                        </div>
                        {total > 0 && (
                            <div className="w-full h-1.5 bg-muted/40 overflow-hidden">
                                <div className="h-full transition-all duration-500" style={{ width: `${Math.round((done / total) * 100)}%`, backgroundColor: project.color }} />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Status</p>
                            <p className={`text-xs font-mono font-bold uppercase tracking-tighter ${STATUS_COLOR[project.status] || 'text-foreground'}`}>
                                {STATUS_LABEL[project.status] || project.status}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary group-hover/card:translate-x-1 transition-transform">
                            Open
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Ellipsis Menu */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                    className={`p-2 rounded-none border transition-all ${isMenuOpen ? 'bg-foreground text-background border-foreground' : 'bg-card/80 backdrop-blur-sm border-border hover:border-foreground text-foreground'}`}
                >
                    <MoreVertical size={14} />
                </button>

                {isMenuOpen && (
                    <div className="mt-2 w-52 bg-card border border-border shadow-2xl p-1 z-50">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500 hover:text-white transition-all group/item"
                        >
                            <Trash2 size={14} className="text-red-500 group-hover/item:text-white transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Purge Project</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

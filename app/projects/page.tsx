'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, FolderKanban } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectFormModal, ProjectFormValues } from '@/components/projects/project-form-modal'
import { fetcher } from '@/lib/swr-fetcher'
import { Project, ProjectStatus } from '@/lib/types'

const FILTERS: { value: 'all' | ProjectStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
]

export default function ProjectsPage() {
    const { data: projects, mutate } = useSWR<Project[]>('/api/projects', fetcher)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filter, setFilter] = useState<'all' | ProjectStatus>('all')

    const handleCreate = async (values: ProjectFormValues) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })
        if (res.ok) {
            mutate()
            setIsModalOpen(false)
        } else {
            alert('Failed to create project')
        }
    }

    const filtered = (projects || []).filter(p => filter === 'all' || p.status === filter)

    const counts = (projects || []).reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="flex flex-col min-h-full">
            <Header title="Projects" subtitle="Every client engagement, end to end.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-foreground text-background hover:bg-background hover:text-foreground duration-200 transition-colors border-2 border-foreground font-bold text-sm uppercase tracking-wide h-10 rounded-sm"
                >
                    <Plus size={18} />
                    New Project
                </button>
            </Header>

            <div className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-8 w-full">
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {FILTERS.map(f => {
                        const count = f.value === 'all' ? (projects?.length || 0) : (counts[f.value] || 0)
                        const active = filter === f.value
                        return (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border-2 transition-all ${active ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}
                            >
                                {f.label} <span className="opacity-50 ml-1">{count}</span>
                            </button>
                        )
                    })}
                </div>

                {filtered.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(project => (
                            <ProjectCard key={project._id} project={project} onChange={mutate} />
                        ))}
                    </div>
                )}

                {projects && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 rounded-sm border-2 border-dashed border-border bg-card/30 text-center">
                        <div className="w-16 h-16 mb-4 flex items-center justify-center text-muted-foreground">
                            <FolderKanban className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black uppercase text-foreground mb-2">
                            {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
                        </h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wide max-w-sm mb-6">
                            Create your first project to start adding tasks, tracking changes and scheduling your work.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 rounded-sm border-2 border-foreground text-foreground uppercase font-bold text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
                        >
                            Add one now →
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ProjectFormModal
                    title="Create New Project"
                    submitLabel="Create Project"
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
        </div>
    )
}

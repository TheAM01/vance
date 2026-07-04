'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, FolderKanban } from '@/components/ui/icons'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
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
        <div className="flex min-h-full flex-col">
            <PageHeader
                title="Projects"
                description="Every client engagement, end to end."
                icon={FolderKanban}
            >
                <Button variant="highlight" onClick={() => setIsModalOpen(true)}>
                    <Plus />
                    New Project
                </Button>
            </PageHeader>

            <PageBody width="wide">
                {/* Status filter */}
                <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
                    {FILTERS.map(f => {
                        const count = f.value === 'all' ? (projects?.length || 0) : (counts[f.value] || 0)
                        const active = filter === f.value
                        return (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {f.label}
                                <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
                            </button>
                        )
                    })}
                </div>

                {!projects ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(project => (
                            <ProjectCard key={project._id} project={project} onChange={mutate} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={FolderKanban}
                        title={filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
                        description="Create your first project to start adding tasks, tracking changes and scheduling your work."
                        action={
                            <Button variant="highlight" onClick={() => setIsModalOpen(true)}>
                                <Plus />
                                New Project
                            </Button>
                        }
                    />
                )}
            </PageBody>

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

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Users } from '@/components/ui/icons'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { fetcher } from '@/lib/swr-fetcher'
import { Contact, Project } from '@/lib/types'
import { ContactCard } from '@/components/contacts/contact-card'
import { ContactFormModal, ContactFormValues } from '@/components/contacts/contact-form-modal'

export default function ContactsPage() {
    const { data: contacts, mutate } = useSWR<Contact[]>('/api/contacts', fetcher)
    const { data: projects } = useSWR<Project[]>('/api/projects', fetcher)

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Contact | null>(null)
    const [query, setQuery] = useState('')

    const projectList = projects || []

    const openCreate = () => { setEditing(null); setModalOpen(true) }
    const openEdit = (c: Contact) => { setEditing(c); setModalOpen(true) }
    const closeModal = () => { setModalOpen(false); setEditing(null) }

    const handleSubmit = async (values: ContactFormValues) => {
        const url = editing ? `/api/contacts/${editing._id}` : '/api/contacts'
        const method = editing ? 'PATCH' : 'POST'
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })
        if (res.ok) {
            mutate()
            closeModal()
        } else {
            alert(`Failed to ${editing ? 'update' : 'create'} contact`)
        }
    }

    const handleDelete = async (c: Contact) => {
        if (!confirm(`Delete contact "${c.name}"? This can't be undone.`)) return
        const res = await fetch(`/api/contacts/${c._id}`, { method: 'DELETE' })
        if (res.ok) mutate()
        else alert('Failed to delete contact')
    }

    const q = query.trim().toLowerCase()
    const filtered = (contacts || []).filter(c => {
        if (!q) return true
        return [c.name, c.company, c.email, c.role, c.relationship, c.location]
            .filter(Boolean)
            .some(v => v!.toLowerCase().includes(q))
    })

    return (
        <div className="flex min-h-full flex-col">
            <PageHeader title="Contacts" description="Clients, leads and everyone in your orbit.">
                <Button variant="highlight" onClick={openCreate}>
                    <Plus />
                    New Contact
                </Button>
            </PageHeader>

            <PageBody width="wide">
                {contacts && contacts.length > 0 && (
                    <div className="mb-6 max-w-sm">
                        <Input
                            placeholder="Search by name, company, email…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                )}

                {!contacts ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(contact => (
                            <ContactCard
                                key={contact._id}
                                contact={contact}
                                projects={projectList}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : contacts.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No contacts yet"
                        description="Add the people you work with — clients, leads, collaborators — and link them to your projects."
                        action={
                            <Button variant="highlight" onClick={openCreate}>
                                <Plus />
                                New Contact
                            </Button>
                        }
                    />
                ) : (
                    <EmptyState
                        icon={Users}
                        title="No matches"
                        description="No contacts match your search."
                    />
                )}
            </PageBody>

            {modalOpen && (
                <ContactFormModal
                    title={editing ? 'Edit Contact' : 'New Contact'}
                    submitLabel={editing ? 'Save changes' : 'Create Contact'}
                    initial={editing || undefined}
                    projects={projectList}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    )
}

'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Briefcase, Pencil, Trash2, FolderKanban } from '@/components/ui/icons'
import { Contact, Project } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { relationshipVariant } from '@/lib/contacts'
import { cn } from '@/lib/utils'

function initials(name: string) {
    const parts = name.trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || '?'
}

export function ContactCard({
    contact,
    projects,
    onEdit,
    onDelete,
}: {
    contact: Contact
    projects: Project[]
    onEdit: (c: Contact) => void
    onDelete: (c: Contact) => void
}) {
    const linked = (contact.projectIds || [])
        .map(id => projects.find(p => p._id === id))
        .filter((p): p is Project => !!p)

    const stop = (e: React.MouseEvent) => e.stopPropagation()

    return (
        <Card
            onClick={() => onEdit(contact)}
            className="group relative flex cursor-pointer flex-col gap-3 p-4 transition-all hover:border-primary/40 hover:shadow-elevated"
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: contact.color || '#2563eb' }}
                >
                    {initials(contact.name)}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-heading text-base font-semibold text-foreground">{contact.name}</h3>
                    {(contact.role || contact.company) && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                            <Briefcase className="size-3.5 shrink-0" />
                            <span className="truncate">
                                {[contact.role, contact.company].filter(Boolean).join(' · ')}
                            </span>
                        </p>
                    )}
                </div>

                {/* Hover actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={(e) => { stop(e); onEdit(contact) }}
                        aria-label="Edit contact"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        onClick={(e) => { stop(e); onDelete(contact) }}
                        aria-label="Delete contact"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {contact.relationship && (
                <div>
                    <Badge variant={relationshipVariant(contact.relationship)}>{contact.relationship}</Badge>
                </div>
            )}

            {/* Contact rows */}
            {(contact.email || contact.phone || contact.location) && (
                <div className="space-y-1.5 text-sm">
                    {contact.email && (
                        <a href={`mailto:${contact.email}`} onClick={stop} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                        </a>
                    )}
                    {contact.phone && (
                        <a href={`tel:${contact.phone}`} onClick={stop} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                            <Phone className="size-3.5 shrink-0" />
                            <span className="truncate">{contact.phone}</span>
                        </a>
                    )}
                    {contact.location && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{contact.location}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Associated projects */}
            {linked.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {linked.slice(0, 3).map(p => (
                        <Link
                            key={p._id}
                            href={`/projects/${p._id}`}
                            onClick={stop}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
                            <span className="max-w-[120px] truncate">{p.name}</span>
                        </Link>
                    ))}
                    {linked.length > 3 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                            <FolderKanban className="size-3" /> +{linked.length - 3}
                        </span>
                    )}
                </div>
            )}
        </Card>
    )
}

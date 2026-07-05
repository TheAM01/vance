'use client'

import { Menu, X } from '@/components/ui/icons'
import { Brand } from '@/components/layout/brand'

interface GlobalHeaderProps {
    isOpen: boolean
    onToggle: () => void
}

export function GlobalHeader({ isOpen, onToggle }: GlobalHeaderProps) {
    return (
        <header className="fixed left-0 right-0 top-0 z-[100] flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur md:hidden">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggle}
                    className="-ml-1 rounded-lg p-2 text-foreground transition-colors hover:bg-accent"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
                <Brand />
            </div>
            <div id="mobile-header-actions" className="flex items-center gap-2" />
        </header>
    )
}

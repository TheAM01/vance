'use client'

import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

interface GlobalHeaderProps {
    isOpen: boolean
    onToggle: () => void
}

export function GlobalHeader({ isOpen, onToggle }: GlobalHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/20 dark:bg-background/20 backdrop-blur-md z-[100] border-b border-border/10 md:hidden flex justify-between items-center px-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggle}
                    className="p-2 -ml-2 hover:bg-secondary rounded-sm transition-colors border border-transparent active:border-border"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <X className="w-5 h-5 text-foreground" />
                    ) : (
                        <Menu className="w-5 h-5 text-foreground" />
                    )}
                </button>
                <div className="flex flex-col">
                    <div className="text-sm leading-none">
                        <Logo />
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 leading-none">
                        Precision Freelance Ops
                    </div>
                </div>
            </div>
            <div id="mobile-header-actions" className="flex items-center" />
        </header>
    )
}

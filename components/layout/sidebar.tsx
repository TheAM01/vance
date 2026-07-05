'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    FolderKanban,
    CalendarRange,
    BarChart3,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Home,
} from '@/components/ui/icons'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Brand } from '@/components/layout/brand'
import { cn } from '@/lib/utils'

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

interface NavItem {
    label: string
    icon: React.ComponentType<{ className?: string }>
    href: string
}

const NAV: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/app' },
    { label: 'Schedule', icon: CalendarRange, href: '/schedule' },
    { label: 'Projects', icon: FolderKanban, href: '/projects' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
]

function NavLink({
    item,
    active,
    expanded,
    onNavigate,
}: {
    item: NavItem
    active: boolean
    expanded: boolean
    onNavigate: () => void
}) {
    const Icon = item.icon
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={!expanded ? item.label : undefined}
            className={cn(
                'group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                expanded ? 'gap-3' : 'justify-center',
                active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
            )}
        >
            {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-highlight" />
            )}
            <Icon className={cn('size-[18px] shrink-0', active ? 'text-sidebar-primary' : 'text-current')} />
            {expanded && <span className="truncate">{item.label}</span>}
        </Link>
    )
}

export function Sidebar({ isOpen: isMobileOpen, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [expanded, setExpanded] = useState(true)

    useEffect(() => {
        document.cookie = `sidebarOpen=${expanded}; path=/; max-age=31536000`
    }, [expanded])

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

    return (
        <>
            <aside
                className={cn(
                    'fixed left-0 top-0 z-[90] flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:static',
                    expanded ? 'md:w-64' : 'md:w-[72px]',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Brand + expand/collapse toggle — always lives in the header */}
                <div
                    className={cn(
                        'flex h-16 shrink-0 border-b border-sidebar-border px-4',
                        expanded
                            ? 'items-center justify-between'
                            : 'flex-col items-center justify-center gap-1'
                    )}
                >
                    <Brand collapsed={!expanded} className="text-sidebar-accent-foreground" />
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="hidden rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex"
                        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {expanded ? (
                            <PanelLeftClose className="size-[18px]" />
                        ) : (
                            <PanelLeftOpen className="size-[18px]" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                    {expanded && (
                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                            Workspace
                        </p>
                    )}
                    {NAV.map((item) => (
                        <NavLink
                            key={item.href}
                            item={item}
                            active={isActive(item.href)}
                            expanded={expanded}
                            onNavigate={onToggle}
                        />
                    ))}

                    <div className="my-2 h-px bg-sidebar-border" />

                    <NavLink
                        item={{ label: 'Settings', icon: Settings, href: '/settings' }}
                        active={isActive('/settings')}
                        expanded={expanded}
                        onNavigate={onToggle}
                    />
                </nav>

                {/* Footer */}
                <div className="flex flex-col gap-1 border-t border-sidebar-border p-3">
                    <Link
                        href="/"
                        onClick={onToggle}
                        title={!expanded ? 'Exit to home' : undefined}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            !expanded && 'justify-center px-2'
                        )}
                    >
                        <Home className="size-[18px] shrink-0" />
                        {expanded && <span>Exit to home</span>}
                    </Link>

                    <div className={cn('flex items-center gap-2', expanded ? 'justify-between' : 'flex-col')}>
                        <button
                            onClick={handleLogout}
                            title={!expanded ? 'Sign out' : undefined}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/15 hover:text-destructive',
                                !expanded && 'justify-center px-2'
                            )}
                        >
                            <LogOut className="size-[18px] shrink-0" />
                            {expanded && <span>Sign out</span>}
                        </button>
                        <ThemeToggle className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[80] bg-foreground/30 backdrop-blur-[1px] md:hidden" onClick={onToggle} />
            )}
        </>
    )
}

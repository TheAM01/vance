'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    FolderKanban,
    CalendarRange,
    BarChart,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Settings,
} from 'lucide-react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Logo } from '@/components/ui/logo'

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

const SidebarLink = ({ item, isSelected, isOpen, onToggle }: { item: any, isSelected: boolean, isOpen: boolean, onToggle: () => void }) => {
    return (
        <Link
            href={item.href}
            onClick={onToggle}
            className={`w-full flex text-xs items-center uppercase tracking-wide px-3 py-2 transition-all duration-200 group ${isSelected ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground font-extralight hover:bg-secondary border-dashed border border-border text-xs'
                } ${isOpen ? 'gap-2' : 'md:justify-center items-center'}`}
        >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className={`font-normal tracking-wide font-mono text-xs whitespace-nowrap ${!isOpen && "w-0"}`}>
                {isOpen ? item.label : " "}
            </span>
        </Link>
    )
}

export function Sidebar({ isOpen: isMobileOpen, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        document.cookie = `sidebarOpen=${isOpen}; path=/; max-age=31536000`
    }, [isOpen])

    const switchOpen = () => setIsOpen(!isOpen)

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const navItems = [
        { label: 'Schedule', icon: CalendarRange, href: '/schedule' },
        { label: 'Projects', icon: FolderKanban, href: '/projects' },
        { label: 'Dashboard', icon: LayoutDashboard, href: '/app' },
        { label: 'Analytics', icon: BarChart, href: '/analytics' },
        { label: 'Settings', icon: Settings, href: '/settings' },
    ]

    return (
        <>
            <aside
                className={`fixed md:static shrink-0 left-0 top-0 h-screen w-64 ${isOpen ? 'md:w-64' : 'md:w-[68px]'} bg-sidebar border-r border-border transition-all duration-300 z-[90] flex flex-col pt-16 md:pt-0
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                {/* Logo Section */}
                <div className={`p-4 md:flex hidden items-center ${isOpen ? 'justify-between' : 'justify-center'} relative min-h-[72px]`}>
                    <div className={`space-y-2 fade-in ${isOpen ? '' : 'md:hidden'}`}>
                        <div className="text-sm">
                            <Logo />
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50 whitespace-nowrap">
                            Precision Freelance Ops
                        </div>
                    </div>

                    <button
                        onClick={switchOpen}
                        className={`hover:bg-secondary hover:text-foreground rounded-md p-1 duration-150 cursor-pointer transition-all flex-shrink-0 ${isOpen ? "" : "absolute left-1/2 -translate-x-1/2"}`}
                    >
                        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 px-4 py-6 space-y-2 flex flex-col items-center`}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        return (
                            <SidebarLink
                                key={item.label}
                                item={item}
                                isSelected={isActive}
                                isOpen={isOpen}
                                onToggle={onToggle}
                            />
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-border space-y-3">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 ${isOpen ? '' : 'md:justify-center md:px-0'}`}
                    >
                        <LogOut size={14} className="flex-shrink-0" />
                        <span className={`whitespace-nowrap ${isOpen ? '' : 'md:hidden'}`}>Sign Out</span>
                    </button>
                    <div className={`flex items-center justify-between px-2 pt-2 border-t border-border/10 ${isOpen ? '' : 'md:justify-center'}`}>
                        <span className={`text-[10px] uppercase font-black tracking-widest text-muted-foreground whitespace-nowrap ${isOpen ? '' : 'md:hidden'}`}>Appearance</span>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[80] md:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    )
}

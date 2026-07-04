'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { GlobalHeader } from '@/components/layout/global-header'
import { usePathname } from 'next/navigation'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'
    const isLandingPage = pathname === '/'

    // Landing page — standalone, no sidebar, but CAN scroll
    if (isLandingPage) {
        return <>{children}</>
    }

    // Login page — fixed height, no sidebar
    if (isLoginPage) {
        return (
            <div className="min-h-screen h-screen overflow-hidden bg-background text-foreground">
                <main className="h-full">{children}</main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen h-screen overflow-hidden bg-background text-foreground">
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <GlobalHeader isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 flex flex-col overflow-y-auto pt-14 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    )
}

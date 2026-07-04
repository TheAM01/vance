'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { GlobalHeader } from '@/components/layout/global-header'
import { usePathname } from 'next/navigation'
import { useTexture } from '@/components/theme/texture-provider'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { texture } = useTexture()
    const isLoginPage = pathname === '/login'
    const isLandingPage = pathname === '/'

    // Landing page — standalone, no sidebar, but CAN scroll
    if (isLandingPage) {
        return <>{children}</>
    }

    // Login page — fixed height, no sidebar
    if (isLoginPage) {
        return (
            <div className={`min-h-screen bg-background text-foreground h-screen overflow-hidden texture-${texture}`}>
                <main className="h-full">
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className={`flex min-h-screen bg-background text-foreground h-screen overflow-hidden texture-${texture}`}>
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <GlobalHeader isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 flex flex-col overflow-y-auto pt-16 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
